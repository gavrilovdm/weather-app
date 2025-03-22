import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { interval, Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatToolbarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  currentDateTime: Date = new Date();
  private timeSubscription!: Subscription;
  
  constructor(public themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Update time every second
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentDateTime = new Date();
    });
  }
  
  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }
}
