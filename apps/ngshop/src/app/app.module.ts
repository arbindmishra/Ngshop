import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AccordionModule } from 'primeng/accordion';
import { NavComponent } from './shared/nav/nav.component';
import { ProductsModule } from '@bluebits/products';
import { UiModule } from '@bluebits/ui';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { OrdersModule } from '@bluebits/orders';
import { MessagesComponent } from './shared/messages/messages.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { JwtInterceptor, UsersModule } from '@bluebits/users';

//FOR NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

//STRIPE
import { NgxStripeModule } from 'ngx-stripe';

//VARIABLE TO STORE ALL THE ROUTINGS--> WE SPECIFY THE VARIAVLE IN THE IMPORTS
const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    }
];
@NgModule({
    declarations: [AppComponent, NxWelcomeComponent, HomePageComponent, HeaderComponent, FooterComponent, NavComponent, MessagesComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        AccordionModule,
        ProductsModule,
        UiModule,
        HttpClientModule,
        OrdersModule,
        ToastModule,
        UsersModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        NgxStripeModule.forRoot('pk_test_51NPnZRSJeQTzpYbyPHbrjIi2DWjfNxSzKph0QZkeeAxB28brvefViUQTuqpWYrFWHS6r0XQFMIuTcIm7pXzvjuCR00hJzRbOri')
    ],
    providers: [MessageService, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
    bootstrap: [AppComponent],
    exports: [MessagesComponent]
})
export class AppModule {}
