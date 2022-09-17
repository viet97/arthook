import { cloneDeep, size } from 'lodash'
import React, { Component } from 'react'
import {
    StyleSheet,
    NativeModules,
    View,
    ImageBackground,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { Images } from '../../../assets/image'
import { SVG } from '../../../assets/svg'
import Text from '../../components/Text'
import { Colors } from '../../themes/Colors'
import { widthWindow } from '../../utils/DeviceUtil'
import ImagePicker from 'react-native-image-crop-picker';
import moment from "moment"
import NavigationService from '../../navigation/NavigationService'
import { ROUTER_NAME } from '../../navigation/NavigationConst'
import { checkWriteFilePermission, savePhotoToAlbum } from '../../utils/PhotoUtil'
const {
    generateGif,
    showToast
} = NativeModules.AndroidUtils

export default class HomeScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            listImages: []
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
            marginRight: (index + 1) % 3 ? this.itemMargin : 0,
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
        </View>
    }
}


const styles = StyleSheet.create({
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