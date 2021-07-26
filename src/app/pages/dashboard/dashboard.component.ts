import {Component, OnInit} from '@angular/core'
import {DataService} from '../../handlers/services/data.service'
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop'

@Component({
    selector: 'app-welcome',
    templateUrl: './dashboard.component.html',
    styleUrls: ['../../../assets/styles/dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    constructor(
        public data: DataService
    ) {
    }

    favorites = []

    ngOnInit(): void {
        this.favorites = this.data.getFavorites()
    }

    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.favorites, event.previousIndex, event.currentIndex)
        localStorage.removeItem('favorites')
        localStorage.setItem('favorites', JSON.stringify(this.favorites))
    }

}
