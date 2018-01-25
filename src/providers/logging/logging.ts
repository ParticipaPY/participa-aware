import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';

import { NotificationApi } from '../notification-api/notification-api';
import 'rxjs/add/operator/map';

@Injectable()
export class LoggingProvider {
  headers = new Headers();

  constructor(public api: NotificationApi, public storage: Storage) {
    this.headers.append('Content-Type', 'application/json');
  }

  getUserInfo(){
    return this.storage.get('userId').then((user_id) => {
      return this.storage.get('name').then( (user_name) => {
        return {name: user_name, id: user_id};
      });
    });
  }

  logAction(param){
    return this.getUserInfo().then( (res) => {
      let options = new RequestOptions({ headers: this.headers });
      let data = {     
        user_id: res.id,
        user_name: res.name,                
        activity: param.action,
        activity_data: param.action_data
      }
      console.log("Logging Action Data: ", data);
      return this.api.post('logging/register-activity', data, options);
    });
  }
  
}
