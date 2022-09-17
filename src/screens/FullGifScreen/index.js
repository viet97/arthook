import React, { Component } from 'react'
import {
    Image,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { SVG } from '../../../assets/svg'
import NavigationService from '../../navigation/NavigationService'

import { Colors } from '../../themes/Colors'
import Share from 'react-native-share'

export default class FullGifScreen extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <View
            style={styles.container}>
            <View
                style={styles.imageConatienr}>
                <Image
                    resizeMode={"contain"}
                    style={{
                        flex: 1,
                    }}
                    source={{ uri: this.props.route?.params?.uri }} />
            </View>
            <Pressable
                onPress={() => NavigationService.getInstance().goBack()}
                style={styles.back}
                hitSlop={16}>
                <SVG.close />
            </Pressable>
            {this.props.route?.params?.hasShare ? <Pressable
                onPress={() => {
                    Share.open({ url: this.props.route?.params?.uri })
                        .catch((e) => console.error("ShareErr", e))
                }}
                style={styles.share}>
                <SVG.share width={30} height={30} />
            </Pressable> : false}
        </View>
    }
}


const styles = StyleSheet.create({
    share: {
        position: 'absolute',
        top: 24,
        right: 16
    },
    back: {
        position: "absolute",
        top: 20,
        left: 16
    },
    imageConatienr: {
        marginVertical: 20,
        borderRadius: 24,
        overflow: 'hidden',
        flex: 1
    },
    container: {
        backgroundColor: Colors.black,
        flex: 1,
    }
})