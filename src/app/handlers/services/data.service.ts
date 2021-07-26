import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable, Subscription} from 'rxjs'

@Injectable({providedIn: 'root'})
export class DataService {

    constructor(
        private http: HttpClient
    ) {
    }

    getWeatherByCity(city: string, id?: boolean): Observable<any> {
        return this.http
            .get(`https://api.openweathermap.org/data/2.5/weather?${!id ? 'q' : 'id'}=${city}&lang=ru&APPID=83cd3cb2ef134f52fa854cd324d22fc5&units=metric`)
    }

    getForecastByCity(city: string, count?: number, id?: boolean): Observable<any> {
        if (!count) {
            count = 7
        }

        return this.http
            .get(`https://api.openweathermap.org/data/2.5/forecast?${!id ? `q` : 'id'}=${city}&lang=ru${count ? `&cnt=${count}` : null}&APPID=83cd3cb2ef134f52fa854cd324d22fc5&units=metric`)
    }

    getFavorites(): any {
        // удалить дубликаты внутри массива перед возвратом
        return JSON.parse(localStorage.getItem('favorites'))
    }

    addToFavorites(city: string): void {
        const favorites = this.getFavorites()
        favorites.push(city)
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }

    deleteFromFavorites(city: string): void {
        const favorites = this.getFavorites()
        const index = favorites.indexOf(city)
        favorites.splice(index, 1)
        localStorage.removeItem('favorites')
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }
}
