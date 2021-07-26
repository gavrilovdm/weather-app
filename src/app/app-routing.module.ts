import {NgModule} from '@angular/core'
import {Routes, RouterModule} from '@angular/router'

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/favorites'},
    {
        path: 'favorites',
        loadChildren: () => import('./pages/dashboard/dashboard.module')
            .then(m => m.DashboardModule)},
    {
        path: 'forecast/:id',
        loadChildren: () => import('./pages/city-forecast/city-forecast.module')
            .then(m => m.CityForecastModule)}
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
