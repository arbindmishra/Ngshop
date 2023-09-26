import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order, ORDER_STATUS, OrdersService } from '@bluebits/orders';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-orders-list',
    templateUrl: './orders-list.component.html',
    styles: []
})
export class OrdersListComponent implements OnInit, OnDestroy {
    endSubs$: Subject<any> = new Subject();
    constructor(
        private ordersService: OrdersService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    orders: Order[] = [];
    orderStatus = ORDER_STATUS;

    ngOnInit(): void {
        this._getOrders();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    private _getOrders() {
        this.ordersService
            .getOrders()
            .pipe(takeUntil(this.endSubs$))
            .subscribe((orders) => {
                this.orders = orders;
            });
    }

    showOrder(orderId) {
        this.router.navigateByUrl(`orders/detail/${orderId}`);
    }

    deleteOrder(orderId: string) {
        this.confirmationService.confirm({
            message: 'Do you want to Delete this Order?',
            header: 'Delete Order',
            icon: 'pi pi-exclamation-triangle ',
            accept: () => {
                this.ordersService
                    .deleteOrder(orderId)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe(
                        () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order is deleted' });
                            this._getOrders();
                        },
                        (error) => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order is not deleted!' });
                        }
                    );
            }
        });
    }
}
