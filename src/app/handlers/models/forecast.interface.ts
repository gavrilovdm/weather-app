export interface ForecastInterface {
    list: [
        {
            dt: number
            main: {
                temp: number
                feels_like: number
                temp_min: number
                temp_max: number
                pressure: number
                sea_level: number
                grnd_level: number
                humidity: number
                temp_kf: number
            }
            weather: [
                {
                    description: string
                    icon: string
                }
            ]
            clouds: {
                all: number
            }
            wind: {
                speed: number
                deg: number
                gust: number
            }
            visibility: number
            pop: number
            dt_txt: string
        }
    ]
    city: {
        id: number
        name: string
        country: string
        population: number
        timezone: number
        sunrise: number
        sunset: number
    }
}
