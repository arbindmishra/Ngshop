import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { LocalstorageService } from './localstorage.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient, private tokenService: LocalstorageService, private router: Router) {}

    login(email: string, password: string): Observable<User> {
        return this.http.post<User>(`http://localhost:3000/api/v1/users/login`, { email: email, password: password });
    }

    logout() {
        this.tokenService.removeToken();
        this.router.navigate(['/login']);
    }
}
