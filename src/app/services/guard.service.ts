import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class GuardService implements CanActivate {

    constructor(public userService: UserService, public router: Router) { }

    async canActivate() {
        if (!await this.userService.isAuthenticated()) {
            await this.router.navigate(['login']);
            return false;
        }
        return true;
    }
}