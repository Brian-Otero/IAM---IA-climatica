import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Loading from '../Loading/Loading';

const Menu: React.FC = () => {
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
                <Image source={require('./assets/IAM-logo-rojo.png')} style={styles.logo} />
                <View style={styles.textContainer}>
                    <Text style={styles.header}>INSTITUTO DE ASTRONOMÍA Y METEOROLOGÍA</Text>
                    <Text style={styles.subHeader}>IA CLIMATICA</Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
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
        backgroundColor: '#abb5ed',
    },

    containerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6e6ff',
        width: '100%',
        paddingVertical: 10, 
        paddingHorizontal: 50, 
        marginBottom: 10, 
    },

    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginRight: 5,
    },

    textContainer: {
        flex: 1,
    },

    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },

    subHeader: {
        fontSize: 14, 
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
