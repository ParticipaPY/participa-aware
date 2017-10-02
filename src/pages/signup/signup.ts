import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, ViewController } from 'ionic-angular';
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
              public databaseProvider: DatabaseProvider, public notification: Notification) {
    
    this.signUpForm = formBuilder.group({
        name: ['', Validators.compose([Validators.maxLength(80), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        email: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(5), Validators.pattern('[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'), Validators.required])],
        password: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        repeatPassword: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        place_one: ['', Validators.required],
        place_two: ['', Validators.required],
        place_three: ['', Validators.required],
        lang: "ES",
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
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
   
  doSignup() {
    this.submitAttempt = true;
    
    // Attempt to login in through our User service
    this.user.signup(this.signUpForm.value).then((resp) => {   
      let result = JSON.parse(resp.data);
      this.signUpForm.controls['profile_pic'].patchValue(result.profilePic.url);   
      this.createAuthor();
      this.viewCtrl.dismiss(this.signUpForm.value);
    }, (err) => {
      console.log("Error on SingUp: ", err);
      this.presentToast(err);
    });
  }

  createAuthor(){
    this.databaseProvider.createAuthor(this.signUpForm.value).then( (data) => {
      console.log("Author id: ", data.id);
      this.notification.createUserNotificationConfig(data.id).subscribe( (resp) => {
        console.log('Response from server: ', resp);
      }, (err) => {
        console.log('Error from server: ', err);
      });     
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
