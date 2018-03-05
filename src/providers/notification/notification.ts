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
    let data : { [index: string]: number } = {};
    
    if (locations.home != null)
      data["home"] = parseInt(locations.home);
    if (locations.work != null)
      data["work"] = parseInt(locations.work);
    if (locations.other != null)
      data["other"] = parseInt(locations.other);
    
    console.log("Data to be send - Register Location: ", data);
    
    return this.api.post('notification/user/' + user_id + '/register-location', data, options).map(res => res.json());
  }

  updateUserLocation(user_id, locations){
    let options = new RequestOptions({ headers: this.headers });
    let data : { [index: string]: number } = {};
    
    if (locations.home != null && locations.home != "0")
      data["home"] = parseInt(locations.home);
    if (locations.work != null && locations.work != "0")
      data["work"] = parseInt(locations.work);
    if (locations.other != null && locations.other != "0")
      data["other"] = parseInt(locations.other);
    
    console.log("Data to be send - Update Location: ", data);

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

  createUserNotificationConfig(user_id, email){
    console.log("Calling Service to Create User Notification Config for user: ", user_id);
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "user" : user_id,
      "email": email
    }

    return this.api.post('notification/user/' + user_id + '/config-notification', data, options).map(res => res.json());    
  }

  notifyNewComment(param){
    console.log("Calling Service to Notify new Comment");
    let options = new RequestOptions({ headers: this.headers });
    let data = {
      "idea_id": param.idea_id,
      "idea_author": param.idea_author,
      "comment_author": param.comment_author
    };
    
    return this.api.post('notification/notify-comment', data, options).map(res => res.json());
    
  }
}
