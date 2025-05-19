import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  MainApp: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Profile: undefined;
  'APS Calculator': undefined;
  Explore: undefined;
  Info: undefined;
};

export default function NavigationTypes() {
  return null;
} 