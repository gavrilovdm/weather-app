import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface WeatherDBSchema extends DBSchema {
  weatherData: {
    key: string;
    value: any;
  };
  forecastData: {
    key: string;
    value: any;
  };
  settings: {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db!: Promise<IDBPDatabase<WeatherDBSchema>>;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    this.db = openDB<WeatherDBSchema>('weather-app-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('weatherData')) {
          db.createObjectStore('weatherData');
        }
        if (!db.objectStoreNames.contains('forecastData')) {
          db.createObjectStore('forecastData');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      }
    });
  }

  // Weather Data Operations
  async saveWeatherData(city: string, data: any): Promise<void> {
    try {
      const key = this.getCityKey(city);
      const db = await this.db;
      await db.put('weatherData', data, key);
      
      // Backup critical data to localStorage
      this.saveToLocalStorage(`weather_${key}`, data);
    } catch (error) {
      console.error('Error saving weather data to IndexedDB', error);
      // Fallback to localStorage
      this.saveToLocalStorage(`weather_${this.getCityKey(city)}`, data);
    }
  }

  async getWeatherData(city: string): Promise<any> {
    try {
      const key = this.getCityKey(city);
      const db = await this.db;
      const data = await db.get('weatherData', key);
      return data || this.getFromLocalStorage(`weather_${key}`);
    } catch (error) {
      console.error('Error retrieving weather data from IndexedDB', error);
      // Fallback to localStorage
      return this.getFromLocalStorage(`weather_${this.getCityKey(city)}`);
    }
  }

  // Forecast Data Operations
  async saveForecastData(city: string, data: any): Promise<void> {
    try {
      const key = this.getCityKey(city);
      const db = await this.db;
      await db.put('forecastData', data, key);
    } catch (error) {
      console.error('Error saving forecast data to IndexedDB', error);
      // Fallback to localStorage for critical data
      this.saveToLocalStorage(`forecast_${this.getCityKey(city)}`, data);
    }
  }

  async getForecastData(city: string): Promise<any> {
    try {
      const key = this.getCityKey(city);
      const db = await this.db;
      const data = await db.get('forecastData', key);
      return data || this.getFromLocalStorage(`forecast_${key}`);
    } catch (error) {
      console.error('Error retrieving forecast data from IndexedDB', error);
      // Fallback to localStorage
      return this.getFromLocalStorage(`forecast_${this.getCityKey(city)}`);
    }
  }

  // Settings Operations
  async saveSettings(key: string, value: any): Promise<void> {
    try {
      const db = await this.db;
      await db.put('settings', value, key);
      // Always backup settings to localStorage
      this.saveToLocalStorage(`settings_${key}`, value);
    } catch (error) {
      console.error('Error saving settings to IndexedDB', error);
      this.saveToLocalStorage(`settings_${key}`, value);
    }
  }

  async getSettings(key: string): Promise<any> {
    try {
      const db = await this.db;
      const settings = await db.get('settings', key);
      return settings || this.getFromLocalStorage(`settings_${key}`);
    } catch (error) {
      console.error('Error retrieving settings from IndexedDB', error);
      return this.getFromLocalStorage(`settings_${key}`);
    }
  }

  async deleteSettings(key: string): Promise<void> {
    try {
      const db = await this.db;
      await db.delete('settings', key);
      localStorage.removeItem(`settings_${key}`);
    } catch (error) {
      console.error('Error deleting settings', error);
      localStorage.removeItem(`settings_${key}`);
    }
  }

  // Helper methods
  private getCityKey(city: string): string {
    return city.toLowerCase().trim().replace(/\s+/g, '_');
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  private getFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting from localStorage', error);
      return null;
    }
  }
}
