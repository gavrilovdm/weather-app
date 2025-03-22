import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface LogEntry {
  timestamp: Date;
  message: string;
  data?: any;
  level: 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logsSubject = new Subject<LogEntry>();
  private errorSubject = new Subject<LogEntry>();
  
  logs$: Observable<LogEntry> = this.logsSubject.asObservable();
  errors$: Observable<LogEntry> = this.errorSubject.asObservable();

  constructor() { }
  
  logInfo(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  logWarning(message: string, data?: any): void {
    this.log('warning', message, data);
  }
  
  logError(message: string, error?: any): void {
    this.log('error', message, error);
    
    // Also emit to error subject for centralized error handling
    const entry: LogEntry = {
      timestamp: new Date(),
      message,
      data: error,
      level: 'error'
    };
    
    this.errorSubject.next(entry);
    
    // Log to console for development
    console.error(message, error);
  }
  
  private log(level: 'info' | 'warning' | 'error', message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      message,
      data,
      level
    };
    
    this.logsSubject.next(entry);
    
    // Also log to console for development
    if (level === 'info') {
      console.log(message, data);
    } else if (level === 'warning') {
      console.warn(message, data);
    }
  }
}
