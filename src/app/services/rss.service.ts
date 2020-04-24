import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { Rss } from '../model/rss';
import { Server } from '../model/server';
import { map, catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class RssService {
    private base = '/api/rss';
    private wb: Subject<Rss[]>;

    constructor(private http: HttpClient, private userService: UserService) {
        this.wb = new Subject<Rss[]>();
        this.registerSailsListener();
    }
    registerSailsListener(): void {
        self["io"].socket.on('reload', (data:Rss[]) => {
            this.wb.next(data);
        }); 
        self["io"].socket.on('connect', () => {
            console.log('Connected');
        }); 
    }
    getData(): Observable<Rss[]> {
        return this.wb.asObservable();
    }
    findRssById(rssId: number): Observable<Rss> {
        return this.http.get<Rss>(`${this.base}/rss/${rssId}`).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandler)
        );
    }
    findAllRss(): Observable<Rss[]> {
        return this.http.get<Rss[]>(`${this.base}?limit=5000&user=${this.userService.currentUser}`).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandlerArray)
        );
    }
    findAllRssEx(sort:string, dir:string): Observable<Rss[]> {
        return this.http.get<Rss[]>(`${this.base}?limit=5000&user=${this.userService.currentUser}&sort=${sort} ${dir}`).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandlerArray)
        );
    }
    createRss(data: Rss): Observable<Rss> {
        data.user = this.userService.currentUser;
        return this.http.post<Rss>(`${this.base}`, data).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandler)
        );
    }
    updateRss(data: Rss): Observable<Rss> {
        return this.http.patch<Rss>(`${this.base}/${data.id}`, data).pipe(
            map(res => {
                return res;
            }),
            catchError(this.errorHandler)
        );
    }
    deleteRss(rssId: number): Observable<boolean> {
        return this.http.delete<any>(`${this.base}/${rssId}`).pipe(
            map(res => {
                return true;
            }),
            catchError(err => {
                alert(`Error with the request ${err.message}`);
                return of(false);
            })
        );
    }
    runCheck(): Observable<Object> {
        return this.http.get<Server>(`${this.base}/runcheck`).pipe(
            map(res => {
                if (res.success) {
                    return {success:true, msg:`Found ${res.data['Anime']} Anime and ${res.data['Manga']} Manga`};
                } else {
                    alert(`Error with the runcheck request ${res.msg}`);
                    return {sucess:false};
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
