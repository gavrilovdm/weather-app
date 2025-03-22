import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map, switchMap, forkJoin } from 'rxjs';
import { StorageService } from './storage.service';
import { LoggingService } from './logging.service';

export interface WeatherData {
  city: string;
  current: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    description: string;
    icon: string;
    dt: number;
  };
  forecast: Array<{
    dt: number;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '83cd3cb2ef134f52fa854cd324d22fc5'; // OpenWeatherMap API key
  private baseApiUrl = 'https://api.openweathermap.org/data/2.5';
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private loggingService: LoggingService
  ) {}
  
  // Get complete weather data using both current weather and forecast endpoints
  getCompleteWeatherData(city: string, units: string = 'metric'): Observable<WeatherData | null> {
    // Get both current weather and forecast data
    return forkJoin({
      current: this.getCurrentWeather(city, units),
      forecast: this.getForecast(city, units)
    }).pipe(
      map(({ current, forecast }) => {
        if (!current || !forecast) {
          return null;
        }
        return this.formatWeatherData(current, forecast);
      }),
      catchError(error => {
        this.loggingService.logError(`Error in complete weather data flow for ${city}`, error);
        return of(null);
      })
    );
  }
  
  // Get current weather data
  getCurrentWeather(city: string, units: string = 'metric'): Observable<any> {
    const url = `${this.baseApiUrl}/weather?q=${city}&units=${units}&appid=${this.apiKey}`;
    
    return this.http.get(url).pipe(
      tap(data => this.storageService.saveWeatherData(city, data)),
      catchError(error => {
        this.loggingService.logError('Error fetching current weather', error);
        // Try to get from cache if network request fails
        const cachedData = this.storageService.getWeatherData(city);
        return cachedData ? of(cachedData) : of(null);
      })
    );
  }
  
  // Get forecast data
  getForecast(city: string, units: string = 'metric'): Observable<any> {
    const url = `${this.baseApiUrl}/forecast?q=${city}&units=${units}&appid=${this.apiKey}`;
    
    return this.http.get(url).pipe(
      tap(data => this.storageService.saveForecastData(city, data)),
      catchError(error => {
        this.loggingService.logError('Error fetching forecast', error);
        // Try to get from cache if network request fails
        const cachedData = this.storageService.getForecastData(city);
        return cachedData ? of(cachedData) : of(null);
      })
    );
  }
  
  // Helper method to format API data into a more usable structure
  formatWeatherData(currentData: any, forecastData: any): WeatherData | null {
    try {
      if (!currentData || !forecastData) {
        return null;
      }
      
      // Check if forecastData.list exists before trying to process it
      if (!forecastData.list || !Array.isArray(forecastData.list)) {
        this.loggingService.logError('Invalid forecast data structure', forecastData);
        return null;
      }
      
      // Get daily forecasts (one per day) for the next 3 days
      const dailyForecasts = this.extractDailyForecasts(forecastData.list, 3);
      
      return {
        city: currentData.name,
        current: {
          temp: currentData.main.temp,
          temp_min: currentData.main.temp_min,
          temp_max: currentData.main.temp_max,
          humidity: currentData.main.humidity,
          pressure: currentData.main.pressure,
          wind_speed: currentData.wind.speed,
          wind_direction: currentData.wind.deg,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          dt: currentData.dt
        },
        forecast: dailyForecasts
      };
    } catch (error) {
      this.loggingService.logError(`Error formatting weather data`, error);
      return null;
    }
  }
  
  // Extract one forecast per day
  private extractDailyForecasts(forecastList: any[], days: number): any[] {
    if (!forecastList || !Array.isArray(forecastList)) {
      return [];
    }
    
    const dailyForecasts = [];
    const processedDates = new Set();
    
    for (const forecast of forecastList) {
      // Get the date part only (without time)
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      
      // Only add if we haven't added this date yet and we need more days
      if (!processedDates.has(date) && dailyForecasts.length < days) {
        processedDates.add(date);
        dailyForecasts.push({
          dt: forecast.dt,
          temp_min: forecast.main.temp_min,
          temp_max: forecast.main.temp_max,
          description: forecast.weather[0].description,
          icon: forecast.weather[0].icon
        });
      }
    }
    
    return dailyForecasts;
  }
}
