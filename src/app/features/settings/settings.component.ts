import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, distinctUntilChanged, debounceTime } from 'rxjs';
import { StateService, AppSettings, WidgetSettings } from '../../core/services/state.service';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm!: FormGroup;
  widgetForms: FormGroup[] = [];
  widgets: WidgetSettings[] = [];
  
  private settingsSubscription!: Subscription;
  private widgetsSubscription!: Subscription;
  private formSubscriptions: Subscription[] = [];
  
  constructor(
    private fb: FormBuilder,
    private stateService: StateService
  ) {
    this.createSettingsForm();
  }
  
  ngOnInit(): void {
    // Subscribe to settings changes
    this.settingsSubscription = this.stateService.settings$.subscribe(settings => {
      this.updateSettingsForm(settings);
    });
    
    // Subscribe to widget changes
    this.widgetsSubscription = this.stateService.widgets$.subscribe(widgets => {
      this.widgets = widgets;
      this.updateWidgetForms();
    });
    
    // Set up auto-save for global settings
    this.setupSettingsAutoSave();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.settingsSubscription.unsubscribe();
    this.widgetsSubscription.unsubscribe();
    this.formSubscriptions.forEach(sub => sub.unsubscribe());
  }
  
  getWidgetForm(index: number): FormGroup {
    return this.widgetForms[index];
  }
  
  createSettingsForm(): void {
    this.settingsForm = this.fb.group({
      units: ['metric'],
      dateFormat: ['dd/MM/yyyy'],
      language: ['en'],
      themeMode: ['system']
    });
  }
  
  private setupSettingsAutoSave(): void {
    const subscription = this.settingsForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      })
    ).subscribe(formValues => {
      const themeValue = formValues.themeMode;
      
      this.stateService.updateSettings({
        ...formValues,
        theme: themeValue
      });
    });
    
    this.formSubscriptions.push(subscription);
  }
  
  private setupWidgetAutoSave(index: number): void {
    const subscription = this.widgetForms[index].valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      })
    ).subscribe(formValues => {
      // Convert refresh interval from minutes to milliseconds
      const refreshInterval = formValues.refreshInterval * 60000;
      
      this.stateService.updateWidget(index, {
        ...formValues,
        refreshInterval
      });
    });
    
    this.formSubscriptions.push(subscription);
  }
  
  private updateSettingsForm(settings: AppSettings): void {
    // Don't trigger valueChanges subscription when updating the form
    this.settingsForm.patchValue({
      units: settings.units,
      dateFormat: settings.dateFormat,
      language: settings.language,
      themeMode: settings.theme
    }, { emitEvent: false });
  }
  
  private updateWidgetForms(): void {
    // Clear existing form subscriptions
    this.formSubscriptions.forEach(sub => sub.unsubscribe());
    this.formSubscriptions = [];
    
    // Clear existing forms
    this.widgetForms = [];
    
    // Create a form for each widget
    this.widgets.forEach((widget, index) => {
      this.updateWidgetForm(widget, index);
      this.setupWidgetAutoSave(index);
    });
  }
  
  private updateWidgetForm(widget: WidgetSettings, index: number): void {
    // Convert refresh interval from milliseconds to minutes for the form
    const refreshMinutes = Math.floor(widget.refreshInterval / 60000);
    
    const form = this.fb.group({
      units: [widget.units],
      dateFormat: [widget.dateFormat],
      refreshInterval: [refreshMinutes]
    });
    
    // If the form exists, update it; otherwise, add it
    if (index < this.widgetForms.length) {
      this.widgetForms[index] = form;
    } else {
      this.widgetForms.push(form);
    }
  }
}
