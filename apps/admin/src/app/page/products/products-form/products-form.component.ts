import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService, Product, ProductsService } from '@bluebits/products';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, timer } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editmode = false;
    categories = [];
    currentProductId: string;
    imageDisplay: string | ArrayBuffer;
    endSubs$: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private categoriesService: CategoriesService,
        private productsService: ProductsService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._getCategories();
        this._checkEditMode();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    get productForm() {
        return this.form.controls;
    }

    private _initForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            brand: ['', Validators.required],
            price: ['', Validators.required],
            category: ['', Validators.required],
            countInStock: ['', Validators.required],
            description: ['', Validators.required],
            richDescription: [''],
            image: ['', Validators.required],
            isFeatured: [false]
        });
    }

    private _getCategories() {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endSubs$))
            .subscribe((categories) => {
                this.categories = categories;
            });
    }

    //To change if we are in edit mode([]=?: in the html file)
    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endSubs$)).subscribe((params) => {
            if (params.id) {
                this.currentProductId = params.id;
                this.editmode = true;
                this.productsService
                    .getProduct(params.id)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe((product) => {
                        this.productForm.name.setValue(product.name);
                        this.productForm.brand.setValue(product.brand);
                        this.productForm.price.setValue(product.price);
                        this.productForm.category.setValue(product.category.id);
                        this.productForm.countInStock.setValue(product.countInStock);
                        this.productForm.isFeatured.setValue(product.isFeatured);
                        this.productForm.description.setValue(product.description);
                        this.productForm.richDescription.setValue(product.richDescription);
                        this.imageDisplay = product.image;

                        //TO SET IMAGE UPLOAD TO NULL(SO IT DOESN'T GIVE ERROR OF IMAGE REQUIRED DURING EDIT PRODUCT)
                        this.productForm.image.setValidators([]);
                        //TO UPDATE THE FORM AND VALUE
                        this.productForm.image.updateValueAndValidity();
                    });
            }
        });
    }

    private _addProduct(productData: FormData) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.productsService
            .createProduct(productData)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (product: Product) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Product ${product.name} is Created.` });
                    //After the timer it send us back to products page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product is not created!' });
                }
            );
    }
    private _updateProduct(productFormData: FormData) {
        //WE HAVE TO SUBSCRIBE AS IT IS AN OBSERVABLE
        this.productsService
            .updateProduct(productFormData, this.currentProductId)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (product: Product) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Product ${product.name} is updated.` });
                    //After the timer it send us back to categories page(location is used from @angular/common)
                    timer(1000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product is not updated!' });
                }
            );
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        //FormData() from JS
        const productFormData = new FormData();

        Object.keys(this.productForm).map((key) => {
            productFormData.append(key, this.productForm[key].value);
        });

        if (this.editmode) {
            this._updateProduct(productFormData);
        } else {
            this._addProduct(productFormData);
        }
    }

    onImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            //ADDING THE IMAGE TO THE FORM
            this.form.patchValue({ image: file });
            //UPDATING THE VALUE AND FORM
            this.form.get('image').updateValueAndValidity;
            //USING FILE READER TO READ THE IMAGE FILE
            const fileReader = new FileReader();
            //ONLOAD EVENT IS USED TO LOAD THE IMAGE FILE GOT FROM THE USER INTO IMAGEDISPLAY
            fileReader.onload = () => {
                this.imageDisplay = fileReader.result;
            };

            //ALWAYS ONLOAD BEFORE READASDATAURL TO AVOID ANY LOADING ERRORS
            fileReader.readAsDataURL(file);
        }
    }
}
