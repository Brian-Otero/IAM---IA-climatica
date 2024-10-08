import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ImagePickerResponse } from 'react-native-image-picker';
type RootStackParamList = {
  Takepic: undefined;
  CameraHome: { photo: ImagePickerResponse } | undefined;
};
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CameraHome'>;
  route: RouteProp<RootStackParamList, 'CameraHome'>;
};
function CameraHome({ route, navigation }: Props) {
  const [photo, setPhoto] = useState(route.params?.photo);
  const photoUri = photo?.assets?.[0]?.uri;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Cámara</Text>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
        />
      ) : (
        <Text style={styles.noFotoText}>No hay foto disponible</Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Takepic')}
      >
        <Text style={styles.buttonText}>Tomar otra Foto</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    marginBottom: 20,
  },
  photo: {
    width: '80%',
    height: '80%',
    borderRadius: 10,
    borderColor: '#5C6BC0',
    borderWidth: 2,
    marginBottom: 20,
  },
  noFotoText: {
    fontSize: 18,
    color: '#5C6BC0',  
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5C6BC0', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
export default CameraHome;