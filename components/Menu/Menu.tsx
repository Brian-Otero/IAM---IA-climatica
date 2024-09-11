import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Menu: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.containerTitle}>
                <Text style={styles.header}>INSTITUTO DE ASTRONOMÍA Y METEOROLOGÍA</Text>
                <Text style={styles.subHeader}>IA CLIMATICA</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Image
                        source={require('./assets/map-icon.png')} // Ruta de la imagen local
                        style={styles.buttonImage}
                    />
                    <Text style={styles.buttonText}>MAPA</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Image
                        source={require('./assets/camera-icon.png')} // Ruta de la imagen local
                        style={styles.buttonImage}
                    />
                    <Text style={styles.buttonText}>CAMARA IA</Text>
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
        backgroundColor: '#ccccff',
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
        backgroundColor: '#8080ff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: 'column',
    },

    buttonImage: {
        width: 110,
        height: 110,
        marginRight: 10,
    },

    buttonText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default Menu;