import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrdersService, ORDER_STATUS } from '@bluebits/orders';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-orders-detail',
    templateUrl: './orders-detail.component.html',
    styles: []
})
export class OrdersDetailComponent implements OnInit, OnDestroy {
    order: Order;
    selectedStatus: any;
    orderStatuses = [];
    endSubs$: Subject<any> = new Subject();
    constructor(private orderService: OrdersService, private route: ActivatedRoute, private messageService: MessageService) {}

    ngOnInit(): void {
        this._mapOrderStatus();
        this._getOrder();
    }
    ngOnDestroy(): void {
        this.endSubs$.complete();
    }

    private _getOrder() {
        this.route.params.subscribe((params) => {
            if (params.id) {
                this.orderService
                    .getOrder(params.id)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe((order) => {
                        this.order = order;
                        this.selectedStatus = order.status;
                    });
            }
        });
    }
    private _mapOrderStatus() {
        this.orderStatuses = Object.keys(ORDER_STATUS).map((key) => {
            return {
                id: key,
                name: ORDER_STATUS[key].label
            };
        });
    }

    onStatusChange(event) {
        this.orderService
            .updateOrder({ status: event.value }, this.order.id)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Order is ${event.value}.` });
            }),
            () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order is not updated!' });
            };
    }
}
