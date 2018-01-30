import { Component, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { ViewController, NavParams, ToastController, NavController, Events, Nav } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../providers/user/user';
import { Notification } from '../../providers/notification/notification';
import { TabsPage } from '../tabs/tabs';

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

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public formBuilder: FormBuilder, public databaseProvider: DatabaseProvider, private userProvider: User,
              public toastCtrl: ToastController, public userLocation: Notification, private storage: Storage, public events: Events) {
    this.user = navParams.get('account'); 

    this.signUpForm = formBuilder.group({
      name: [this.user.name, Validators.compose([Validators.maxLength(80), Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚ ]*'), Validators.required])],
      email: [this.user.email, Validators.compose([Validators.maxLength(30), Validators.minLength(5), Validators.pattern('[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'), Validators.required])],
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
    let toast = this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'top'
    });
    toast.present();
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
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot(TabsPage);    
  }

  updateUserInfo(){
    this.userProvider.editProfile(this.user.user_id, this.signUpForm.value).then( (resp) => {
      console.log('AC - Update User Profile Response: ', resp);
      let toast = this.toastCtrl.create({
        message: 'Tu perfil ha sido actualizado',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }).catch( (error) => {      
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error updating user profile: ", error);
        if (err.statusMessage) {
          console.log("AC - Error updating user profile Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      }else {
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
