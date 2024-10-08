import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet, Alert, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
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
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Tomar Foto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E1E3F3',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#3C3C3C',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
})

export default Takepic;
