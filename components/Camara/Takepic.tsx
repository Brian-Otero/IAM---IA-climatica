import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Takepic: undefined;
  CameraHome: { photo: ImagePickerResponse };
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Takepic'>;
  route: RouteProp<RootStackParamList, 'Takepic'>;
};

function Takepic({ navigation }: Props) {
  const takePicture = () => {
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
      },
      (response) => {
        if (response && !response.didCancel && response.assets) {
          navigation.navigate('CameraHome', { photo: response });
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla para Tomar Foto</Text>
      <Button title="Tomar Foto" onPress={takePicture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default Takepic;
