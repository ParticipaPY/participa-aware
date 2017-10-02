import { Injectable } from '@angular/core';
import { Api } from '../api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  _user: any;
  
  constructor(public api: Api) {

  }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    return this.api.post('user/login', {email:accountInfo.email, password:accountInfo.password}, {});
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
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
