import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, interval, switchMap, catchError, of, map, takeUntil, Subject } from 'rxjs';
import { WeatherService, WeatherData } from '../../../core/services/weather.service';
import { StateService, WidgetSettings } from '../../../core/services/state.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.scss'
})
export class WeatherWidgetComponent implements OnInit, OnDestroy {
  @Input() cityName: string = '';
  @Input() widgetIndex: number = -1;
  @Output() remove = new EventEmitter<void>();
  
  @HostBinding('class.forecast-active') 
  get isForecastActive() { 
    return this.showForecast; 
  }
  
  weatherData: WeatherData | null = null;
  loading: boolean = true;
  error: string | null = null;
  units: 'metric' | 'imperial' = 'metric';
  showForecast: boolean = false;
  dateFormat: string = 'dd/MM/yyyy';
  
  private refreshSubscription?: Subscription;
  private widgetSubscription?: Subscription;
  private widgetSettings?: WidgetSettings;
  private destroy$ = new Subject<void>();
  
  constructor(
    private weatherService: WeatherService,
    private stateService: StateService,
    private loggingService: LoggingService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to widget settings changes
    this.widgetSubscription = this.stateService.widgets$.pipe(
      takeUntil(this.destroy$),
      map(widgets => {
        // Find the widget that matches this component's cityName
        const widgetIndex = widgets.findIndex(w => w.city.toLowerCase() === this.cityName.toLowerCase());
        return widgetIndex >= 0 ? widgets[widgetIndex] : null;
      })
    ).subscribe(widget => {
      if (widget) {
        this.widgetSettings = widget;
        this.units = widget.units;
        this.dateFormat = widget.dateFormat;
        
        // If units changed, refresh the data
        if (this.weatherData && this.weatherData.current && 
            this.units !== (this.weatherData.current as any)['units']) {
          this.refreshData();
        }
        
        // Update refresh interval if it changed
        this.setupRefreshInterval(widget.refreshInterval);
      }
    });
    
    // Load initial weather data
    this.loadWeatherData();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshSubscription?.unsubscribe();
    this.widgetSubscription?.unsubscribe();
  }
  
  refreshData(): void {
    this.loading = true;
    this.error = null;
    this.loadWeatherData();
  }
  
  onRemove(): void {
    this.remove.emit();
  }
  
  toggleForecast(): void {
    this.showForecast = !this.showForecast;
  }
  
  private setupRefreshInterval(intervalMinutes: number): void {
    // Clean up existing subscription if it exists
    this.refreshSubscription?.unsubscribe();
    
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Set up new refresh interval
    this.refreshSubscription = interval(intervalMs).pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        this.loading = true;
        return this.fetchWeatherData();
      }),
      catchError(error => {
        this.handleError(error);
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          // Store the units used to fetch the data for comparison on updates
          if (data.current) {
            (data.current as any)['units'] = this.units;
          }
          this.weatherData = data;
          this.error = null;
        } else if (!this.error) {
          // Only set error if not already set by error handler
          this.error = `Unable to display weather for "${this.cityName}". Please try again later.`;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }
  
  private loadWeatherData(): void {
    this.weatherService.getCompleteWeatherData(this.cityName, this.units).subscribe({
      next: (data) => {
        if (data) {
          // Store the units used to fetch the data for comparison on updates
          if (data.current) {
            (data.current as any)['units'] = this.units;
          }
          this.weatherData = data;
          this.error = null;
        } else {
          // This could happen if the city was found but the data format was unexpected
          this.error = `Unable to display weather for "${this.cityName}". Please try again later.`;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  private fetchWeatherData() {
    return this.weatherService.getCompleteWeatherData(this.cityName, this.units);
  }
  
  private handleError(error: any): void {
    this.loading = false;
    
    if (error?.status === 401) {
      this.error = 'API authorization error. Please check your API key configuration.';
    } else if (error?.status === 404) {
      this.error = `City "${this.cityName}" not found. Please check spelling and try again.`;
    } else if (error?.message && typeof error.message === 'string') {
      this.error = error.message;
    } else {
      this.error = `Unable to display weather for "${this.cityName}". Please try again later.`;
    }
    
    this.loggingService.logError('Weather Widget Error', error);
  }
}
