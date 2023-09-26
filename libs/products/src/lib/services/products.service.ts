import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    constructor(private http: HttpClient) {}

    //Observable basically makes us to wait till the data comes from backend and gives us a green signal when the whole data is available
    //return this.http.get returns the value is Observable<Object> Format
    //Product[Array](returning format) makes the data get in the format mentioned in models-->Product.ts(format req in frontend) frm the http req
    //We mention get<Product[]> so it tells in which format to get Product ( only get('url')) will give error
    //HERE []---> means multiple
    //categoriesFilter---> from products/products-list
    getProducts(categoriesFilter?: string[]): Observable<Product[]> {
        let params = new HttpParams();
        if (categoriesFilter) {
            params = params.append('categories', categoriesFilter.join(','));
        }
        return this.http.get<Product[]>(`http://localhost:3000/api/v1/products`, { params: params });
    }

    //Used to get details while update a Product
    //Accessed the Product id ---> using the object id
    getProduct(productId: string): Observable<Product> {
        return this.http.get<Product>(`http://localhost:3000/api/v1/products/${productId}`);
        //OR ('http://localhost:3000/api/v1/products/' + ProductId)
    }

    createProduct(productData: FormData): Observable<Product> {
        return this.http.post<Product>('http://localhost:3000/api/v1/products/', productData);
    }

    updateProduct(productData: FormData, productId: string): Observable<Product> {
        return this.http.put<Product>('http://localhost:3000/api/v1/products/' + productId, productData);
    }

    deleteProduct(productId: string): Observable<unknown> {
        return this.http.delete<unknown>(`http://localhost:3000/api/v1/products/${productId}`);
    }

    getProductsCount(): Observable<number> {
        return this.http.get<number>(`http://localhost:3000/api/v1/products/get/count`).pipe(map((objectValue: any) => objectValue.productCount));
    }

    getFeaturedProducts(count: number): Observable<Product[]> {
        return this.http.get<Product[]>(`http://localhost:3000/api/v1/products/get/featured/${count}`);
    }
}
