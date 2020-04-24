import { Injectable } from '@angular/core';

@Injectable()
export class ApplicationStateService {
  private isMobile: boolean;

  constructor() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('android') != -1 || ua.indexOf('iphone') != -1 || ua.indexOf('ipad') != -1) {
      this.isMobile = true;
    }
    else {
      this.isMobile = false;
    }
  }
  public getIsMobileResolution(): boolean {
    return this.isMobile;
  }
}
