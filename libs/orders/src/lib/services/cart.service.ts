import { Injectable } from '@angular/core';
import { Cart, CartItem } from '../models/cart';
import { BehaviorSubject } from 'rxjs';

export const CART_KEY = 'cart';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    //cart is an observable always suffixed with $ sign to show it is an observable --BehaviourSubject to update from start
    cart$: BehaviorSubject<Cart> = new BehaviorSubject(this.getCart());

    constructor() {}

    initCartLocalStorage() {
        const cart: Cart = this.getCart();
        //IF THERE ALREADY EXISTS A CART IN LOCALSTORAGE IT WON'T CREATE A NEW CART
        if (!cart) {
            const initialCart = {
                items: []
            };
            const initialCartJson = JSON.stringify(initialCart);
            localStorage.setItem(CART_KEY, initialCartJson);
        } else {
            //SO THAT DURING RELOADING THE CART COUNT COMES UP(OTHERWISE WILL BE 0 TILL ADDTOCART DONE)
            this.cart$.next(cart);
        }
    }

    emptyCart() {
        const initialCart = {
            items: []
        };
        const initialCartJson = JSON.stringify(initialCart);
        localStorage.setItem(CART_KEY, initialCartJson);
        this.cart$.next(initialCart); //TO CHANGE THE OBSERVABLE & OBSERVE THIS
    }

    getCart(): Cart {
        const cartJsonString: string = localStorage.getItem(CART_KEY);
        const cart: Cart = JSON.parse(cartJsonString);
        return cart;
    }

    setCartItem(cartItem: CartItem, updateCartItem?: boolean): Cart {
        const cart = this.getCart();
        const cartItemExist = cart.items?.find((item) => {
            if (item.productId === cartItem.productId) {
                return true;
            } else {
                return false;
            }
        });

        if (cartItemExist) {
            cart.items?.map((item) => {
                if (item.productId === cartItem.productId) {
                    if (updateCartItem) {
                        item.quantity = cartItem.quantity;
                    } else {
                        item.quantity = item.quantity + cartItem.quantity;
                    }

                    return item;
                }
            });
        } else {
            cart.items?.push(cartItem);
        }
        const cartJson = JSON.stringify(cart);
        localStorage.setItem(CART_KEY, cartJson);
        //TELLS THE OBSERVABLE$ TO UPDATE ITSELF
        this.cart$.next(cart);
        return cart;
    }

    deleteCartItem(productId: string) {
        const cart = this.getCart();
        const newCart = cart.items?.filter((item) => item.productId !== productId);

        cart.items = newCart;
        const cartJsonString = JSON.stringify(cart);
        localStorage.setItem(CART_KEY, cartJsonString);
        //TELLS THE OBSERVABLE$ TO UPDATE ITSELF
        this.cart$.next(cart);
    }
}
