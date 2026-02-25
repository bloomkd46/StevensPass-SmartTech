import { Component, inject, type OnInit } from '@angular/core';
import { RouterModule } from "@angular/router";
import { FirebaseService } from './services/firebase/firebase.service';
import { PlatformService } from './services/platform/platform.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private platformService = inject(PlatformService);
  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      if (this.platformService.isDev) {
        const script = document.createComment('Analytics disabled in development mode');
        document.head.appendChild(script);
      } else {
        this.firebaseService.init();
      }
    }
  }
}
