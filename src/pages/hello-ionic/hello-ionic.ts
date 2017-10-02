import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, ToastController, Events, ModalController, Platform } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';
import { User } from '../../providers/user/user';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  account: { email: string, password: string, name: string, author_pic: string } = {email: "", password: "", name: "", author_pic: ""}
  reduce_icon: Boolean = false;

  constructor(public navCtrl: NavController, public user: User, public toastCtrl: ToastController, public databaseProvider: DatabaseProvider, 
              private storage: Storage, public events: Events, public modalCtrl: ModalController, private screenOrientation: ScreenOrientation,
              public keyboard: Keyboard, public platform: Platform) {
    
    this.platform.ready().then( () => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      this.keyboard.onKeyboardShow().subscribe(() => {
        this.reduce_icon = true;
      });
      this.keyboard.onKeyboardHide().subscribe(() => {
        this.reduce_icon = false;
      });
    });
    
  }

  doLogin() {        
    this.user.login(this.account).then( (resp) => {  
      let result = JSON.parse(resp.data);        
      this.storeUserInfo(result);
      this.account.name = result.name;
      this.account.author_pic = result.profilePic.url;
      this.events.publish('user:created', this.account);
      this.navCtrl.push(TabsPage);
      this.navCtrl.setRoot(TabsPage);  
    }, (err) => {      
      let toast = this.toastCtrl.create({
        message: err,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  storeUserInfo (resp) {        
    this.storage.set('name', resp.name);
    this.storage.set('email', this.account.email);
    this.storage.set('session_key', resp.sessionKey);
    this.storage.set('profile_pic', resp.profilePic.url);
    this.getUserLocations();
  }

  getUserLocations() {
    this.databaseProvider.getAuthor(this.account.email).then( author => {
      this.storage.set('user_id', author.id);
      this.databaseProvider.getUsersLocation(author.id).then( data => {
        let home = data.filter(d => d.location === "CASA");
        let work = data.filter(d => d.location === "TRABAJO");
        let other = data.filter(d => d.location === "OTRO");
  
        this.storage.set("location_one", home[0].location_id);
        this.storage.set("location_two", work[0].location_id);
        this.storage.set("location_three", other[0].location_id);      
      });
    });
  }

  signup() {
    let addModal = this.modalCtrl.create(SignupPage);
    
    addModal.onDidDismiss( (user) => {
      if (user) {
        this.account.email = user.email;            
      } 
    });

    addModal.present();
  }  

}
