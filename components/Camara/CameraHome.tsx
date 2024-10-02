import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ImagePickerResponse } from 'react-native-image-picker';

type RootStackParamList = {
  Takepic: undefined;
  CameraHome: { photo: ImagePickerResponse };
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
          style={{ width: 300, height: 300 }}
        />
      ) : (
        <Text>No hay foto disponible</Text>
      )}
      <Button
        title="Tomar otra Foto"
        onPress={() => navigation.navigate('Takepic')}
      />
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
  photoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
  },
  info: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default CameraHome;
