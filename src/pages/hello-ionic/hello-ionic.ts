import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from "@angular/http";

import { User } from '../../providers/user/user';

import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  // account: { email: string, password: string } = {
  //   email: 'test@example.com',
  //   password: 'test'
  // };
  account: { email: string, password: string } = {email: "", password: ""}
  lat: any;
  long: any;

  constructor(public navCtrl: NavController, public user: User, public toastCtrl: ToastController, private geolocation: Geolocation, public http: Http, private storage: Storage) {
    this.geolocation.getCurrentPosition({'enableHighAccuracy': true}).then((resp) => {
      this.lat  = resp.coords.latitude;
      this.long = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // Attempt to login in through our User service
  doLogin() {
    this.storeUserInfo();
    this.user.login(this.account).subscribe((resp) => {
      this.navCtrl.push(TabsPage);
      this.navCtrl.setRoot(TabsPage);  
    }, (err) => {
      this.navCtrl.push(TabsPage);
      this.navCtrl.setRoot(TabsPage); 
      // Unable to log in
      let toast = this.toastCtrl.create({
        message: "Login Error",
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  storeUserInfo () {
    this.storage.set('email', this.account.email);
    //this.http.get('http://192.168.0.10/tesis/user_info.php?email=' + this.account.email).map(res => res.json()).subscribe(data => { 
    this.http.get('http://10.20.76.172/tesis/user_info.php?email=' + this.account.email).map(res => res.json()).subscribe(data => {
      this.storage.set('vote_up', data[0].vote_up);
      this.storage.set('vote_down', data[0].vote_down);
      this.storage.set('comment', data[0].comment);
      this.storage.set('name', data[0].name);
      this.storage.set('user_id', data[0].id)
    });
    //this.http.get('http://192.168.0.10/tesis/user_locations.php?email=' + this.account.email).map(res => res.json()).subscribe(data => { 
    this.http.get('http://10.20.76.172/tesis/user_locations.php?email=' + this.account.email).map(res => res.json()).subscribe(data => {
      let home = data.filter(d => d.location === "CASA");
      let work = data.filter(d => d.location === "TRABAJO");
      let other = data.filter(d => d.location === "OTRO");
      
      this.storage.set("location_one", home[0].location_id);
      this.storage.set("location_two", work[0].location_id);
      this.storage.set("location_three", other[0].location_id);
    });
  }

  signup() {
    this.navCtrl.push(SignupPage);
  }  
}
