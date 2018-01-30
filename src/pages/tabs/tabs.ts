import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

import { SuperTabsController } from 'ionic2-super-tabs';

import { LocationThreePage } from '../location-three/location-three';
import { LocationTwoPage } from '../location-two/location-two';
import { LocationOthersPage } from '../location-others/location-others';
import { ListPage } from '../list/list';
import { Platform } from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  
  items: any;
  location: any;
  pages = {
    tab1Root: ListPage,
    tab2Root: LocationTwoPage,
    tab3Root: LocationThreePage,
    tab4Root: LocationOthersPage
  }
  tabs = [];
  tabsLoaded: boolean = false;

  constructor(public platform: Platform, private superTabsCtrl: SuperTabsController, public storage: Storage) {
    this.getUserLocations().then( () => {
      console.log("TABS: ", this.tabs);
      this.tabsLoaded = true;
    });
  }

  getUserLocations() {
    return this.storage.get('location_one').then( (val1) => {
      console.log("Location One: ", val1);
      if (val1 != null && val1 != "0") {                
        this.tabs.push({"root": "tab1Root", "icon": "home", "title": ""});
      } 
      
      return this.storage.get('location_two').then( (val2) => {
        console.log("Location Two: ", val2);
        if (val2 != null && val2 != "0") {          
          this.tabs.push({"root": "tab2Root", "icon": "briefcase", "title": ""});
        }
      
        return this.storage.get('location_three').then( (val3) => {      
          console.log("Location Three: ", val3);
          if (val3 != null && val3 != "0") {            
            this.tabs.push({"root": "tab3Root", "icon": "ios-happy", "title": ""});
          }
          this.tabs.push({"root": "tab4Root", "icon": "", "title": "Todas"});
        });
      });
    });
  }
}
