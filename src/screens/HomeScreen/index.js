import React, { Component } from 'react'
import {
    StyleSheet,
    NativeModules,

} from 'react-native'
import Text from '../../components/Text'

const {
} = NativeModules.AndroidUtils

export default class HomeScreen extends Component {
    render() {
        return <Text bold>123123131231212</Text>
    }
}


const styles = StyleSheet.create({
})