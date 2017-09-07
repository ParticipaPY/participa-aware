import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

import { TabsPage } from '../tabs/tabs';
import { User } from "../../providers/user/user";
import { Barrios } from "../../providers/barrios";

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  barriosList: any;
  account: { name: string, email: string, password: string } = {
    name: 'Test Human',
    email: 'test@example.com',
    password: 'test'
  };

  // Our translated text strings
  private signupErrorString: string; 
  private signUpForm : FormGroup; 
  submitAttempt: boolean = false;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, public user: User, public barrios: Barrios, public toastCtrl: ToastController) {
    this.barriosList = this.barrios.getBarrios();
    
    this.signUpForm = formBuilder.group({
        name: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        email: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(5), Validators.required])],
        password: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        confirm_password: ['', Validators.compose([Validators.maxLength(10), Validators.minLength(5), Validators.required])],
        place_one: ['', Validators.required],
        place_two: [''],
        place_three: ['']
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SingupPage');
  }

  doSignup() {
    this.submitAttempt = true;
    // Attempt to login in through our User service
    this.user.signup(this.account).subscribe((resp) => {
      this.navCtrl.push(TabsPage);
    }, (err) => {

      this.navCtrl.push(TabsPage); // TODO: Remove this when you add your signup endpoint

      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: this.signupErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

}
