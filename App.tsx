import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import Menu from './components/Menu/Menu';
import Mapa from './components/Mapa/Mapa';
import Takepic from './components/Camara/Takepic.tsx';
import CameraHome from './components/Camara/CameraHome.tsx';

type RootStackParamList = {
  Menu: undefined;
  Mapa: undefined;
  CameraHome: undefined;
  Takepic: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Mapa" component={Mapa} />
        <Stack.Screen name="CameraHome" component={CameraHome} />
        <Stack.Screen name="Takepic" component={Takepic} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
