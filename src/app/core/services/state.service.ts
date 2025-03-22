import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { WeatherData } from './weather.service';

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  units: 'metric' | 'imperial';
  dateFormat: string;
}

export interface WidgetSettings {
  city: string;
  units: 'metric' | 'imperial';
  showForecast: boolean;
  dateFormat: string;
  refreshInterval: number;
}

export interface AppState {
  widgets: WidgetSettings[];
  weatherData: Record<string, WeatherData | null>;
  settings: AppSettings;
  isOffline: boolean;
  lastUpdated: Record<string, number>;
  error: string | null;
}

const defaultWidgetSettings: WidgetSettings = {
  city: '',
  units: 'metric',
  showForecast: true,
  dateFormat: 'dd/MM/yyyy',
  refreshInterval: 600000 // 10 minutes
};

const initialState: AppState = {
  widgets: [],
  weatherData: {},
  settings: {
    theme: 'light',
    language: 'en',
    units: 'metric',
    dateFormat: 'dd/MM/yyyy'
  },
  isOffline: false,
  lastUpdated: {},
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state = new BehaviorSubject<AppState>(initialState);
  
  // Public observables for components to subscribe to
  state$ = this.state.asObservable();
  widgets$ = this.state$.pipe(map(state => state.widgets));
  weatherData$ = this.state$.pipe(map(state => state.weatherData));
  settings$ = this.state$.pipe(map(state => state.settings));
  isOffline$ = this.state$.pipe(map(state => state.isOffline));
  
  constructor(private storageService: StorageService) {
    this.loadStateFromStorage();
    
    // Monitor online/offline status
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }
  
  private async loadStateFromStorage() {
    try {
      // Load settings
      const settings = await this.storageService.getSettings('appSettings');
      if (settings) {
        this.updateState({ settings: { ...this.state.value.settings, ...settings } });
      }
      
      // Load widgets
      const widgets = await this.storageService.getSettings('widgets');
      if (widgets) {
        this.updateState({ widgets });
      }
      
      // Check initial online status
      this.updateOnlineStatus(navigator.onLine);
    } catch (error) {
      console.error('Error loading state from storage', error);
    }
  }
  
  // State update methods
  private updateState(partialState: Partial<AppState>) {
    this.state.next({ ...this.state.value, ...partialState });
  }
  
  // Widget methods
  addWidget(city: string): void {
    if (this.state.value.widgets.length >= 5) {
      this.setError('Maximum number of widgets (5) reached');
      return;
    }
    
    if (this.state.value.widgets.some(w => w.city.toLowerCase() === city.toLowerCase())) {
      this.setError(`Widget for ${city} already exists`);
      return;
    }
    
    // City name must be at least 2 characters long
    if (city.trim().length < 2) {
      this.setError('City name must be at least 2 characters long');
      return;
    }
    
    // Get global settings to apply to new widget
    const { units, dateFormat } = this.state.value.settings;
    
    const newWidget: WidgetSettings = {
      ...defaultWidgetSettings,
      city,
      units,
      dateFormat
    };
    
    const widgets = [...this.state.value.widgets, newWidget];
    this.updateState({ widgets });
    this.saveWidgets(widgets);
  }
  
  updateWidget(index: number, settings: Partial<WidgetSettings>): void {
    if (index < 0 || index >= this.state.value.widgets.length) {
      this.setError(`Invalid widget index: ${index}`);
      return;
    }
    
    const widgets = [...this.state.value.widgets];
    widgets[index] = { ...widgets[index], ...settings };
    
    this.updateState({ widgets });
    this.saveWidgets(widgets);
  }
  
  removeWidget(index: number): void {
    if (index < 0 || index >= this.state.value.widgets.length) {
      this.setError(`Invalid widget index: ${index}`);
      return;
    }
    
    const widgets = this.state.value.widgets.filter((_, i) => i !== index);
    this.updateState({ widgets });
    this.saveWidgets(widgets);
  }
  
  // Settings methods
  updateSettings(settings: Partial<AppSettings>): void {
    const updatedSettings = { ...this.state.value.settings, ...settings };
    this.updateState({ settings: updatedSettings });
    this.saveSettings(updatedSettings);
    
    // Apply global settings to all widgets that don't have custom settings
    // For now, we'll only update units and dateFormat
    if (settings.units || settings.dateFormat) {
      const globalSettingsToApply: Partial<WidgetSettings> = {};
      
      if (settings.units) {
        globalSettingsToApply.units = settings.units;
      }
      
      if (settings.dateFormat) {
        globalSettingsToApply.dateFormat = settings.dateFormat;
      }
      
      // Only update if we have settings to apply
      if (Object.keys(globalSettingsToApply).length > 0) {
        const updatedWidgets = this.state.value.widgets.map(widget => {
          return { ...widget, ...globalSettingsToApply };
        });
        
        this.updateState({ widgets: updatedWidgets });
        this.saveWidgets(updatedWidgets);
      }
    }
  }
  
  // Weather data methods
  updateWeatherData(city: string, data: WeatherData): void {
    const weatherData = {
      ...this.state.value.weatherData,
      [city.toLowerCase()]: data
    };
    
    const lastUpdated = {
      ...this.state.value.lastUpdated,
      [city.toLowerCase()]: Date.now()
    };
    
    this.updateState({ weatherData, lastUpdated });
  }
  
  // Error handling
  setError(error: string | null): void {
    this.updateState({ error });
  }
  
  // Online status
  private updateOnlineStatus(isOnline: boolean): void {
    this.updateState({ isOffline: !isOnline });
  }
  
  // Persistence
  private async saveWidgets(widgets: WidgetSettings[]): Promise<void> {
    try {
      await this.storageService.saveSettings('widgets', widgets);
    } catch (error) {
      console.error('Error saving widgets', error);
    }
  }
  
  private async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await this.storageService.saveSettings('appSettings', settings);
    } catch (error) {
      console.error('Error saving settings', error);
    }
  }
}
