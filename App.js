
import React, { Component } from 'react'
import { Colors } from './src/themes/Colors';
import AppNavigation from './src/navigation/AppNavigation'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default class App extends Component {
  render() {
    return (
      <SafeAreaView edges={['right', 'bottom', 'left', 'top']} style={{ flex: 1, backgroundColor: Colors.white }}>
        <SafeAreaProvider>
          <StatusBar
            hidden={false}
            barStyle={'light-content'}
            translucent
            backgroundColor={Colors.black}
          />
          <AppNavigation />
        </SafeAreaProvider>
      </SafeAreaView>
    )
  }
}


