import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DisplayImage {
  label: string,
  meta:any
}


@Injectable({
  providedIn: 'root'
})

export class ImageLoaderService {

  counter:number;
  private newPictureIdUrl = 'http://localhost:3000/api/getNewPictureId';
  
  constructor(  private http: HttpClient) { 
  }

  getNewImage (): Observable<any> {
    return this.http.get<any>(this.newPictureIdUrl)
  }
}
