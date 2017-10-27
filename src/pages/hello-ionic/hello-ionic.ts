import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, ToastController, Events, ModalController, Platform, LoadingController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';
import { User } from '../../providers/user/user';
import { DatabaseProvider } from '../../providers/database/database';
import { Notification } from '../../providers/notification/notification';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  account: { user_id: number, email: string, password: string, name: string, author_pic: string } = {user_id: 0, email: "", password: "", name: "", author_pic: ""}
  reduce_icon: Boolean = false;

  constructor(public navCtrl: NavController, public user: User, public toastCtrl: ToastController, public databaseProvider: DatabaseProvider, 
              private storage: Storage, public events: Events, public modalCtrl: ModalController, private screenOrientation: ScreenOrientation,
              public keyboard: Keyboard, public platform: Platform, public loadingCtrl: LoadingController, public userLocations: Notification) {

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

  presentLoading() {
    const loading = this.loadingCtrl.create({
      spinner: 'bubbles'
    });
  
    loading.present();
  }

  doLogin() {        
    const loading = this.loadingCtrl.create({
      spinner: 'bubbles'
    });
  
    loading.present();

    this.user.login(this.account).then( (resp) => {  
      loading.dismiss();
      let result = JSON.parse(resp.data);        
      this.storeUserInfo(result);
      this.account.user_id = result.userId;
      this.account.name = result.name;
      this.account.author_pic = result.profilePic.url;
      this.events.publish('user:created', this.account);
      this.navCtrl.push(TabsPage);
      this.navCtrl.setRoot(TabsPage);  
    }, (err) => {      
      loading.dismiss();
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
    this.storage.set('userId', resp.userId);
    this.getUserLocations(resp.userId);
  }

  getUserLocations(userId) {
    this.databaseProvider.getAuthor(this.account.email).then( author => {
      this.storage.set('user_id', author.id);
      this.userLocations.getUserLocations(userId).subscribe( (data) => {
        console.log("Response: ", data);
      // this.databaseProvider.getUsersLocation(author.id).then( data => {
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
