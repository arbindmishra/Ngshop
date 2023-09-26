import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { CartItemsDetailed } from '@bluebits/orders';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'orders-cart-page',
    templateUrl: './cart-page.component.html',
    styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
    cartItemsDetailed: CartItemsDetailed[] = [];
    endSubs$: Subject<any> = new Subject();
    cartCount = 0;
    isOrder = false;
    constructor(private router: Router, private cartService: CartService, private ordersService: OrdersService) {}

    ngOnInit(): void {
        this._getCartDetails();
    }

    ngOnDestroy(): void {
        this.endSubs$.next(0);
        this.endSubs$.complete();
    }

    private _getCartDetails() {
        this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
            this.cartItemsDetailed = []; //ENSURES THAT CARTITEMS ARE EMPTY, SO WHILE DELETING ITEM THE CART IS UPDATED
            this.cartCount = respCart?.items?.length ?? 0; //GIVES CART COUNT
            respCart.items?.forEach((cartItem) => {
                this.ordersService.getProduct(cartItem.productId).subscribe((resProduct) => {
                    this.cartItemsDetailed.push({
                        product: resProduct,
                        quantity: cartItem.quantity
                    });
                });
            });
        });
        if (this.cartCount != 0) {
            this.isOrder = true;
        }
    }

    backToShop() {
        this.router.navigate(['/products']);
    }

    deleteCartItem(cartItem: CartItemsDetailed) {
        this.cartService.deleteCartItem(cartItem.product.id);
        if (this.cartCount == 0) {
            this.isOrder = false;
        }
    }

    updateCartItemQuantity(event, cartItem: CartItemsDetailed) {
        this.cartService.setCartItem(
            {
                productId: cartItem.product.id,
                quantity: event.value
            },
            true
        );
    }
}
