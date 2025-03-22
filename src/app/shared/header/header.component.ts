import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTooltipModule, 
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentTheme$!: Observable<'light' | 'dark'>;
  themePreference$!: Observable<ThemeMode>;
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    this.currentTheme$ = this.themeService.currentTheme$;
    this.themePreference$ = this.themeService.themePreference$;
  }
  
  toggleTheme(): void {
    this.themeService.cycleThemeMode();
  }
  
  getThemeIcon(preference: ThemeMode | null): string {
    switch (preference) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      default: return 'light_mode';
    }
  }
}
