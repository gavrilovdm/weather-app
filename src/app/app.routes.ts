import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'settings', loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule) },
  { path: '**', redirectTo: 'dashboard' }
];
