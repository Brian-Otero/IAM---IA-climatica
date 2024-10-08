import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform, TouchableOpacity, Image } from 'react-native';
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
      <Image source={require('./assets/iam_leyenda.png')} style={styles.logo} />
      <Text style={styles.title}>Pantalla para Tomar Foto</Text>
      <Image source={require('./assets/nubes-estilo-fotorrealista.png')} style={styles.photoLogo} />
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
    backgroundColor: '#5C6BC0',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0f1124',
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
  photoLogo: {
    width: '55%',
    height: '55%',
    borderRadius: 10,
    borderColor: '#5C6BC0',
    borderWidth: 2,
    marginBottom: 20,
  },
  logo: {
    width: '80%',
    height: '10%',
    resizeMode: 'contain',
    marginRight: 5,
  },
})

export default Takepic;
