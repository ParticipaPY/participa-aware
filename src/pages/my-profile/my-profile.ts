import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ViewController, NavParams, ToastController, NavController, Events, Nav } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { User } from '../../providers/user/user';
import { DatabaseProvider } from '../../providers/database/database';
import { Notification } from '../../providers/notification/notification';
import { TabsPage } from '../tabs/tabs';
import { FlashProvider } from '../../providers/flash/flash';

@Component({
  selector: 'page-my-profile',
  templateUrl: 'my-profile.html',
})
export class MyProfilePage {  
  @ViewChild(Nav) nav: Nav;

  private signUpForm: FormGroup; 
  isReadyToSave: boolean = false;
  submitAttempt: boolean = false;  
  locations = [];
  user: any;
  ban: boolean = false;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, 
    public navParams: NavParams, public formBuilder: FormBuilder, 
    public databaseProvider: DatabaseProvider, private userProvider: User,
    public toastCtrl: ToastController, public userLocation: Notification, 
    private storage: Storage, public events: Events,
    private translateService: TranslateService, private flashProvider: FlashProvider
  ) {
    this.user = navParams.get('account'); 

    this.signUpForm = formBuilder.group({
      name: [this.user.name, Validators.compose([Validators.maxLength(80), Validators.pattern('[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ]*'), Validators.required])],
      email: [this.user.email],
      place_one: [this.user.location_one],
      place_two: [this.user.location_two],
      place_three: [this.user.location_three],
      lang: "es-ES",
      profile_pic: this.user.author_pic
  });

  this.signUpForm.valueChanges.subscribe((v) => {
    if (this.signUpForm.controls['place_one'].value != null || this.signUpForm.controls['place_one'].value != "0" || 
        this.signUpForm.controls['place_two'].value != null || this.signUpForm.controls['place_two'].value != "0" || 
        this.signUpForm.controls['place_three'].value != null || this.signUpForm.controls['place_three'].value != "0") 
    {
      this.ban = true;        
    }
    this.isReadyToSave = this.signUpForm.valid && this.ban;
  });      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyProfilePage');
    this.loadLocations();    
  }

  private presentToast(text) {
    this.translateService.get(text).subscribe( (value) => {
      let toast = this.toastCtrl.create({
        message: value,
        duration: 3000,
        position: 'top'
      });

      toast.present();        
      }
    );
  }

  loadLocations() {
    this.databaseProvider.getAllLocations().then(data => {
      this.locations = data;
    });
  }  

  cancel() {
    this.viewCtrl.dismiss();
  }  

  editProfile(){
    this.events.publish('user:edited', this.signUpForm.value);
    this.updateUserInfo();
    this.updateUserLocation();
    this.updateStorageInfo();
  }

  updateUserInfo(){
    let data = {
      id: this.user.user_id,
      name: this.signUpForm.controls['name'].value,
      email: this.signUpForm.controls['email'].value
    }
    this.databaseProvider.updateAuthor(data).then( (res) => {
      console.log("Updating user name result: ", res);
    }).catch( (error) => { 
      console.log("Error updating user name");
    });

    this.userProvider.editProfile(this.user.user_id, this.signUpForm.value).then( (resp) => {
      console.log('AC - Update User Profile Response: ', resp.status);
      this.flashProvider.show('Perfil actualizado', 5000);
      setTimeout(() => {
        this.viewCtrl.dismiss();
        this.navCtrl.setRoot(TabsPage);  
      }, 5100);
    }).catch( (error) => {      
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error updating user profile: ", error);
        if (err.statusMessage) {
          console.log("AC - Error updating user profile Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      } else {
        console.log("AC - Error updating user profile Message: ", error);
        this.presentToast("Error desde AppCivist al editar usuario");        
      }
    });
  }

  updateUserLocation(){
    let locations = {
      "home" : this.signUpForm.controls['place_one'].value,
      "work" : this.signUpForm.controls['place_two'].value,
      "other": this.signUpForm.controls['place_three'].value
    }    
    
    this.userLocation.updateUserLocation(this.user.user_id, locations).subscribe( (resp) => {
      console.log('Upate User Location - Response from server: ', resp);
    }, (err) => {
      console.log('Error updating user location: ', err);
    });
  }

  updateStorageInfo(){
    this.user.name = this.signUpForm.controls['name'].value;
    this.user.email = this.signUpForm.controls['email'].value;
    this.storage.set('name', this.signUpForm.controls['name'].value);
    this.storage.set('email', this.signUpForm.controls['email'].value);
    this.storage.set('location_one', this.signUpForm.controls['place_one'].value,);
    this.storage.set('location_two', this.signUpForm.controls['place_two'].value);
    this.storage.set('location_three', this.signUpForm.controls['place_three'].value);
  }

  done() {
    if (!this.signUpForm.valid) { return; }
    
    if (this.signUpForm.controls['place_one'].value != null || this.signUpForm.controls['place_one'].value != "0" || 
        this.signUpForm.controls['place_two'].value != null || this.signUpForm.controls['place_two'].value != "0" || 
        this.signUpForm.controls['place_three'].value != null || this.signUpForm.controls['place_three'].value != "0") 
    {
      this.ban = true;
      this.editProfile();
    } else {      
      this.presentToast("Debes elegir al menos un lugar");
      return;
    }
  } 

}
