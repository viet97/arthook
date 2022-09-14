import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppStack } from './router/StackNavigator';
import NavigationService from './NavigationService';

export const navigationRef = null
class AppNavigator extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayName = 'AppNavigator';
  }
  componentDidMount() {
    NavigationService.getInstance(this.navigation);
  }
  componentWillUnmount() {
    NavigationService.clear();
  }

  getActiveRouteName = state => {
    const route = state.routes[state.index];

    if (route.state) {
      // Dive into nested navigators
      return this.getActiveRouteName(route.state);
    }

    return route.name;
  };

  _onStateChange = async state => {
    // const previousRouteName = this.navigation.getCurrentRoute();
    // const currentRouteName = this.getActiveRouteName(state);
  };

  render() {
    return (
      <NavigationContainer
        ref={ref => (this.navigation = ref)}
        {...this.props}
        onStateChange={this._onStateChange}>
        <AppStack />
      </NavigationContainer>
    );
  }
}

export default AppNavigator;
