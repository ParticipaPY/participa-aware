import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, ViewController, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { User } from "../../providers/user/user";
import { DatabaseProvider } from '../../providers/database/database';
import { Notification } from "../../providers/notification/notification"

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  @ViewChild('fileInput') fileInput;

  locations = [];
  private signUpForm : FormGroup; 
  isReadyToSave: boolean = false;
  submitAttempt: boolean = false;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public formBuilder: FormBuilder, public user: User, public toastCtrl: ToastController,
              public databaseProvider: DatabaseProvider, public notification: Notification, public loadingCtrl: LoadingController) {
    
    this.signUpForm = formBuilder.group({
        name: ['', Validators.compose([Validators.maxLength(80), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        email: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(5), Validators.pattern('[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'), Validators.required])],
        password: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        repeatPassword: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        place_one: ['', Validators.required],
        place_two: ['', Validators.required],
        place_three: ['', Validators.required],
        lang: "es-ES",
        profile_pic: ""
    });

    this.signUpForm.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.signUpForm.valid;
    });    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SingupPage');
    this.loadLocations();    
  }

  loadLocations() {
    this.databaseProvider.getAllLocations().then(data => {
      this.locations = data;
    });
  }  

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'top'
    });
    toast.present();
  }
   
  doSignup() {
    this.submitAttempt = true;
    
    const loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      showBackdrop: false
    });
  
    loading.present();    
    
    this.user.signup(this.signUpForm.value).then( (resp) => {   
      loading.dismiss();
      let result = JSON.parse(resp.data);
      console.log("AC - SignUp User Response: ", result.userId);
      this.signUpForm.controls['profile_pic'].patchValue(result.profilePic.url);   
      this.createAuthor(result.userId);
      this.viewCtrl.dismiss(this.signUpForm.value);     
    }).catch( (error) => {
      loading.dismiss();
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error on SingUp: ", error);
        if (err.statusMessage) {
          console.log("AC - Error on SingUp Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      }else {
        console.log("AC - Error on SingUp Message: ", error);
        this.presentToast("Error desde AppCivist al crear usuario");
      }
    });
  }

  createAuthor(user_id){
    this.databaseProvider.createAuthor(user_id, this.signUpForm.value).then( (data) => {
      console.log("Author id: ", data.id);
      this.createNotificationConfig(user_id);
      this.storeUserLocation(user_id);
    });
  }

  createNotificationConfig(user){
    this.notification.createUserNotificationConfig(user).subscribe( (resp) => {
      console.log('Response from server: ', resp);
    }, (err) => {
      console.log('Error creating user notification config: ', err);
    });
  }

  storeUserLocation(user){
    let locations = {
      "home" : this.signUpForm.controls['place_one'].value,
      "work" : this.signUpForm.controls['place_two'].value,
      "other": this.signUpForm.controls['place_three'].value
    }

    this.notification.storeUserLocation(user, locations).subscribe( (resp) => {
      console.log('Response from server: ', resp);
    }, (err) => {
      console.log('Error storing user location: ', err);
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {
    if (!this.signUpForm.valid) { return; }
    this.doSignup();
  }  

}
