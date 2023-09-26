import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order';
import { Observable, map, switchMap } from 'rxjs';
import { OrderItem } from '../models/order-item';
import { StripeService } from 'ngx-stripe';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    constructor(private http: HttpClient, private stripeService: StripeService) {}

    //Observable basically makes us to wait till the data comes from backend and gives us a green signal when the whole data is available
    //return this.http.get returns the value is Observable<Object> Format
    //Category[Array](returning format) makes the data get in the format mentioned in models-->category.ts(format req in frontend) frm the http req
    //We mention get<Category[]> so it tells in which format to get category ( only get('url')) will give error
    //HERE []---> means multiple
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>('http://localhost:3000/api/v1/orders/');
    }

    //Used to get details while update a order
    //Accessed the order id ---> using the object id
    getOrder(orderId: string): Observable<Order> {
        return this.http.get<Order>(`http://localhost:3000/api/v1/orders/${orderId}`);
        //OR ('http://localhost:3000/api/v1/orders/' + orderId)
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>('http://localhost:3000/api/v1/orders/', order);
    }

    updateOrder(orderStatus: { status: string }, orderId: string): Observable<Order> {
        return this.http.put<Order>(`http://localhost:3000/api/v1/orders/${orderId}`, orderStatus);
    }

    deleteOrder(orderId: string): Observable<unknown> {
        return this.http.delete<unknown>(`http://localhost:3000/api/v1/orders/${orderId}`);
    }

    getOrdersCount(): Observable<number> {
        return this.http.get<number>(`http://localhost:3000/api/v1/orders/get/count`).pipe(map((objectValue: any) => objectValue.orderCount));
    }
    getTotalSales(): Observable<number> {
        return this.http.get<number>(`http://localhost:3000/api/v1/orders/get/totalsales`).pipe(map((objectValue: any) => objectValue.totalsales));
    }

    getProduct(productId: string): Observable<any> {
        return this.http.get<any>(`http://localhost:3000/api/v1/products/${productId}`);
        //OR ('http://localhost:3000/api/v1/products/' + ProductId)
    }

    createCheckoutSession(orderItems: OrderItem[]) {
        return this.http.post<any>(`http://localhost:3000/api/v1/orders/create-checkout-session`, orderItems).pipe(
            switchMap((session: { id: string }) => {
                return this.stripeService.redirectToCheckout({ sessionId: session.id });
            })
        );
    }

    cacheOrderData(order: Order) {
        localStorage.setItem('orderData', JSON.stringify(order));
    }

    getCachedOrderData(): Order {
        return JSON.parse(localStorage.getItem('orderData'));
    }

    removeCachedOrderData() {
        localStorage.removeItem('orderData');
    }
}
