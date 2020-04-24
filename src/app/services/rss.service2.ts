import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Rss } from '../model/rss';
import { Server } from '../model/server';
import { map, catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class RssService {
    constructor(private http: HttpClient, private userService: UserService) { }
    findRssById(rssId: number): Observable<Rss> {
        return this.http.get<Server>(`/api/rss/${rssId}`).pipe(
            map(res => {
                if (res.success) {
                    return res.data as Rss;
                } else {
                    alert(`Error with the update request ${res.msg}`);
                    return null;
                }
            }),
            catchError(this.errorHandler)
        );
    }
    findAllRss(): Observable<Rss[]> {
        return this.http.get<Server>(`/api/rss?limit=5000&user=${this.userService.currentUser}`).pipe(
            map(res => {
                if (res.success) {
                    return res.data as Rss[];
                } else {
                    alert(`Error with the find all request ${res.msg}`);
                    return null;
                }
            }),
            catchError(this.errorHandlerArray)
        );
    }
    createRss(data: Rss): Observable<Rss> {
        return this.http.post<Server>('/api/rss', data).pipe(
            map(res => {
                if (res.success) {
                    return res.data as Rss;
                } else {
                    alert(`Error with the create request ${res.msg}`);
                    return null;
                }
            }),
            catchError(this.errorHandler)
        );
    }
    updateRss(data: Rss): Observable<Rss> {
        return this.http.put<Server>(`/api/rss/${data.id}`, data).pipe(
            map(res => {
                if (res.success) {
                    return res.data as Rss;
                } else {
                    alert(`Error with the update request ${res.msg}`);
                    return null;
                }
            }),
            catchError(this.errorHandler)
        );
    }
    deleteRss(rssId: number): Observable<boolean> {
        return this.http.delete<Server>(`/api/rss/${rssId}`).pipe(
            map(res => {
                if (res.success) {
                    return true;
                } else {
                    alert(`Error with the delete request ${res.msg}`);
                    return false;
                }
            }),
            catchError(err => {
                alert(`Error with the request ${err.message}`);
                return of(false);
            })
        );
    }
    runCheck(): Observable<boolean> {
        return this.http.get<Server>('/api/rss/runcheck').pipe(
            map(res => {
                if (res.success) {
                    alert(`Found ${res.data['anime']} Anime and ${res.data['manga']} Manga`);
                    return true;
                } else {
                    alert(`Error with the runcheck request ${res.msg}`);
                    return false;
                }
            }),
            catchError(err => {
                alert(`Error with the request ${err.message}`);
                return of(false);
            })
        );
    }
    errorHandler(err: HttpErrorResponse): Observable<Rss> {
        alert(`Error with the request from server ${err.message}`);
        return of(null);
    }
    errorHandlerArray(err: HttpErrorResponse): Observable<Rss[]> {
        alert(`Error with the request from server ${err.message}`);
        return of(null);
    }
}
