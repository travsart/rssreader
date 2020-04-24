import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Preference } from '../model/preference';
import { map, catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class PreferenceService {
    private base = '/api/preference';

    constructor(private http: HttpClient, private userService: UserService) {
    }
    findPreferenceById(preferenceId: number): Observable<Preference> {
        return this.http.get<Preference>(`${this.base}/${preferenceId}`).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandler)
        );
    }
    findPreferenceByCurrentUser(): Observable<Preference> {
        return this.http.get<Preference>(`${this.base}?user=${this.userService.currentUser}`).pipe(
            map(res => {
                return res[0];
            }),
            catchError(this.errorHandler)
        );
    }
    updatePreference(data: Preference): Observable<Preference> {
        return this.http.patch<Preference>(`${this.base}/${data.id}`, data).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandler)
        );
    }
    errorHandler(err: HttpErrorResponse): Observable<Preference> {
        alert(`Error with the request from server ${err.message}`);
        return of(null);
    }
}
