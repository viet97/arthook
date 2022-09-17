import AlbumScreen from "../screens/AlbumScreen";
import FullGifScreen from "../screens/FullGifScreen";
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
  FULL_GIF_SCREEN: {
    title: 'FullGif',
    name: 'FullGifScreen',
    component: FullGifScreen,
  },
};
