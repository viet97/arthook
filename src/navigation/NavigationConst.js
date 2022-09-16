import AlbumScreen from "../screens/AlbumScreen";
import HomeScreen from "../screens/HomeScreen";

export const ROUTER_NAME = {
  HOME: {
    title: 'Home',
    name: 'HomeScreen',
    component: HomeScreen,
  },
  ALBUM: {
    title: 'Album',
    name: 'AlbumScreen',
    component: AlbumScreen,
  },
};
