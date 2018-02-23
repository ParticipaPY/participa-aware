import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyApp } from './app.component';

import { OneSignal } from '@ionic-native/onesignal';
import { HTTP } from '@ionic-native/http';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';
import { IonicStorageModule } from '@ionic/storage';

import { SuperTabsModule } from 'ionic2-super-tabs';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { LocationThreePage } from '../pages/location-three/location-three';
import { LocationTwoPage } from '../pages/location-two/location-two';
import { LocationOthersPage } from '../pages/location-others/location-others';
import { TabsPage } from '../pages/tabs/tabs';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { SignupPage } from '../pages/signup/signup';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { ItemCreatePage } from '../pages/item-create/item-create';
import { MyProfilePage } from '../pages/my-profile/my-profile';
import { CommentPopoverPage } from '../pages/comment-popover/comment-popover';
import { IdeaPopoverPage } from '../pages/idea-popover/idea-popover';
import { EditIdeaPage } from '../pages/edit-idea/edit-idea';
import { EditCommentPage } from '../pages/edit-comment/edit-comment';

import { User } from '../providers/user/user';
import { Api } from '../providers/api';
import { Barrios } from '../providers/barrios';
import { NotificationApi } from '../providers/notification-api/notification-api';
import { Notification } from '../providers/notification/notification';
import { DatabaseProvider } from '../providers/database/database';
import { IdeasProvider } from '../providers/ideas/ideas';
import { CommentsProvider } from '../providers/comments/comments';
import { LoggingProvider } from '../providers/logging/logging';
import { FlashProvider } from '../providers/flash/flash';

import { ExpandableComponent } from '../components/expandable/expandable';
import { Autosize } from '../directives/autosize/autosize';
import { FlashComponent } from '../components/flash/flash';

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
    MyProfilePage,
    CommentPopoverPage,
    IdeaPopoverPage,
    EditIdeaPage,
    EditCommentPage,
    ExpandableComponent,
    Autosize,
    FlashComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    SuperTabsModule.forRoot(),    
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
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
    ItemCreatePage,
    MyProfilePage,
    CommentPopoverPage,
    IdeaPopoverPage,
    EditIdeaPage,
    EditCommentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    Camera,
    File,
    Transfer,
    FilePath,
    Keyboard,
    Geolocation,
    ScreenOrientation,    
    User,
    Api,
    Barrios,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    SQLitePorter,
    SQLite,
    NotificationApi,
    Notification,
    IdeasProvider,
    CommentsProvider,
    OneSignal,
    LoggingProvider,
    FlashProvider 
  ]
})
export class AppModule {}
