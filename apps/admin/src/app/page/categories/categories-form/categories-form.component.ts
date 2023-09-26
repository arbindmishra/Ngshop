import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService, Category } from '@bluebits/products';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs/internal/observable/timer';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-categories-form',
    templateUrl: './categories-form.component.html',
    styles: []
})
export class CategoriesFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editmode = false;
    currentCategoryId: string;

    //endSubs takes in the subscription values and when it cease to exist, it stops the subscription so as to free the Network
    endSubs$: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private categoriesService: CategoriesService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            icon: ['', Validators.required],
            color: ['#fff']
        });

        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const category: Category = {
            id: this.currentCategoryId,
            name: this.categoryForm.name.value,
            icon: this.categoryForm.icon.value,
            color: this.categoryForm.color.value
        };
        if (this.editmode) {
            this._updateCategory(category);
        } else {
            this._addCategory(category);
        }
    }

    //To change if we are in edit mode([]=?: in the html file)
    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endSubs$)).subscribe((params) => {
            if (params.id) {
                this.currentCategoryId = params.id;
                this.editmode = true;
                this.categoriesService.getCategory(params.id).subscribe((category) => {
                    this.categoryForm.name.setValue(category.name);
                    this.categoryForm.icon.setValue(category.icon);
                    this.categoryForm.color.setValue(category.color);
                });
            }
        });
    }

    private _addCategory(category) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.categoriesService
            .createCategory(category)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (category: Category) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Category ${category.name} is Created.` });
                    //After the timer it send us back to categories page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Category is not created!' });
                }
            );
    }

    private _updateCategory(category: Category) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.categoriesService
            .updateCategory(category)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (category: Category) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Category ${category.name} is updated.` });
                    //After the timer it send us back to categories page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Category is not updated!' });
                }
            );
    }

    //GET AND SET METHOD
    //USING TO SHORT THE CODE BY RETURNING this.form.controls as categoryForm
    get categoryForm() {
        return this.form.controls;
    }
}
