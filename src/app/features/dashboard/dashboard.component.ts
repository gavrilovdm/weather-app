import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { WeatherWidgetComponent } from './weather-widget/weather-widget.component';
import { StateService, WidgetSettings } from '../../core/services/state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    WeatherWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  widgets: WidgetSettings[] = [];
  newCity: string = '';
  error: string | null = null;

  constructor(public stateService: StateService) {}

  ngOnInit(): void {
    this.stateService.widgets$.subscribe(widgets => {
      this.widgets = widgets;
    });
    
    // Subscribe to error state
    this.stateService.state$.subscribe(state => {
      this.error = state.error;
    });
  }

  addWidget(): void {
    if (this.newCity && this.newCity.trim()) {
      this.stateService.addWidget(this.newCity.trim());
      this.newCity = '';
    }
  }

  removeWidget(index: number): void {
    this.stateService.removeWidget(index);
  }
}
