import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    constructor(private http: HttpClient) {}

    //Observable basically makes us to wait till the data comes from backend and gives us a green signal when the whole data is available
    //return this.http.get returns the value is Observable<Object> Format
    //Category[Array](returning format) makes the data get in the format mentioned in models-->category.ts(format req in frontend) frm the http req
    //We mention get<Category[]> so it tells in which format to get category ( only get('url')) will give error
    //HERE []---> means multiple
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>('http://localhost:3000/api/v1/categories/');
    }

    //Used to get details while update a category
    //Accessed the category id ---> using the object id
    getCategory(categoryId: string): Observable<Category> {
        return this.http.get<Category>(`http://localhost:3000/api/v1/categories/${categoryId}`);
        //OR ('http://localhost:3000/api/v1/categories/' + categoryId)
    }

    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>('http://localhost:3000/api/v1/categories/', category);
    }

    updateCategory(category: Category): Observable<Category> {
        return this.http.put<Category>('http://localhost:3000/api/v1/categories/' + category.id, category);
    }

    deleteCategory(categoryId: string): Observable<unknown> {
        return this.http.delete<unknown>(`http://localhost:3000/api/v1/categories/${categoryId}`);
    }
}
