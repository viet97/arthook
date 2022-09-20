import { cloneDeep, size, trim } from 'lodash'
import React, { Component } from 'react'
import {
    StyleSheet,
    NativeModules,
    View,
    ImageBackground,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator,
    TextInput
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { Images } from '../../../assets/image'
import { SVG } from '../../../assets/svg'
import Text from '../../components/Text'
import { Colors } from '../../themes/Colors'
import { widthWindow } from '../../utils/DeviceUtil'
import ImagePicker from 'react-native-image-crop-picker';
import NavigationService from '../../navigation/NavigationService'
import { ROUTER_NAME } from '../../navigation/NavigationConst'
import { checkWriteFilePermission, savePhotoToAlbum } from '../../utils/PhotoUtil'
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GIF_FREE_COUNT_KEY, MAX_FREE_GIF, PREMIUM_CODE, PREMIUM_KEY } from '../../Define'

const {
    generateGif,
    showToast
} = NativeModules.AndroidUtils

export default class HomeScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            listImages: [],
            code: "",
            showPremiumModal: false
        }
        this.numColumns = 2;
        this.itemMargin = 16;
        this.listMargin = 4
        this.listWidth = widthWindow - this.listMargin * 2
        this.itemWidth = (this.listWidth - this.itemMargin * (this.numColumns - 1)) / this.numColumns
        this.itemHeight = this.itemWidth * 290 / 166
        this.isCreating = false
    }


    renderBottom = () => {
        return (
            <View
                pointerEvents={"none"}>
                <ImageBackground
                    source={Images.bottom_linear}
                    resizeMode={"stretch"}
                    style={styles.bottom} />
            </View>
        )
    }

    renderHeader = () => {
        return (
            <View
                style={styles.header}
                pointerEvents={"none"}>
                <ImageBackground
                    source={Images.top_linear}
                    resizeMode={"stretch"}
                    style={StyleSheet.absoluteFill} />
            </View>
        )
    }
    deleteImage = index => {
        const { listImages } = this.state
        const cloneDeepImages = cloneDeep(listImages)
        if (size(cloneDeepImages) > index) {
            cloneDeepImages.splice(index, 1)
            this.setState({ listImages: cloneDeepImages })
        }
    }

    renderImage = ({ item, index }) => {
        const dynamicStyle = {
            marginTop: this.itemMargin,
            marginRight: (index + 1) % this.numColumns ? this.itemMargin : 0,
            width: this.itemWidth,
            height: this.itemHeight,
        }
        return (
            <Pressable
                style={[styles.image, dynamicStyle]}
                onPress={() => {
                    NavigationService.getInstance().navigate({
                        routerName: ROUTER_NAME.FULL_GIF_SCREEN.name,
                        params: {
                            uri: item.uri || item.path
                        }
                    })
                }}>
                <Image
                    source={{ uri: item.uri || item.path }}
                    style={{
                        width: this.itemWidth,
                        height: this.itemHeight,
                    }}
                />
                <Pressable
                    onPress={() => this.deleteImage(index)}
                    hitSlop={16}
                    style={styles.deleteImage}>
                    <SVG.close width={16} height={16} />
                </Pressable>
            </Pressable>
        )
    }

    renderListImages = () => {
        const { listImages, isLoading } = this.state
        if (isLoading) {
            return (
                <View
                    style={styles.indicatorContainer}>
                    <ActivityIndicator
                        size={"large"}
                        style={styles.indicator}
                        color={Colors.white} />
                    <Text
                        semiBold
                        style={styles.creatingGif}>Creating GIF...</Text>

                </View>
            )
        }

        if (!size(listImages)) {
            return <View
                style={styles.placeholderContainer}>
                <Text
                    semiBold
                    style={styles.placeHolder}>Welcome to Arthook</Text>
                <Text
                    semiBold
                    style={[styles.placeHolder, { marginTop: 4 }]}>Please select photos to create gif...</Text>
            </View>
        }

        return <FlatList
            numColumns={this.numColumns}
            data={listImages}
            style={{
                flex: 1,
                paddingHorizontal: this.listMargin
            }}
            keyExtractor={(item, index) => (item.uri || item.path) + index}
            contentContainerStyle={styles.listContentContainerStyle}
            renderItem={this.renderImage}
        />
    }

    componentDidMount() {
        checkWriteFilePermission()
        AsyncStorage.getItem(PREMIUM_KEY).then(isPremium => {
            if (!isPremium) {
                this.setState({ showPremiumModal: true })
            }
        })
    }

    render() {
        const { listImages } = this.state
        return <View
            style={styles.container}>
            {this.renderListImages()}
            {this.renderBottom()}
            {this.renderHeader()}
            <Pressable
                onPress={() => {
                    launchImageLibrary({
                        mediaType: "photo",
                        includeExtra: false,
                        selectionLimit: 0
                    }).then(async res => {
                        if (size(res.assets)) {
                            const { listImages } = this.state
                            this.setState({ listImages: [...res.assets, ...listImages] })
                        }
                    }).catch(e => {
                        console.error("launchImageLibrary: " + e)
                        // setTimeout(() => {
                        //     if (e?.code === permissionError) {

                        //     }
                        // }, 500);
                    });
                }}
                style={styles.addPhotos}>
                <SVG.add_photo />
            </Pressable>
            <Pressable
                onPress={() => {
                    NavigationService.getInstance().navigate({
                        routerName: ROUTER_NAME.ALBUM.name
                    })
                }}
                style={styles.myAlbum}>
                <SVG.my_album />
            </Pressable>
            <Pressable
                onPress={async () => {
                    if (this.isCreating) {
                        return showToast("GIF is creating, please wait...")
                    }

                    if (size(this.state.listImages) < 2) {
                        return showToast("Please select at least 2 photos.")
                    }
                    if (size(this.state.listImages) > 5) {
                        return showToast("Only support max 5 photos per time.")
                    }
                    try {
                        this.isCreating = true;
                        const urisString = listImages.map(it => {
                            if (it.uri) return it.uri
                            return `from_camera${it.path}`
                        }).join(",")
                        this.setState({
                            isLoading: true,
                            listImages: []
                        })
                        const path = await generateGif(urisString, `arthook_${Date.now()}.gif`)
                        if (path) {
                            this.gifCreatedCount += 1
                            AsyncStorage.setItem(GIF_FREE_COUNT_KEY, `${this.gifCreatedCount}`)
                            savePhotoToAlbum(path)
                            NavigationService.getInstance().navigate({
                                routerName: ROUTER_NAME.FULL_GIF_SCREEN.name,
                                params: {
                                    uri: path,
                                    hasShare: true
                                }
                            })
                        }
                    } catch (e) {
                        console.error(e)
                    }
                    this.setState({ isLoading: false })
                    this.isCreating = false;

                }}
                style={styles.convert}>
                <SVG.convert />
            </Pressable>
            <Pressable
                hitSlop={16}
                onPress={() => {
                    ImagePicker.openCamera({ cameraType: 'back', compressImageQuality: 0.8 })
                        .then(async res => {
                            this.setState({ listImages: [res, ...this.state.listImages] })
                        })
                        .catch(e => {
                            console.error("openCamera: " + e)
                            // setTimeout(() => {
                            //     if (e?.code === cameraPermissionError) {
                            //         alert("Permission")
                            //     }
                            // }, 500);
                        });
                }}
                style={styles.camera}>
                <SVG.camera />
            </Pressable>
            <Modal
                avoidKeyboard
                useNativeDriver
                style={[
                    styles.modalContainer,
                ]}
                isVisible={this.state.showPremiumModal}>
                <View
                    style={styles.modalContent}>
                    <Image
                        source={Images.premium}
                        style={styles.premiumBackground} />
                    <View
                        style={styles.topLine} />
                    <Text
                        style={styles.premiumRequired}
                        bold>
                        Premium Required
                    </Text>
                    <Text
                        style={styles.premiumDes}
                        semiBold>
                        Enter code here to continue using Arthook and get unlimited features:
                    </Text>
                    <Text
                        style={styles.unlimitedFeatures}
                        semiBold>
                        - Unlimited Gifs.{"\n"}
                        - Gif with best quality.{"\n"}
                    </Text>
                    <TextInput
                        value={this.state.code}
                        onChangeText={code => this.setState({ code })}
                        style={styles.codeInput}
                        placeholder={"Enter code here..."}
                    />
                    <Pressable
                        onPress={() => {
                            const { code } = this.state
                            if (this.isLoading) return
                            if (!trim(this.state.code)) {
                                return showToast("Code is required.")
                            }
                            if (trim(code) === PREMIUM_CODE) {
                                this.loadingCode = true;
                                this.setState({ loadingCode: true })
                                AsyncStorage.setItem(PREMIUM_KEY, `premium`)
                                setTimeout(() => {
                                    this.setState({
                                        loadingCode: false,
                                        buttonText: "Success"
                                    })
                                    setTimeout(() => {
                                        this.setState({ showPremiumModal: false })
                                        this.loadingCode = false;
                                    }, 1000)
                                }, 2000)
                                return
                            }
                            showToast("Code is invalid.")
                        }}
                        style={styles.submitButton}>
                        {!this.state.loadingCode ? <Text
                            semiBold
                            style={styles.submit}>
                            {this.state.buttonText || "Submit"}
                        </Text> : <ActivityIndicator size={'small'} color={Colors.white} />}
                    </Pressable>
                </View>
            </Modal>
        </View>
    }
}


const styles = StyleSheet.create({
    premiumBackground: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    },
    unlimitedFeatures: {
        fontSize: 13,
        color: "#e2e8ee",
        marginHorizontal: 24
    },
    submit: {
        fontSize: 15,
        color: Colors.white
    },
    submitButton: {
        marginTop: 16,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        borderRadius: 16,
        backgroundColor: "#6366f1",
        marginBottom: 32
    },
    codeInput: {
        height: 40,
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f1f4f9'
    },
    premiumDes: {
        fontSize: 14,
        marginHorizontal: 24,
        marginTop: 16,
        color: "#e2e8ee",
    },
    premiumRequired: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 8,
        color: Colors.white
    },
    topLine: {
        marginTop: 12,
        backgroundColor: "#e2e8ee",
        width: 40,
        height: 6,
        borderRadius: 12,
        alignSelf: 'center'
    },
    modalContainer: {
        flex: 1,
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        overflow: "hidden"
    },
    placeHolder: {
        color: Colors.white
    },
    placeholderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    indicatorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    indicator: {
        marginBottom: 16
    },
    creatingGif: {
        color: Colors.white,
        fontSize: 16
    },
    deleteImage: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'black',
        padding: 4,
        borderRadius: 200
    },
    image: {
        borderRadius: 16,
        overflow: 'hidden'
    },
    myAlbum: {
        position: 'absolute',
        bottom: 29,
        right: 52
    },
    convert: {
        position: 'absolute',
        bottom: 29,
        left: 52
    },
    done: {
        position: 'absolute',
        top: 24,
        right: 16,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 53,
        paddingHorizontal: 16,
        backgroundColor: Colors.white
    },
    container: {
        backgroundColor: Colors.black,
        flex: 1
    },
    addPhotos: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center'
    },
    camera: {
        position: 'absolute',
        left: 18,
        top: 24,
    },
    listContentContainerStyle: {
        paddingBottom: 160
    },
    bottom: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        height: 160,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    header: {
        flexDirection: "row",
        paddingHorizontal: 18,
        height: 160,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
})