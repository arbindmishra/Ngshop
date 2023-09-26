import { NgModule } from '@angular/core';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { ShellComponent } from './shared/shell/shell.component';
import { AuthGuard } from '@bluebits/users';
import { CategoriesListComponent } from './page/categories/categories-list/categories-list.component';
import { CategoriesFormComponent } from './page/categories/categories-form/categories-form.component';
import { ProductsListComponent } from './page/products/products-list/products-list.component';
import { ProductsFormComponent } from './page/products/products-form/products-form.component';
import { UsersListComponent } from './page/users/users-list/users-list.component';
import { RouterModule, Routes } from '@angular/router';
import { OrdersDetailComponent } from './page/orders/orders-detail/orders-detail.component';
import { OrdersListComponent } from './page/orders/orders-list/orders-list.component';
import { UsersFormComponent } from './page/users/users-form/users-form.component';

const routes: Routes = [
    {
        path: '',
        component: ShellComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'categories',
                component: CategoriesListComponent
            },
            {
                path: 'categories/form',
                component: CategoriesFormComponent
            },
            {
                path: 'categories/form/:id',
                component: CategoriesFormComponent
            },
            {
                path: 'products',
                component: ProductsListComponent
            },
            {
                path: 'products/form',
                component: ProductsFormComponent
            },
            {
                path: 'products/form/:id',
                component: ProductsFormComponent
            },
            {
                path: 'users',
                component: UsersListComponent
            },
            {
                path: 'users/form',
                component: UsersFormComponent
            },
            {
                path: 'users/form/:id',
                component: UsersFormComponent
            },
            {
                path: 'orders',
                component: OrdersListComponent
            },
            {
                path: 'orders/detail/:id',
                component: OrdersDetailComponent
            }
        ]
    },
    {
        // path:'**'----means-->Everything that is not included above */
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled' })],
    exports: [RouterModule],
    declarations: [],
    providers: []
})
export class AppRoutingModule {}
