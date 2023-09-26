export const ORDER_STATUS: { [key: string]: { label: string; color: string } } = {
    Pending: {
        label: 'Pending',
        color: 'primary'
    },
    Processed: {
        label: 'Processed',
        color: 'warning'
    },
    Shipped: {
        label: 'Shipped',
        color: 'warning'
    },
    Delivered: {
        label: 'Delivered',
        color: 'success'
    },
    Failed: {
        label: 'Failed',
        color: 'danger'
    }
};
