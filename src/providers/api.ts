import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import 'rxjs/add/operator/map';
import { Platform } from 'ionic-angular';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'https://example.com/api/v1';  
  
  constructor(public platform: Platform, public http: HTTP) {
    this.platform.ready().then( () => {
      this.http.setDataSerializer("json");
      this.http.setHeader('Accept', 'application/json');
      this.http.setHeader('Content-Type', 'application/json');
    });
  }

  get(endpoint: string, params?: any, options?: any) {
    return this.http.get(this.url + '/' + endpoint, params, options);
  }

  post(endpoint: string, body: any, options: any) {
    return this.http.post(this.url + '/' + endpoint, body, options);
  }

  put(endpoint: string, body: any, options: any) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }

  delete(endpoint: string, options: any) {
    return this.http.delete(this.url + '/' + endpoint, {}, options);
  }

  patch(endpoint: string, body: any, options: any) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }
}
