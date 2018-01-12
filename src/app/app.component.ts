import { Component, ViewChild, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, MenuController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushToken } from '@ionic/cloud-angular';
import { OneSignal } from '@ionic-native/onesignal';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { TabsPage } from '../pages/tabs/tabs';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { MyProfilePage } from '../pages/my-profile/my-profile'; 
import { DatabaseProvider } from "../providers/database/database";
import { Notification } from "../providers/notification/notification";
import { IdeasProvider } from '../providers/ideas/ideas';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit{
  @ViewChild(Nav) nav: Nav;

  notificationTapped: boolean = false;
  rootPage: any;
  rootParams: any;
  myProfile;
  account: { user_id: number, email: string, name: string, author_pic: string, location_one: number, location_two: number, location_three: number} = 
  {user_id: 0, email: "", name: "", author_pic: "", location_one: 0, location_two: 0, location_three: 0};

  constructor(public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public splashScreen: SplashScreen, public push: Push, 
              public storage: Storage, public databaseprovider: DatabaseProvider, public events: Events, public notification: Notification, public ideaProvider: IdeasProvider,
              private oneSignal: OneSignal) {

    this.platform.ready().then(() => {
      this.myProfile = MyProfilePage;
      this.initializeApp();
      this.initializeOneSignal();
    });
  }
  
  initializeApp() {        
    this.storage.get('email').then( (email) => {
      if (this.notificationTapped === false){
          if (email != null && email.length > 0){
            this.rootPage = TabsPage;
          } else {
            this.rootPage = HelloIonicPage;
          }
      }
      this.storage.get('name').then( (name) => {
        this.account.email = email;
        this.account.name  = name;
        this.storage.get('profile_pic').then( (profile_pic) => {
          this.account.author_pic = profile_pic;
        });
        this.storage.get('userId').then( (id) => {
          this.account.user_id = id;
        });
      });
      this.storage.get('location_one').then( (val) => {
        this.account.location_one = val;
      });
      this.storage.get('location_two').then( (val) => {
        this.account.location_two = val;
      });        
      this.storage.get('location_three').then( (val) => {
        this.account.location_three = val;
      });        
    });  
    this.statusBar.styleDefault();
    this.splashScreen.hide();            
    this.listenToLogin();
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
    this.storage.remove("email");
    this.storage.remove('name');
    this.storage.remove('user_id');
    this.storage.remove('userId');
    this.storage.remove('profile_pic');
    this.storage.remove('session_key');
    this.storage.remove('location_one');
    this.storage.remove('location_two');
    this.storage.remove('location_three');
    
    setTimeout( () => {
      this.menu.close();
      this.nav.setRoot(HelloIonicPage);
    }, 2000);
  }

  listenToLogin() {
    this.events.subscribe('user:created', (user) => {
      if (user) {       
        this.account.user_id = user.user_id; 
        this.account.email   = user.email;
        this.account.name    = user.name;
        this.account.author_pic     = user.author_pic;
        this.account.location_one   = user.location_one;
        this.account.location_two   = user.location_two;
        this.account.location_three = user.location_three;
        this.registerToken();
      }
      
    });
  }

  registerToken(){
    this.storage.get('userId').then( (id) => {
      this.oneSignal.getIds().then( (resp) => {
        console.log("OS - GetID => userId: ", resp.userId);        
      
        this.notification.storeUserToken(id, resp.userId).subscribe( (resp) => {
          console.log('Store User Token - Response from server: ', resp);
        }, (err) => {
          console.log('Store User Token - Error from server: ', err);
        });
      });
    });     
  }

  openPage(page){
    console.log("Page: ", page);
    this.nav.push(page, {account: this.account});
    this.menu.close();
  }

  initializeOneSignal(){
    this.oneSignal.startInit('de859cc6-f435-4234-87a8-1c0f7980670d', '283358254869');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    
    this.oneSignal.handleNotificationReceived().subscribe( (resp) => {
     // do something when notification is received
    });
    
    this.oneSignal.handleNotificationOpened().subscribe( (res) => {
      // do something when a notification is opened
      if (res.action.type == 1 && res.action.actionID == "id1")
        console.log("OS ActionTake 'Voto Positivo' pressed");
        alert('Vote Up called');
    });
    
    this.oneSignal.endInit();    
  }

}
