import React from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';

const Loading: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('./assets/logo_iam_m20_oarp.png')}
                style={styles.cloudIcon}
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
    cloudIcon: {
        width: 300,  
        height: 300,
        marginBottom: 20,
    },
})

export default Loading;
