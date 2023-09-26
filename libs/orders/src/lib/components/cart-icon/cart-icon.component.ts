import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'orders-cart-icon',
    templateUrl: './cart-icon.component.html',
    styles: []
})
export class CartIconComponent implements OnInit {
    cartCount = 0;
    constructor(private cartService: CartService) {}

    ngOnInit(): void {
        //WE DON'T NEED TO END THE SUBSCRIPTION AS WE ARE ALWAYS SUBSCRIBING TO THE CART AS THE HEADER COMPONENT IS ALWAYS BEING ACCESSED
        //THE CART-ICON COMPONENT IS ONLY CREATED ONCE, BUT GETTING UPDATED MULTIPLE TIMES
        this.cartService.cart$.subscribe((cart) => {
            //IF UNDEFINED GIVE CARTCOUNT AS 0 --> ??
            this.cartCount = cart?.items?.length ?? 0;
        });
        // this.cartCount = this.cartService.getCart().items?.length;
    }
}
