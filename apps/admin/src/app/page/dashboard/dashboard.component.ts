import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrdersService } from '@bluebits/orders';
import { ProductsService } from '@bluebits/products';
import { UsersService } from '@bluebits/users';
import { Subject, combineLatest, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: []
})
export class DashboardComponent implements OnInit, OnDestroy {
    statistics = [];
    endSubs$: Subject<any> = new Subject();

    constructor(private userService: UsersService, private productService: ProductsService, private ordersService: OrdersService) {}

    ngOnInit(): void {
        combineLatest([
            this.ordersService.getOrdersCount(),
            this.productService.getProductsCount(),
            this.userService.getUsersCount(),
            this.ordersService.getTotalSales()
        ])
            .pipe(takeUntil(this.endSubs$))
            .subscribe((values) => {
                this.statistics = values;
            });
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }
}
