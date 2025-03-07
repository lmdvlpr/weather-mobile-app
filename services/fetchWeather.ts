import axios from 'axios'

interface WeatherData {
  name: string
  main: {
    temp: number
  }
  weather: {
    description: string
    icon: string
  }[]
}

interface ForecastData {
  date: string
  dayOfWeek: string
  temp: number
  icon: string
}

const API_KEY = '12c0b85b70527f61675a29e91298c58e'

export const fetchWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData | null> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt`,
    )
    return response.data
  } catch (error) {
    console.error('Erro ao buscar clima', error)
    return null
  }
}

export const fetchWeatherForecast = async (
  lat: number,
  lon: number,
): Promise<ForecastData[]> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt`,
    )

    const forecastMap = new Map<string, ForecastData>()

    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000)
      const dateString = date.toLocaleDateString('pt-BR')
      if (!forecastMap.has(dateString)) {
        forecastMap.set(dateString, {
          date: dateString,
          dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          temp: item.main.temp,
          icon: item.weather[0].icon,
        })
      }
    })

    return Array.from(forecastMap.values()).slice(0, 5)
  } catch (error) {
    console.error('Erro ao buscar previsão do tempo', error)
    return []
  }
}
