import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
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

async function requestCameraPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso para usar la cámara',
          message: 'La aplicación necesita acceso a tu cámara',
          buttonNeutral: 'Preguntar luego',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}

function Takepic({ navigation }: Props) {
  useEffect(() => {
    requestCameraPermission(); // Solicitar permiso al montar el componente
  }, []);

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permiso denegado', 'No se puede acceder a la cámara sin permiso');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
      },
      (response) => {
        if (response && !response.didCancel && response.assets) {
          navigation.navigate('CameraHome', { photo: response });
        } else {
          Alert.alert('Error', 'No se pudo abrir la cámara');
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
