import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {DataService} from '../../../handlers/services/data.service'
import {Subscription} from 'rxjs'
import {Router} from '@angular/router'
import {WeatherInterface} from '../../../handlers/models/weather.interface'

@Component({
    selector: 'app-city-weather-card',
    template: `
      <div nz-row nzGutter="0, 24" #item>
        <div nz-col>
          <nz-card style="width:600px; cursor: pointer"
                   nzTitle="{{city}}"
                   [nzExtra]="extraTemplate"
                   [nzActions]="[actionDelete]"
                   [nzLoading]="!weather">
            <div nz-row (click)="getByCity(city)">
              <div nz-col>
                <img src="http://openweathermap.org/img/wn/{{weather?.weather[0].icon}}@2x.png" alt="">
              </div>
              <div nz-col>
                <h2>{{weather?.main.temp}} °C</h2>
                <h3>{{weather?.weather[0].description}}</h3>
              </div>
            </div>
          </nz-card>
          <ng-template #extraTemplate>
            <a>{{weather?.dt * 1000 | date : 'd.MM.YY'}}</a>
          </ng-template>
          <ng-template #actionDelete>
            <i nz-icon nzType="delete" (click)="deleteCityFromFavorites(city); item.remove()"></i>
          </ng-template>
        </div>
      </div>
    `
})
export class FavoriteWeatherCardComponent implements OnInit, OnDestroy {
    @Input() city: string

    constructor(
        public data: DataService,
        private router: Router
    ) {
    }

    weather: WeatherInterface

    sub: Subscription = new Subscription()

    ngOnInit(): void {
        this.getWeatherByCity()
    }

    getWeatherByCity(): void {
        this.sub.add(this.data.getWeatherByCity(this.city)
            .subscribe(
                r => {
                    this.weather = r
                    this.weather.main.temp = Math.trunc(this.weather.main.temp)
                    this.weather.weather[0].description = this.weather.weather[0].description[0].toUpperCase() +
                        this.weather.weather[0].description.slice(1)
                }
            ))
    }

    getByCity(city: string): void {
        this.sub.add(this.data.getForecastByCity(city)
            .subscribe(
                r => {
                    this.router.navigate([`/forecast/${r.city.id}`])
                }
            ))
    }

    deleteCityFromFavorites(city: string): void {
        this.data.deleteFromFavorites(city)
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }
}
