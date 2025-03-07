import React from 'react'
import { View, Text, Image, StyleSheet, Linking } from 'react-native'

export function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.gif')}
        style={styles.logo}
      />
      <Text style={styles.title}>Previsão do Tempo</Text>
      <Text style={styles.description}>
        O aplicativo utiliza a API do{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('https://openweathermap.org/')}
        >
          OpenWeatherMap
        </Text>{' '}
        para obter as previsões do tempo.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    maxWidth: '100%',
    width: '100%',
    textAlign: 'center',
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 32,
    marginBottom: 5,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  link: {
    fontWeight: '600',
    color: '#FFA500',
  },
})
