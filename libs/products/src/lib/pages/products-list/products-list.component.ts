import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { CategoriesService, Category, Product } from '@bluebits/products';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'products-list',
    templateUrl: './products-list.component.html',
    styles: []
})
export class ProductsListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    categories: Category[] | any = [];
    isCategoryPage = false;
    endSubs$: Subject<any> = new Subject();

    constructor(private prodService: ProductsService, private catService: CategoriesService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            params.categoryid ? (this.isCategoryPage = true) : (this.isCategoryPage = false);
            params.categoryid ? this._getProducts([params.categoryid]) : this._getProducts();
        });
        this._getProducts();
        this._getCategories();
    }

    ngOnDestroy() {
        this.endSubs$.next(0);
        this.endSubs$.complete();
    }

    private _getProducts(categoriesFilter?: string[]) {
        this.prodService
            .getProducts(categoriesFilter)
            .pipe(takeUntil(this.endSubs$))
            .subscribe((resProducts) => {
                this.products = resProducts;
            });
    }

    private _getCategories() {
        this.catService
            .getCategories()
            .pipe(takeUntil(this.endSubs$))
            .subscribe((resCategories) => {
                this.categories = resCategories;
            });
    }

    categoryFilter() {
        const selectedCategories = this.categories.filter((category) => category.checked).map((category) => category.id);
        this._getProducts(selectedCategories);
    }
}
