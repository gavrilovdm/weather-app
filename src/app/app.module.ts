import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {NZ_I18N, ru_RU} from 'ng-zorro-antd/i18n'
import {FormsModule} from '@angular/forms'
import {HttpClientModule} from '@angular/common/http'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {IconsProviderModule} from './icons-provider.module'
import {NzLayoutModule} from 'ng-zorro-antd/layout'
import {NzMenuModule} from 'ng-zorro-antd/menu'

import {registerLocaleData} from '@angular/common'
import localeRu from '@angular/common/locales/ru'

registerLocaleData(localeRu, 'ru')

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        IconsProviderModule,
        NzLayoutModule,
        NzMenuModule
    ],
    providers: [{provide: NZ_I18N, useValue: ru_RU}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
