import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {CityForecastComponent} from './city-forecast.component'
import {RouterModule} from '@angular/router'
import {NzButtonModule} from 'ng-zorro-antd/button'
import {NzGridModule} from 'ng-zorro-antd/grid'
import {NzSpaceModule} from 'ng-zorro-antd/space'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{path: '', component: CityForecastComponent}]),
        NzButtonModule,
        NzGridModule,
        NzSpaceModule
    ],
    declarations: [CityForecastComponent],
    exports: [RouterModule]
})
export class CityForecastModule {

}
