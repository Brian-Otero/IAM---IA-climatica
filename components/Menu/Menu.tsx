import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Menu: React.FC = () => {
    return (
        <View style={styles.container}>
            <View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccccff', 
    },

    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },

    subHeader: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
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