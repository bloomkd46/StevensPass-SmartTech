import { Injectable } from '@angular/core';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializePerformance, type FirebasePerformance } from 'firebase/performance';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public app?: FirebaseApp;
  public analytics?: Analytics;
  public performance?: FirebasePerformance;
  constructor() { }

  init() {
    this.app = initializeApp({
      apiKey: "AIzaSyAik-xTp_Wpbf7qL70Hh__A_4LBT8z7cuY",
      authDomain: "stevenspass-smarttech.firebaseapp.com",
      projectId: "stevenspass-smarttech",
      storageBucket: "stevenspass-smarttech.firebasestorage.app",
      messagingSenderId: "203127262310",
      appId: "1:203127262310:web:b0b1cd7c8f968ede3f31a7",
      measurementId: "G-QZCZ4BPBWS"
    });
    this.analytics = getAnalytics(this.app);
    this.performance = initializePerformance(this.app);
  }

  logEvent(eventName: string, params: Record<string, unknown>) {
    if (this.analytics) {
      logEvent(this.analytics, eventName, params);
    }
  }
}
