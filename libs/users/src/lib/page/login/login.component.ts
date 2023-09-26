import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'users-login',
    templateUrl: './login.component.html',
    styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
    authError = false;
    isSubmitted = false;
    loginFormGroup!: FormGroup;
    authMessage = 'Email or Password are wrong';
    endSubs$: Subject<any> = new Subject();
    constructor(private formBuilder: FormBuilder, private auth: AuthService, private localStorageService: LocalstorageService, private router: Router) {}

    ngOnInit(): void {
        this._initLoginForm();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    private _initLoginForm() {
        this.loginFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    get loginForm() {
        return this.loginFormGroup.controls;
    }
    onSubmit() {
        this.isSubmitted = true;
        if (this.loginFormGroup.invalid) {
            return;
        }
        //To pass the login details into auth.service.ts
        this.auth
            .login(this.loginForm.email.value, this.loginForm.password.value)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (user) => {
                    this.authError = false;
                    this.localStorageService.setToken(user.token);
                    this.router.navigate(['/']);
                },
                (error) => {
                    this.authError = true;
                    if (error.status !== 400) {
                        this.authMessage = 'Error in the server, please try again!';
                    }
                }
            );
    }
}
