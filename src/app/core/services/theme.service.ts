import { Injectable, Renderer2, RendererFactory2, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StateService } from './state.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentThemeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  private themePreferenceSubject = new BehaviorSubject<ThemeMode>('light');
  
  // Public observables
  currentTheme$ = this.currentThemeSubject.asObservable();
  themePreference$ = this.themePreferenceSubject.asObservable();
  
  constructor(
    private rendererFactory: RendererFactory2,
    private stateService: StateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    
    if (isPlatformBrowser(this.platformId)) {
      // Initialize theme from state
      this.stateService.settings$.subscribe(settings => {
        if (settings.theme === 'dark') {
          this.setThemeMode('dark');
        } else {
          // Default to light
          this.setThemeMode('light');
        }
      });
    }
  }
  
  /**
   * Set the theme mode (light or dark)
   */
  setThemeMode(mode: ThemeMode): void {
    this.themePreferenceSubject.next(mode);
    this.applyTheme(mode);
    
    // Save theme preference
    this.stateService.updateSettings({ theme: mode });
  }
  
  /**
   * Apply a specific theme (light or dark)
   * @param theme The theme to apply ('light' or 'dark')
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    this.currentThemeSubject.next(theme);
    
    if (theme === 'dark') {
      this.renderer.removeClass(this.document.body, 'light-theme');
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
      this.renderer.addClass(this.document.body, 'light-theme');
    }
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setThemeMode(newTheme);
  }
  
  /**
   * Toggle between light and dark themes
   */
  cycleThemeMode(): void {
    const currentMode = this.themePreferenceSubject.value;
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }
} 