import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UsersService } from '@bluebits/users';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, OnDestroy {
    users: User[] = [];
    endSubs$: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private usersService: UsersService
    ) {}

    ngOnInit(): void {
        this._getUsers();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    private _getUsers() {
        this.usersService
            .getUsers()
            .pipe(takeUntil(this.endSubs$))
            .subscribe((users) => {
                this.users = users;
            });
    }

    updateUser(userId: string) {
        this.router.navigateByUrl(`users/form/${userId}`);
    }

    deleteUser(userId: string) {
        this.confirmationService.confirm({
            message: 'Do you want to Remove this User?',
            header: 'Remove User',
            icon: 'pi pi-exclamation-triangle ',
            accept: () => {
                this.usersService
                    .deleteUser(userId)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe(
                        () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User is removed' });
                            this._getUsers();
                        },
                        () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User is not removed!' });
                        }
                    );
            }
        });
    }

    //TO DISPLAY THE COUNTRY NAME BY GETTING THE NAME USING COUNTRYKEY
    getCountryName(countryKey: string) {
        if (countryKey) return this.usersService.getCountry(countryKey);
    }
}
