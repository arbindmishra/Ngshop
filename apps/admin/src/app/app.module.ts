import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';

import { CategoriesService, ProductsService } from '@bluebits/products';
import { AuthGuard, JwtInterceptor, UsersModule, UsersService } from '@bluebits/users';
import { OrdersService } from '@bluebits/orders';
import { ConfirmationService, MessageService } from 'primeng/api';

import { DashboardComponent } from './page/dashboard/dashboard.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CategoriesFormComponent } from './page/categories/categories-form/categories-form.component';
import { CategoriesListComponent } from './page/categories/categories-list/categories-list.component';
import { ProductsFormComponent } from './page/products/products-form/products-form.component';
import { ProductsListComponent } from './page/products/products-list/products-list.component';
import { UsersFormComponent } from './page/users/users-form/users-form.component';
import { UsersListComponent } from './page/users/users-list/users-list.component';
import { OrdersListComponent } from './page/orders/orders-list/orders-list.component';
import { OrdersDetailComponent } from './page/orders/orders-detail/orders-detail.component';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { TagModule } from 'primeng/tag';
import { InputMaskModule } from 'primeng/inputmask';
import { FieldsetModule } from 'primeng/fieldset';
import { AppRoutingModule } from './app-routing.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgxStripeModule } from 'ngx-stripe';

const UX_MODULE = [
    CardModule,
    ToolbarModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ColorPickerModule,
    InputNumberModule,
    InputTextareaModule,
    InputSwitchModule,
    DropdownModule,
    EditorModule,
    TagModule,
    InputMaskModule,
    FieldsetModule
];

@NgModule({
    declarations: [
        AppComponent,
        NxWelcomeComponent,
        DashboardComponent,
        ShellComponent,
        SidebarComponent,
        CategoriesListComponent,
        CategoriesFormComponent,
        ProductsListComponent,
        ProductsFormComponent,
        UsersFormComponent,
        UsersListComponent,
        OrdersListComponent,
        OrdersDetailComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        UsersModule,
        AppRoutingModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        ...UX_MODULE,
        NgxStripeModule.forRoot('pk_test_51NPnZRSJeQTzpYbyPHbrjIi2DWjfNxSzKph0QZkeeAxB28brvefViUQTuqpWYrFWHS6r0XQFMIuTcIm7pXzvjuCR00hJzRbOri')
    ],
    providers: [
        CategoriesService,
        MessageService,
        ConfirmationService,
        ProductsService,
        UsersService,
        OrdersService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
