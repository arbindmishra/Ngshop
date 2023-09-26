import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { Router } from '@angular/router';

@Component({
    selector: 'orders-order-summary',
    templateUrl: './order-summary.component.html',
    styles: []
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
    endSubs$: Subject<any> = new Subject();
    totalPrice!: number;
    isCheckout = false;
    constructor(private cartService: CartService, private ordersService: OrdersService, private router: Router) {
        //TO HIDE THE CHECKOUT BUTTON IN CHECKOUT PAGE--> IF THE URL INCLUDES CHECKOUT
        this.router.url.includes('checkout') ? (this.isCheckout = true) : (this.isCheckout = false);
    }

    ngOnInit(): void {
        this._getOrderSummary();
    }
    ngOnDestroy(): void {
        this.endSubs$.next(0);
        this.endSubs$.complete();
    }

    _getOrderSummary() {
        this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((cart) => {
            this.totalPrice = 0;

            if (cart) {
                cart.items.map((item) => {
                    this.ordersService
                        .getProduct(item.productId)
                        //take(1) takes one and ends it, doesn't requires this.endSubs$ to the end the subscription
                        .pipe(take(1))
                        .subscribe((product) => {
                            this.totalPrice += product.price * item.quantity;
                        });
                });
            }
        });
    }

    navigateToCheckout() {
        this.router.navigate(['/checkout']);
    }
}
