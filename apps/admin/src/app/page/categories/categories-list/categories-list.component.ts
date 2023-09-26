import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService, Category } from '@bluebits/products';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-categories-list',
    templateUrl: './categories-list.component.html',
    styles: []
})
export class CategoriesListComponent implements OnInit, OnDestroy {
    //Suffix of $ ---represents--> Observable or Subject
    endSubs$: Subject<any> = new Subject();

    //We store the data coming from backend in categories ( which in form of Category[] array coming from categories.model)
    categories: Category[] = [];
    //We import Categories Service & use it by declaring it in constructor
    constructor(
        private categoriesService: CategoriesService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._getCategories();
    }

    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    //Private because this is only meant for this component
    private _getCategories() {
        //Used to get Category details from database, we use subscribe to observe(see when all the data is available) from...
        //...the observable present in getCategories()
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endSubs$))
            .subscribe((cats) => {
                this.categories = cats;
            });
    }

    deleteCategory(categoryId: string) {
        this.confirmationService.confirm({
            message: 'Do you want to Delete this Category?',
            header: 'Delete Category',
            icon: 'pi pi-exclamation-triangle ',
            accept: () => {
                this.categoriesService
                    .deleteCategory(categoryId)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe(
                        () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category is deleted' });
                            this._getCategories();
                        },
                        () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Category is not deleted!' });
                        }
                    );
            }
        });
    }

    //Navigation through router-method(Without using service )
    updateCategory(categoryId: string) {
        this.router.navigateByUrl(`categories/form/${categoryId}`);
    }
}
