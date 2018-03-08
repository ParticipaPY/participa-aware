import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, ToastController, Events, ModalController, Platform, LoadingController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';

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
  account: { user_id: number, email: string, password: string, name: string, author_pic: string, location_one: number, location_two: number, location_three: number } = 
          {user_id: 0, email: "", password: "", name: "", author_pic: "", location_one: 0, location_two: 0, location_three: 0};
  reduce_icon: Boolean = false;
  loading;
  
  constructor(public navCtrl: NavController, public user: User, public toastCtrl: ToastController, public databaseProvider: DatabaseProvider, 
    private storage: Storage, public events: Events, public modalCtrl: ModalController, private screenOrientation: ScreenOrientation,
    public keyboard: Keyboard, public platform: Platform, public loadingCtrl: LoadingController, public userLocations: Notification,
    private translateService: TranslateService, private alertCtrl: AlertController
  ) {
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

  private presentToast(text) {
    this.translateService.get(text).subscribe( (value) => {
      let toast = this.toastCtrl.create({
        message: value,
        duration: 5000,
        position: 'top'
      });

      toast.present();        
      }
    );
  }

  doLogin() {        
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles'
    });
    this.loading.present();
    this.user.login(this.account).then( (resp) => {    
      console.log("AC - Login response: ", resp);    
      let result = JSON.parse(resp.data);        

      this.account.user_id = result.userId;
      this.account.name = result.name;
      this.account.author_pic = result.profilePic.url;

      this.storeUserInfo(result);
      this.getUser(result);
      this.getUserLocations(result);

      setTimeout( () => {
        this.events.publish('user:created', this.account);
        this.loading.dismiss();        
        this.navCtrl.setRoot(TabsPage);
      }, 2500);
 
    }, (error) => {      
      this.loading.dismiss();
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error on Login: ", error);
        if (err.statusMessage) {
          console.log("AC - Error on Login Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      } else {
        console.log("AC - Error on Login Message: ", error);
        let toast = this.toastCtrl.create({
          message: "Error al iniciar sesión",
          duration: 3000,
          position: 'top'
        });
        toast.present();        
      }      
    });
  }

  storeUserInfo (resp) {        
    this.storage.set('name', resp.name);
    this.storage.set('email', this.account.email);
    this.storage.set('session_key', resp.sessionKey);
    this.storage.set('profile_pic', resp.profilePic.url);
    this.storage.set('userId', resp.userId);    
  }

  getUser(resp){
    return this.databaseProvider.getAuthor("email", this.account.email).then( (res) => {
      if (res.id != null) {
        console.log("====> author id: ", res.id);
        return this.storage.set('user_id', res.id);
      } else {
        let user = {
          name: resp.name, 
          email: this.account.email, 
          session_key: resp.session_key, 
          profile_pic: resp.profilePic.url
        }
        return this.databaseProvider.createAuthor(resp.userId, user).then( (id) => {          
          console.log("====> author id: ", id);
          return this.storage.set('user_id', id);
        });
      }
    });
  }

  getUserLocations(resp) {    
    return this.userLocations.getUserLocations(resp.userId).subscribe( (data) => {
      console.log("Response User Locations: ", data);

      if (data.length > 0) {
        let home = data.filter(d => d.location === "CASA");
        let work = data.filter(d => d.location === "TRABAJO");
        let other = data.filter(d => d.location === "OTRO");
        
        if (home.length > 0) {
          this.storage.set("location_one", home[0].location_id);
          this.account.location_one   = home[0].location_id;
        }
  
        if (work.length > 0) {
          this.storage.set("location_two", work[0].location_id);
          this.account.location_two   = work[0].location_id;
        }
        
        if (other.length > 0) {
          this.storage.set("location_three", other[0].location_id);       
          this.account.location_three = other[0].location_id;  
        }
      } 
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

  passwordForgot() {
    let alert = this.alertCtrl.create({
      title: 'Recuperar Contraseña',
      message: 'Recibirás un correo con el enlace para recuperar tu contraseña. ' + 
              'Luego de recuperarla, regresa aquí para iniciar sesión',
      inputs: [
        {
          name: 'email',
          placeholder: 'Ingresa tu correo',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            this.user.passwordForgot(data.email).then( () => {
              this.presentToast("Operación exitosa. Por favor, revisa tu correo");
            }).catch((error) => {
              if (error.status == 404) {
                this.presentToast("Usuario " + data.email + " no encontrado");
              } else if (error.status != 500) {
                let err = JSON.parse(error.error);
                console.log("AC - Error on Password Forgot: ", error);
                if (err.statusMessage) {
                  console.log("AC - Error on Password Forgot Message: ", err.statusMessage);
                  this.presentToast(err.statusMessage);
                } 
              } else {
                console.log("AC - Error on Password Forgot Message: ", error);
                let toast = this.toastCtrl.create({
                  message: "Error al recuperar contraseña",
                  duration: 3000,
                  position: 'top'
                });
                toast.present();        
              }      
            });
          }
        }
      ]
    });
    alert.present();
  }
}
