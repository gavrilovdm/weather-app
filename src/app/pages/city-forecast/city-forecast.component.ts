import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {DataService} from '../../handlers/services/data.service'
import {forkJoin, Subscription} from 'rxjs'
import {WeatherInterface} from '../../handlers/models/weather.interface'
import {ForecastInterface} from '../../handlers/models/forecast.interface'

@Component({
    templateUrl: './city-forecast.html',
    styleUrls: ['../../../assets/styles/weather&forecast.less']
})
export class CityForecastComponent implements OnInit, OnDestroy {
    constructor(
        public data: DataService,
        private route: ActivatedRoute
    ) {
    }

    id = this.route.snapshot.params.id
    cityData: {
        weather: WeatherInterface,
        forecast: ForecastInterface
    } = {
        weather: null,
        forecast: null
    }
    cityInFavorites = false

    sub: Subscription = new Subscription()

    ngOnInit(): void {
        this.loadCityData()
    }

    loadCityData(): void {
        const observable = forkJoin({
                weather: this.data.getWeatherByCity(this.id, true),
                forecast: this.data.getForecastByCity(this.id, 40, true)
            }
        )

        observable.subscribe({
            next: value => {
                this.cityData = {...this.cityData, ...{weather: value.weather}}
                this.cityData.weather.main.temp = Math.trunc(this.cityData.weather.main.temp)
                this.cityData.weather.weather[0].description = this.cityData.weather.weather[0].description[0].toUpperCase() +
                    this.cityData.weather.weather[0].description.slice(1)

                this.cityData = {...this.cityData, ...{forecast: value.forecast}}

                this.cityInFavorites = this.isCityInFavorites()
            },
            complete: () => console.log(this.cityData),
        })
    }

    isCityInFavorites(): boolean {
        const favorites = this.data.getFavorites()
        return !!favorites.find(i => i === this.cityData.weather.name)
    }

    addCityToFavorites(): void {
        this.data.addToFavorites(this.cityData.weather.name)
        this.cityInFavorites = true
    }

    deleteCityFromFavorites(city: string): void {
        this.data.deleteFromFavorites(city)
        this.cityInFavorites = false
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }
}
