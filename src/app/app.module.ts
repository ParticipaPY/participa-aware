import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { MyApp } from './app.component';

import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';

import { LocationThreePage } from '../pages/location-three/location-three';
import { LocationTwoPage } from '../pages/location-two/location-two';
import { LocationOthersPage } from '../pages/location-others/location-others';
import { TabsPage } from '../pages/tabs/tabs';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { SignupPage } from '../pages/signup/signup';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { ItemCreatePage } from '../pages/item-create/item-create';

import { User } from '../providers/user/user';
import { Api } from '../providers/api';
import { Barrios } from '../providers/barrios';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SuperTabsModule } from 'ionic2-super-tabs';
import { DatabaseProvider } from '../providers/database/database';

import { IonicStorageModule } from '@ionic/storage';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';
import { ExpandableComponent } from '../components/expandable/expandable';
import { FilterProvider } from '../providers/filter/filter';

const cloudSettings: CloudSettings = {
  core: {
    app_id: '523f61f0'
  },
  push: {
    sender_id: '283358254869',
    pluginConfig: {
      ios: {
        badge: true,
        sound: true
      },
      android: {
        iconColor: '#343434',
        forceShow: true
      }
    }
  }  
};

@NgModule({
  declarations: [
    MyApp,
    LocationThreePage,
    LocationTwoPage,
    LocationOthersPage,
    TabsPage,
    HelloIonicPage,
    SignupPage,
    ItemDetailsPage,
    ListPage,
    ItemCreatePage,
    ExpandableComponent    
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    SuperTabsModule.forRoot(),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LocationThreePage,
    LocationTwoPage,
    LocationOthersPage,
    TabsPage,
    HelloIonicPage,
    SignupPage,
    ItemDetailsPage,
    ListPage,
    ItemCreatePage    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Geolocation,    
    User,
    Api,
    Barrios,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    SQLitePorter,
    SQLite,
    FilterProvider
  ]
})
export class AppModule {}
