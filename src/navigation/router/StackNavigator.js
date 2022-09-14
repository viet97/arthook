import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTER_NAME } from '../NavigationConst';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      headerMode={'none'}
      mode={'card'}
      screenOptions={{
        header: null,
        cardOverlayEnabled: true,
        cardShadowEnabled: false,
        animationEnabled: true,
        gestureDirection: 'horizontal',
      }}
      initialRouteName={ROUTER_NAME.HOME.name}>
      {Object.values(ROUTER_NAME).map(screen => {
        return <Stack.Screen key={screen.name} {...screen} />;
      })}
    </Stack.Navigator>
  );
};

export { AppStack };
