import React, { Component } from 'react'
import {
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { SVG } from '../../../assets/svg'
import Text from '../../components/Text'
import NavigationService from '../../navigation/NavigationService'

import { Colors } from '../../themes/Colors'
import { widthWindow } from '../../utils/DeviceUtil'

export default class AlbumScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listImages: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},]
        }
        this.numColumns = 4;
        this.itemMargin = 2;
        this.listMargin = 4
        this.listWidth = widthWindow - this.listMargin * 2
        this.itemWidth = (this.listWidth - this.itemMargin * (this.numColumns - 1)) / this.numColumns
        this.itemHeight = this.itemWidth
    }

    renderHeader = () => {
        return <View
            style={styles.back}>
            <Pressable
                onPress={() => NavigationService.getInstance().goBack()}
                hitSlop={16}>
                <SVG.back />
            </Pressable>

            <Text
                semiBold
                style={styles.title}>
                Album
            </Text>
            <View
                style={styles.fakeView} />
        </View>
    }

    renderItem = ({ item, index }) => {
        const dynamicStyle = {
            marginTop: this.itemMargin,
            marginRight: (index + 1) % this.numColumns ? this.itemMargin : 0,
            width: this.itemWidth,
            height: this.itemHeight,
        }
        return (
            <Pressable
                style={[styles.gif, dynamicStyle]}>

            </Pressable>
        )
    }

    renderList = () => {
        const { listImages } = this.state
        return (
            <View
                style={{
                    flex: 1,
                    marginHorizontal: this.listMargin,
                    marginBottom: 16,
                }}>
                <FlatList
                    numColumns={this.numColumns}
                    style={{
                        flex: 1,
                    }}
                    data={listImages}
                    renderItem={this.renderItem} />
            </View>
        )
    }

    render() {
        return <View
            style={styles.container}>
            {this.renderHeader()}
            {this.renderList()}
        </View>
    }
}


const styles = StyleSheet.create({
    fakeView: {
        width: 24
    },
    title: {
        fontSize: 16,
        color: Colors.white
    },
    back: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'center',
    },
    gif: {
        backgroundColor: 'red',
        borderRadius: 8
    },
    container: {
        backgroundColor: Colors.black,
        flex: 1
    }
})