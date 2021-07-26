import {Component, OnDestroy, OnInit} from '@angular/core'
import {FormControl, FormGroup} from '@angular/forms'
import {DataService} from '../../../handlers/services/data.service'
import {Subscription} from 'rxjs'
import {ActivatedRoute, Router} from '@angular/router'
import {NzMessageService} from 'ng-zorro-antd/message'

@Component({
    selector: 'app-search-city-bar',
    template: `
      <div [formGroup]="form">
        <nz-input-group [nzSuffix]="suffixIconSearch" (keyup.enter)="getByCity(this.form.controls.city.value)">
          <input formControlName="city" type="search" nz-input placeholder="Погода в вашем городе"/>
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
        <br>
        <br>
      </div>
    `,
    providers: [NzMessageService]
})
export class SearchCityBarComponent implements OnDestroy {
    constructor(
        public data: DataService,
        private router: Router,
        private route: ActivatedRoute,
        private message: NzMessageService
    ) {
    }

    form: FormGroup = new FormGroup({
        city: new FormControl()
    })

    sub: Subscription = new Subscription()

    getByCity(city: string): void {
        this.sub.add(this.data.getForecastByCity(city)
            .subscribe(
                r => {
                    this.router.navigate([`/forecast/${r.city.id}`])
                },
                e => {
                    this.createMessage('error', 'Название города введено неправильно!')
                }
            ))
    }

    createMessage(type: string, content: string): void {
        this.message.create(type, content)
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }
}
