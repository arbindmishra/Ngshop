import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User, UsersService } from '@bluebits/users';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, timer } from 'rxjs';
import { Location } from '@angular/common';

@Component({
    selector: 'admin-users-form',
    templateUrl: './users-form.component.html',
    styleUrls: ['./users-form.component.scss']
})
export class UsersFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    editmode = false;
    isSubmitted = false;
    currentUserId: string;
    countries = [];
    endSubs$: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private usersService: UsersService,
        private messageService: MessageService,
        private location: Location
    ) {}

    ngOnInit(): void {
        this._initUserForm();
        this._getCountries();
        this._checkEditMode();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    get userForm() {
        return this.form.controls;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const user: User = {
            id: this.currentUserId,
            name: this.userForm.name.value,
            password: this.userForm.password.value,
            email: this.userForm.email.value,
            phone: this.userForm.phone.value,
            isAdmin: this.userForm.isAdmin.value,
            street: this.userForm.street.value,
            apartment: this.userForm.apartment.value,
            zip: this.userForm.zip.value,
            city: this.userForm.city.value,
            country: this.userForm.country.value
        };
        if (this.editmode) {
            this._updateUser(user);
        } else {
            this._addUser(user);
        }
    }

    private _initUserForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            password: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            isAdmin: [false],
            street: [''],
            apartment: [''],
            zip: [''],
            city: [''],
            country: ['']
        });
    }

    //GETTING THE COUNTRIES LIST
    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endSubs$)).subscribe((params) => {
            if (params.id) {
                this.currentUserId = params.id;
                this.editmode = true;
                this.usersService
                    .getUser(params.id)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe((user) => {
                        this.userForm.name.setValue(user.name);
                        this.userForm.email.setValue(user.email);
                        this.userForm.phone.setValue(user.phone);
                        this.userForm.isAdmin.setValue(user.isAdmin);
                        this.userForm.street.setValue(user.street);
                        this.userForm.apartment.setValue(user.apartment);
                        this.userForm.zip.setValue(user.zip);
                        this.userForm.city.setValue(user.city);
                        this.userForm.country.setValue(user.country);

                        //When user doesn't want to change password(to avoid password is required text)
                        this.userForm.password.setValidators([]);
                        this.userForm.password.updateValueAndValidity();
                    });
            }
        });
    }

    private _addUser(user: User) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.usersService
            .createUser(user)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (user: User) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `User ${user.name} is Created.` });
                    //After the timer it send us back to users page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User is not created!' });
                }
            );
    }

    private _updateUser(user: User) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.usersService
            .updateUser(user)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User is updated.' });
                    //After the timer it send us back to users page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User is not updated!' });
                }
            );
    }
}
