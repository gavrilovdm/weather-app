import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {FavoriteWeatherCardComponent} from './favorite-weather-card.component'
import {NzIconModule} from 'ng-zorro-antd/icon'
import {NzButtonModule} from 'ng-zorro-antd/button'
import {NzCardModule} from 'ng-zorro-antd/card'
import {NzGridModule} from 'ng-zorro-antd/grid'

@NgModule({
    imports: [
        CommonModule,
        NzIconModule,
        NzButtonModule,
        NzCardModule,
        NzGridModule,
    ],
    declarations: [FavoriteWeatherCardComponent],
    exports: [FavoriteWeatherCardComponent]
})
export class FavoriteWeatherCardModule {
}
