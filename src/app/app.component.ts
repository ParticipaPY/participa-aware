import { Component, ViewChild, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, MenuController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushToken } from '@ionic/cloud-angular';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { TabsPage } from '../pages/tabs/tabs';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { DatabaseProvider } from "../providers/database/database";
import { Notification } from "../providers/notification/notification";

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit{
  @ViewChild(Nav) nav: Nav;

  notificationTapped: boolean = false;
  rootPage: any;
  rootParams: any;
  account: { email: string, name: string, author_pic: string } = {email: "", name: "", author_pic: ""};

  constructor(public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public splashScreen: SplashScreen, public push: Push, 
              public storage: Storage, public databaseprovider: DatabaseProvider, public events: Events, public notification: Notification) {

    this.initializeApp();
  }
  
  initializeApp() {  
    this.platform.ready().then(() => {  
      this.storage.get('email').then( (email) => {
        if (this.notificationTapped === false){
           if (email != null && email.length > 0){
              this.rootPage = TabsPage;
            } else {
              this.rootPage = HelloIonicPage;
            }
        }
        this.storage.get('name').then( name => {
          this.account.email = email;
          this.account.name  = name;
          this.storage.get('profile_pic').then( (profile_pic) => {
            this.account.author_pic = profile_pic;
          });
        });
      });  
      this.statusBar.styleDefault();
      this.splashScreen.hide();      
      this.registerPush();
      this.listenToLogin();
    });
  }

  ngOnInit(){       
    this.push.rx.notification().subscribe((notification) => {  
      if(notification.raw.additionalData.coldstart === true && this.notificationTapped === false) {
        this.notificationTapped = true;
        
        if(notification.payload) {
          this.nav.setRoot(TabsPage).then( () => {              
            this.nav.push(ItemDetailsPage, { item: notification.payload });
          });            
        }
      } else if(this.platform.is("android")) {        
        this.notificationTapped = true;
        this.rootPage = TabsPage;
        this.nav.push(ItemDetailsPage, { item: notification.payload });
      }
    });    
  }

  logOut(){
    // this.storage.remove('database_filled');
    this.storage.remove("email");
    this.storage.remove("vote_up");
    this.storage.remove("vote_down");
    this.storage.remove("comment");
    this.storage.remove('name');
    this.storage.remove('user_id');    
    this.storage.remove('profile_pic');
    this.storage.remove('session_key');
    this.storage.remove('location_one');
    this.storage.remove('location_two');
    this.storage.remove('location_three');
    // this.databaseprovider.deleteDatabase();
    this.menu.close();
    this.nav.setRoot(HelloIonicPage);
  }

  listenToLogin() {
    this.events.subscribe('user:created', (user) => {
      if (user) {        
        this.account.email = user.email;
        this.account.name  = user.name;
        this.account.author_pic = user.author_pic;
        this.registerToken();
      }
    });
  }

  registerPush() {
    // Check that we are on a device
    if (this.platform.is('cordova')) {
      // Register push notifications with the push plugin
      this.push.register().then((t: PushToken) => {        
        console.log('Generated Token' + JSON.stringify(t));       
        return this.push.saveToken(t);
      }).then((t: PushToken) => {
        console.log('Token Saved', t.token);
      }).catch((err) => {
        console.log('Error Saving Token: ', err);
      });
    }
  }

  registerToken(){
    this.storage.get('user_id').then( id => {
      this.notification.storeUserToken(id, this.push.token.token).subscribe( (resp) => {
        console.log('Response from server: ', resp);
      }, (err) => {
        console.log('Error from server: ', err);
      });
    });     
  }

}

window['voteUpAction'] = (data)  => {
  let idea = data.additionalData.payload;

  alert('Vote Up called');
};

window['voteDownAction'] = function (data: any) {
  let idea = data.additionalData.payload;

  alert('Vore Down called'); 
};

window['commentAction'] = function (data: any) {
  let idea    = data.additionalData.payload;
  let comment = data.additionalData.inlineReply;

  console.log("Reply: ", data.additionalData.inlineReply);
  alert('Comment called');   
};