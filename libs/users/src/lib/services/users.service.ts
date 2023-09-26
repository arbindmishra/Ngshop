import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, map } from 'rxjs';

//Format to import a js Library(npm package)->(madefor _getCountries())
import * as countriesLib from 'i18n-iso-countries';
import { UsersFacade } from '../state/users.facade';
declare const require: (arg0: string) => countriesLib.LocaleData;
//Instead of var countries = require("i18n-iso-countries")-->countries==countriesLib

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    constructor(private http: HttpClient, private usersFacade: UsersFacade) {
        countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`http://localhost:3000/api/v1/users/`);
    }

    getUser(userId: string): Observable<User> {
        return this.http.get<User>(`http://localhost:3000/api/v1/users/${userId}`);
        //OR ('http://localhost:3000/api/v1/users/' + UserId)
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>('http://localhost:3000/api/v1/users/register', user);
    }

    updateUser(user: User): Observable<User> {
        return this.http.put<User>('http://localhost:3000/api/v1/users/' + user.id, user);
    }

    deleteUser(userId: string): Observable<unknown> {
        return this.http.delete<unknown>(`http://localhost:3000/api/v1/users/${userId}`);
    }

    getUsersCount(): Observable<number> {
        return this.http.get<number>(`http://localhost:3000/api/v1/users/get/count`).pipe(map((objectValue: any) => objectValue.userCount));
    }

    //HELPS IN GETTING THE COUNTRY LIST
    getCountries(): { id: string; name: string }[] {
        return Object.entries(countriesLib.getNames('en', { select: 'official' })).map((entry) => {
            return {
                id: entry[0],
                name: entry[1]
            };
        });
    }

    //CONVERTS THE SHORT FORM NAME INTO OFFICIAL FULL NAME
    getCountry(countryKey: string): string {
        return countriesLib.getName(countryKey, 'en');
    }

    initAppSession() {
        this.usersFacade.buildUserSession();
    }

    observeCurrentUser() {
        return this.usersFacade.currentUser$;
    }
    isCurrentUserAuth() {
        return this.usersFacade.isAuthenticated$;
    }
}
