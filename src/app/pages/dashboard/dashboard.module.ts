import {NgModule} from '@angular/core'

import {CommonModule} from '@angular/common'

import {DashboardRoutingModule} from './dashboard-routing.module'
import {DashboardComponent} from './dashboard.component'
import {SearchCityBarModule} from '../../elements/dynamic/search-city-bar/search-city-bar.module'
import {FavoriteWeatherCardModule} from '../../elements/dynamic/favorite-weather-card/favorite-weather-card.module'
import {DragDropModule} from '@angular/cdk/drag-drop'


@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        SearchCityBarModule,
        FavoriteWeatherCardModule,
        DragDropModule
    ],
    declarations: [DashboardComponent],
    exports: [DashboardComponent]
})
export class DashboardModule {
}
