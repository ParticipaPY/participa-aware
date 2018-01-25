import { Component, ViewChild, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, MenuController, Nav, Events, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { OneSignal } from '@ionic-native/onesignal';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { TabsPage } from '../pages/tabs/tabs';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { MyProfilePage } from '../pages/my-profile/my-profile'; 
import { DatabaseProvider } from "../providers/database/database";
import { Notification } from "../providers/notification/notification";
import { IdeasProvider } from '../providers/ideas/ideas';
import { LoggingProvider } from '../providers/logging/logging';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  rootParams: any;
  myProfile;
  account: { user_id: number, email: string, name: string, author_pic: string, location_one: number, location_two: number, location_three: number} = 
  {user_id: 0, email: "", name: "", author_pic: "", location_one: 0, location_two: 0, location_three: 0};

  constructor(public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public splashScreen: SplashScreen,
              public storage: Storage, public databaseprovider: DatabaseProvider, public events: Events, public notification: Notification, 
              public ideaProvider: IdeasProvider, private oneSignal: OneSignal, public modalCtrl: ModalController, public logProvider: LoggingProvider) {

    this.platform.ready().then(() => {
      this.myProfile = MyProfilePage;
      this.initializeApp();
      this.initializeOneSignal();
    });
  }
  
  initializeApp() {        
    this.storage.get('email').then( (email) => {
      if (email != null && email.length > 0){
        this.rootPage = TabsPage;
      } else {
        this.rootPage = HelloIonicPage;
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
      console.log("OS - Notification received: ", resp.payload.additionalData);
      let data = {
        action: "OS - Notification Received",
        action_data: resp.payload.additionalData
      }
      this.logProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
    });
    
    this.oneSignal.handleNotificationOpened().subscribe( (res) => {
      console.log("OS - Data from notification: ", res.notification.payload.additionalData);
      if (res.action.type == 0) {
        console.log("OS - Notification opened");
        this.detailPage(res.notification.payload.additionalData); 
        let data = {
          action: "OS - Notification Opened",
          action_data: res.notification.payload.additionalData
        }
        this.logProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
      }
      
      if (res.action.type == 1) {
        if (res.action.actionID == "voteUpAction") {
          console.log("OS ActionTake 'Me gusta' pressed");
          this.ideaProvider.voteAction("up", res.notification.payload.additionalData.idea_id).then( () => {
            this.detailPage(res.notification.payload.additionalData);
          }).catch((error) => {
            console.log("Error on Vote Up Action: ", error);
          });
          let data = {
            action: "OS - Action Button 'Me gusta' pressed",
            action_data: res.notification.payload.additionalData
          }
          this.logProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
        }

        if (res.action.actionID == "voteDownAction") {
          console.log("OS ActionTake 'No me gusta' pressed");
          this.ideaProvider.voteAction("down", res.notification.payload.additionalData.idea_id).then( () => {
            this.detailPage(res.notification.payload.additionalData);
          }).catch((error) => {
            console.log("Error on Vote Down Action: ", error);
          });
          let data = {
            action: "OS - Action Button 'No me gusta' pressed",
            action_data: res.notification.payload.additionalData
          }
          this.logProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
        }        

        if (res.action.actionID == "comment") {
          console.log("OS ActionTake 'Comentar' pressed");
          this.detailPage(res.notification.payload.additionalData);
          let data = {
            action: "OS - Action Button 'Comentar' pressed",
            action_data: res.notification.payload.additionalData
          }
          this.logProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
        }
      }
    });
    
    this.oneSignal.endInit();    
  }

  detailPage(data) {
    let addModal = this.modalCtrl.create(ItemDetailsPage, {item: data});
      
    addModal.onDidDismiss( (item) => {
      this.nav.setRoot(TabsPage);
    });

    addModal.present(); 
  }

}
