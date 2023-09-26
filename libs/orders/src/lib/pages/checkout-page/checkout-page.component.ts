import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@bluebits/users';
import { OrderItem } from '../../models/order-item';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order';
import { Cart } from '../../models/cart';
import { ORDER_STATUS } from '../../order.constants';
import { StripeService } from 'ngx-stripe';
import { error } from '@angular/compiler/src/util';

@Component({
    selector: 'orders-checkout-page',
    templateUrl: './checkout-page.component.html',
    styles: []
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
    checkoutFormGroup!: FormGroup;
    isSubmitted = false;
    orderItems: OrderItem[] = [];
    userId!: string; //STATIC ID FOR GUEST USER FROM ADMIN-PANEL
    countries = [];
    unsubscribe$: Subject<any> = new Subject();
    constructor(
        private router: Router,
        private usersService: UsersService,
        private formBuilder: FormBuilder,
        private cartService: CartService,
        private ordersService: OrdersService,
        private stripeService: StripeService
    ) {}

    ngOnInit(): void {
        this._initCheckoutForm();
        this._getCartItems();
        this._getCountries();
        this._autoFillUserData();
    }
    ngOnDestroy(): void {
        this.unsubscribe$.next(0);
        this.unsubscribe$.complete();
    }

    private _initCheckoutForm() {
        this.checkoutFormGroup = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.email, Validators.required]],
            phone: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            zip: ['', Validators.required],
            apartment: ['', Validators.required],
            street: ['', Validators.required]
        });
    }

    private _autoFillUserData() {
        this.usersService
            .observeCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user) => {
                // console.log(user);
                if (user) {
                    this.userId = user.id;
                    this.checkoutForm.name.setValue(user.name);
                    this.checkoutForm.email.setValue(user.email);
                    this.checkoutForm.phone.setValue(user.phone);
                    this.checkoutForm.city.setValue(user.city);
                    this.checkoutForm.country.setValue(user.country);
                    this.checkoutForm.zip.setValue(user.zip);
                    this.checkoutForm.apartment.setValue(user.apartment);
                    this.checkoutForm.street.setValue(user.street);
                }
            });
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }
    private _getCartItems() {
        const cart: Cart = this.cartService.getCart();
        this.orderItems = cart.items?.map((item) => {
            return {
                product: item.productId,
                quantity: item.quantity
            };
        });
    }

    backToCart() {
        this.router.navigate(['/cart']);
    }

    placeOrder() {
        this.isSubmitted = true;
        if (this.checkoutFormGroup.invalid) {
            return;
        }

        const order: Order = {
            orderItems: this.orderItems,
            phone: this.checkoutForm.phone.value,
            shippingAddress1: this.checkoutForm.street.value,
            shippingAddress2: this.checkoutForm.apartment.value,
            city: this.checkoutForm.city.value,
            zip: this.checkoutForm.zip.value,
            country: this.checkoutForm.country.value,

            status: Object.keys(ORDER_STATUS)[0],
            user: this.userId,
            dateOrdered: `${Date.now()}`
        };
        this.ordersService.cacheOrderData(order);
        console.log(order);

        this.ordersService.createCheckoutSession(this.orderItems).subscribe((error) => {
            if (error) {
                console.log('Error in redirect to payment');
            }
        });
    }

    get checkoutForm() {
        return this.checkoutFormGroup.controls;
    }
}
