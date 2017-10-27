import { Injectable } from '@angular/core';
import { Api } from '../api';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class User {
  _user: any;
  session_key: string;
  
  constructor(public api: Api,  public storage: Storage) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });
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
        "assemblyId": 111,
        "uuid": "bfe4464b-549d-4231-acc0-7e1c24833ad9"
      }
    }

    return this.api.post('user/signup', data, {});
  }

  editProfile(user_id, accountInfo){
    let data = {
      "uid": user_id,
      "email": accountInfo.email,
      "name": accountInfo.name,
      "lang": accountInfo.lang,
    }

    return this.api.put('user/' + user_id, data, {'SESSION_KEY': this.session_key});
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
