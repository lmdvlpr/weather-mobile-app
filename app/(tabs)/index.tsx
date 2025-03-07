import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { useUserLocation } from '../../hooks/useUserLocation'
import { fetchWeather, fetchWeatherForecast } from '../../services/fetchWeather'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { Header } from '@/components/Header'

interface WeatherData {
  name: string
  weather: { icon: string; description: string }[]
  main: { temp: number }
}

interface ForecastData {
  dayOfWeek: string
  date: string
  icon: string
  temp: number
}

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }
  if (data && typeof data === 'object' && 'locations' in data) {
    const locations = data.locations as Location.LocationObject[]
    if (locations.length > 0) {
      const { latitude, longitude } = locations[0].coords
      console.log('Background location:', latitude, longitude)
    }
  }
})

export default function HomeScreen() {
  const { location, error } = useUserLocation()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [city, setCity] = useState('')

  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon).then(setWeather)
      fetchWeatherForecast(location.lat, location.lon).then(setForecast)
    }
  }, [location])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { status } = await Location.requestBackgroundPermissionsAsync()
        if (status === 'granted' && isMounted) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 60000, // Atualiza a cada 60 segundos
            distanceInterval: 50, // Atualiza a cada 50 metros
          })
        } else {
          console.error('Permissão de localização não concedida')
        }
      } catch (error) {
        console.error('Failed to start location updates:', error)
      }
    })()
    return () => {
      isMounted = false
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    }
  }, [])

  const searchWeather = async () => {
    if (!city) return
    try {
      const locationData = await Location.geocodeAsync(city)
      let data: WeatherData | null = null
      let forecastData: ForecastData[] = []
      if (locationData.length > 0) {
        const { latitude, longitude } = locationData[0]
        data = await fetchWeather(latitude, longitude)
        forecastData = await fetchWeatherForecast(latitude, longitude)
      } else {
        console.error('Failed to get location data for the city')
      }
      setWeather(data)
      setForecast(forecastData)
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
    }
  }

  if (error) return <Text style={styles.error}>{error}</Text>
  if (!location || !weather) return <ActivityIndicator size='large' />

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.searchContainer}>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder='Digite uma cidade'
          style={styles.input}
        />
        <Button
          title='Buscar'
          onPress={searchWeather}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{weather.name}</Text>
        <Image
          source={{
            uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
          }}
          style={styles.icon}
        />
        <Text style={styles.temp}>{weather.main.temp.toFixed(0)}°C</Text>
        <Text style={styles.desc}>{weather.weather[0].description}</Text>
      </View>

      <ScrollView
        style={styles.forecastContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {forecast.map((day, index) => (
          <View
            key={index}
            style={styles.forecastCard}
          >
            <Text>{day.dayOfWeek}</Text>
            <Text>{day.date}</Text>
            <Image
              source={{
                uri: `https://openweathermap.org/img/wn/${day.icon}@2x.png`,
              }}
              style={styles.icon}
            />
            <Text>{day.temp.toFixed(0)}°C</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3f3f46',
    paddingTop: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    width: '60%',
    marginRight: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  temp: { fontSize: 40, color: 'white' },
  desc: { fontSize: 18, textTransform: 'capitalize', color: 'white' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  icon: { width: 100, height: 100 },
  forecastContainer: {
    width: '100%',
  },
  forecastCard: {
    padding: 10,
    margin: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(194, 186, 186, 0.88)',
    borderRadius: 10,
    width: 120,
    height: 180,
  },
})
