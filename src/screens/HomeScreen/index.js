import { size } from 'lodash'
import React, { Component } from 'react'
import {
    StyleSheet,
    NativeModules,
    View,
    ImageBackground,
    Pressable,
    FlatList,
    Image
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { Images } from '../../../assets/image'
import { SVG } from '../../../assets/svg'
import Text from '../../components/Text'
import { cameraPermissionError, permissionError } from '../../Define'
import { Colors } from '../../themes/Colors'
import { widthWindow } from '../../utils/DeviceUtil'
import ImagePicker from 'react-native-image-crop-picker';

const {
    generateGif,
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

    renderImage = ({ item, index }) => {
        const dynamicStyle = {
            marginTop: this.itemMargin,
            marginRight: (index + 1) % 3 ? this.itemMargin : 0,
            width: this.itemWidth,
            height: this.itemHeight,
        }
        return (
            <Pressable
                onPress={() => alert("click")}>
                <Image
                    source={{ uri: item.uri || item.path }}
                    style={[{
                        borderRadius: 16,
                    }, dynamicStyle]}
                />
            </Pressable>
        )
    }

    renderListImages = () => {
        const { listImages } = this.state
        return <FlatList
            numColumns={3}
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

    render() {
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
                            // const path = await generateGif(res.assets[0].uri, "test2.gif")
                            // console.log("generateGif", path)
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
                hitSlop={16}
                onPress={() => {
                    ImagePicker.openCamera({ cameraType: 'back', compressImageQuality: 0.8, includeBase64: true })
                        .then(async res => {
                            this.setState({ listImages: [res, ...this.state.listImages] })
                            // const path = await generateGif(res.path, "test3.gif")
                            // console.log("generateGif", path)
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