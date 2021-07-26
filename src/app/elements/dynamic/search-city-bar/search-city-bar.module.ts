import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {SearchCityBarComponent} from './search-city-bar.component'
import {NzInputModule} from 'ng-zorro-antd/input'
import {NzIconModule} from 'ng-zorro-antd/icon'
import {NzButtonModule} from 'ng-zorro-antd/button'
import {ReactiveFormsModule} from '@angular/forms'

@NgModule({
    imports: [
        CommonModule,
        NzInputModule,
        NzIconModule,
        NzButtonModule,
        ReactiveFormsModule
    ],
    declarations: [SearchCityBarComponent],
    exports: [SearchCityBarComponent]
})
export class SearchCityBarModule {
}
