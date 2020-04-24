import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../model/user';
import { Server } from '../model/server';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserService {
    currentUser: string;
    base = '/api/';

    constructor(private http: HttpClient) {
        this.currentUser = null;
    }
    login(user: User): Observable<boolean> {
        return this.http.post<Server>(`${this.base}login`, user).pipe(
            map(res => {
                this.currentUser = user.username;
                if (!res.success) {
                    alert(`Error with logging in ${res.msg}`);
                }
                return res.success;
            }),
            catchError(this.errorHandler)
        );
    }
    logout(): Observable<boolean> {
        this.currentUser = null;
        console.log('Logging out');
        return this.http.post<Server>(`${this.base}logout`, {}).pipe(
            map(res => {
                return res.success;
            }),
            catchError(this.errorHandler)
        );
    }
    register(data: User): Observable<boolean> {
        return this.http.post<Server>(`${this.base}register`, data).pipe(
            map(res => {
                return res.success;
            }),
            catchError(this.errorHandler)
        );
    }
    authenticated(): Observable<boolean> {
        return this.http.get<Server>(`${this.base}authenticated`).pipe(
            map(res => {
                if (res.data != null) {
                    this.currentUser = res.data.split('::')[0];
                }
                return res.success;
            }),
            catchError(this.errorHandler)
        );
    }
    isAuthenticated(): Promise<boolean> {
        return this.authenticated().toPromise();
    }
    errorHandler(err: HttpErrorResponse): Observable<boolean> {
        alert(`Error with the request from server ${err.message}`);
        return of(false);
    }
}
