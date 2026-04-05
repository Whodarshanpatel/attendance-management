import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  scrollToPricing() {
    const el = document.getElementById('pricing');
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}
