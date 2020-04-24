import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Rssreader';
    @ViewChild('start', { static: false }) sideNav: MatSidenav;

    constructor(private router: Router) {

    }
    leave(url: string) {
        this.sideNav.close();
        this.router.navigate([url]);
    }
}
