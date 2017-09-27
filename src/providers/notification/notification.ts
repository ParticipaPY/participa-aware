import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { NotificationApi } from '../notification-api/notification-api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';

/*
  Generated class for the NotificationProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class Notification {
  headers = new Headers();

  constructor(public api: NotificationApi) {  
    this.headers.append('Content-Type', 'application/json');        
  }

  storeUserToken(user_id, token){
    console.log("Calling Service to Store User Token for user: ", user_id);
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "user_id": parseInt(user_id),
      "token": token
    };
    
    return this.api.post('user/' + user_id + '/register-token', data, options).map(res => res.json());
  }

  createUserNotificationConfig(user_id){
    console.log("Calling Service to Create User Notification Config for user: ", user_id);
    let options = new RequestOptions({ headers: this.headers });

    return this.api.post('user/' + user_id + '/config-notification', [], options).map(res => res.json());    
  }
}
