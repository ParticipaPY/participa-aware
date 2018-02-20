import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Api } from '../api';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class User {
  _user: any;
  session_key: string;
  
  constructor(public platform: Platform, public api: Api,  public storage: Storage) {
    this.platform.ready().then( () => {
      this.storage.get('session_key').then( (key) => {
        this.session_key = key;
      });
    });
  }

  getSessionKey() {
    return this.storage.get('session_key');
  }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    let data = {
      "email": accountInfo.email, 
      "password": accountInfo.password
    }

    return this.api.post('user/login', data, {});
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo) {
    let data = {
      "email": accountInfo.email,
      "password": accountInfo.password,
      "repeatPassword": accountInfo.repeatPassword,
      "name": accountInfo.name,
      "lang": accountInfo.lang,
      "existingAssembly": {
        "assemblyId": 112,
        "uuid": "467eb262-2008-4368-9beb-e28b229b9579"
      }
    }

    console.log("Data Signup: ", data);
    return this.api.post('user/signup', data, {});
  }

  editProfile(user_id, accountInfo){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      let data = {
        "uid": user_id,
        "email": accountInfo.email,
        "name": accountInfo.name,
        "lang": accountInfo.lang
      }
      console.log("AC - Data to edit profile: ", data);
      console.log("AC - Data to edit profile, session_key: ", this.session_key);
      
      return this.api.put('user/' + user_id, data, {'SESSION_KEY': this.session_key});
    });
    
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }
}
