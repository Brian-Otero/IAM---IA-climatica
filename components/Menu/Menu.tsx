import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Loading from '../Loading/Loading';
import { StackScreenProps } from '@react-navigation/stack';

type RootStackParamList = {
  Menu: undefined;
  Mapa: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'Menu'>;

const Menu: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerTitle}>
        <Text style={styles.header}>INSTITUTO DE ASTRONOMÍA Y METEOROLOGÍA</Text>
        <Text style={styles.subHeader}>IA CLIMÁTICA</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Mapa')}
        >
          <Image
            source={require('./assets/map-icon.png')}
            style={styles.buttonImage}
          />
          <Text style={styles.buttonText}>MAPA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Image
            source={require('./assets/camera-icon.png')}
            style={styles.buttonImage}
          />
          <Text style={styles.buttonText}>CÁMARA IA</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text>Universidad de Guadalajara</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#abb5ed',
  },

  containerTitle: {
    backgroundColor: '#e6e6ff',
    width: '100%',
  },

  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
    width: '97%',
  },

  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: 'black',
  },

  buttonContainer: {
    width: '80%',
    justifyContent: 'space-around',
  },

  button: {
    backgroundColor: '#4f5f96',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 40,
    flexDirection: 'column',
  },

  buttonImage: {
    width: 150,
    height: 140,
    marginRight: 10,
  },

  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default Menu;
