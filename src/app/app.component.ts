import {Component, OnInit} from '@angular/core'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['../assets/styles/app.component.less']
})
export class AppComponent implements OnInit {
    isCollapsed = false

    ngOnInit(): void {
        if (!localStorage.getItem('favorites') || localStorage.getItem('favorites') === '[]') {
            localStorage.setItem('favorites', '["Москва", "Лондон"]')
        }
    }
}
