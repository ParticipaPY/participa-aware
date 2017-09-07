import { Component, ViewChild, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushToken } from '@ionic/cloud-angular';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { TabsPage } from '../pages/tabs/tabs';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { DatabaseProvider } from "../providers/database/database";

@Component({
  templateUrl: 'app.html'
})

export class MyApp implements OnInit{
  @ViewChild(Nav) nav: Nav;
  
  notificationTapped: boolean = false;
  rootPage: any;
  rootParams: any;
  account: { email: string, name: string } = {email: "", name: ""};

  constructor(public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public splashScreen: SplashScreen, public push: Push, 
              public storage: Storage, public databaseprovider: DatabaseProvider) {           

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
        });
      });  
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.registerPush();
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
          this.rootPage = TabsPage;
          this.nav.push(ItemDetailsPage, { item: notification.payload });
        }        
    });    
  }

  logOut(){
    this.storage.remove('database_filled');
    this.storage.remove("email");
    this.storage.remove("vote_up");
    this.storage.remove("vote_down");
    this.storage.remove("comment");
    this.storage.remove('user_name');
    this.storage.remove('user_id');    
    this.databaseprovider.deleteDatabase();
    this.menu.close();
    this.nav.setRoot(HelloIonicPage);
  }

  registerPush() {
    // Check that we are on a device
    if (this.platform.is('cordova')) {
      // Register push notifications with the push plugin
      this.push.register().then((t: PushToken) => {
        console.log('Generated Token' + JSON.stringify(t));
        // Save the user with Ionic's user auth service
        // this.storage.get('user_id').then( val => {          
        //   this.databaseprovider.createUserToken(val, t.token);
        // });
        
        // this.storage.set('push_token', t.token);
        return this.push.saveToken(t);
      }).then((t: PushToken) => {
        console.log('Token Saved', t.token);
        // this.listenForPush();
      }).catch((err) => {
        console.log('Error Saving Token: ', err);
      });
    }
  }

  voteUp = (idea) => {
    this.databaseprovider.voteUp(idea).then(data => {
      if (idea.voted_down == 1) {
        this.databaseprovider.deleteVoteDown(idea);
      }
    });
    this.nav.push(ItemDetailsPage, { item: idea });
  }
}

(<any>Window).voteUpAction = function (data: any) {

  let idea = data.additionalData.payload;
  // let navCtrl = this.app.getActiveNav();
  // let itemDetail = new ItemDetailsPage(navCtrl, this.navParams, this.databaseprovider, this.storage);
  
  // itemDetail.voteUp(idea);
  this.voteUp(idea).bind();
  
};

(<any>Window).voteDownAction = function (data: any) {
  let idea = data.additionalData.payload;
  // let itemDetail: ItemDetailsPage;
  // itemDetail.voteDown(data);
  // this.nav.push(ItemDetailsPage, { item: data });
  alert('Approve called'); 
};

(<any>Window).commentAction = function () {
  alert('Comment called');   
};