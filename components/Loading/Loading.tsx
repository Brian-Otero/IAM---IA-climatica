import React from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';

const Loading: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('./assets/cloud-icon.png')}
                style={styles.customIcon}
            />
            
            <ActivityIndicator size="large" color="#4f5f96" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#abb5ed',
    },
    customIcon: {
        width: 100,  
        height: 100,
        marginBottom: 20,
    },
})

export default Loading;
