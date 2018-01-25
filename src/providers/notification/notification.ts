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

  getUserLocations(user_id){
    let options = new RequestOptions({ headers: this.headers });
    
    return this.api.get('notification/user/' + user_id + '/locations', {}, options).map(res => res.json());    
  }

  storeUserLocation(user_id, locations){
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "home": locations.home,
      "work": locations.work,
      "other": locations.other
    };
    
    return this.api.post('notification/user/' + user_id + '/register-location', data, options).map(res => res.json());
  }

  updateUserLocation(user_id, locations){
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "home": locations.home,
      "work": locations.work,
      "other": locations.other
    };
    
    return this.api.put('notification/user/' + user_id + '/locations', data, options).map(res => res.json());
  }

  storeUserToken(user_id, token){
    console.log("Calling Service to Store User Token for user: ", user_id);
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "user": parseInt(user_id),
      "token": token
    };
    
    return this.api.post('notification/user/' + user_id + '/register-token', data, options).map(res => res.json());
  }

  createUserNotificationConfig(user_id){
    console.log("Calling Service to Create User Notification Config for user: ", user_id);
    let options = new RequestOptions({ headers: this.headers });

    return this.api.post('notification/user/' + user_id + '/config-notification', [], options).map(res => res.json());    
  }

}
