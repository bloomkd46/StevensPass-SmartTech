import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private platformId = inject(PLATFORM_ID);


  public isServer = isPlatformServer(this.platformId);
  public isBrowser = isPlatformBrowser(this.platformId);
  //public isBot = this.isBrowser && isbot(navigator.userAgent);
  public isDev = isDevMode();

}
