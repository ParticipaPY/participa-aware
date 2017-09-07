import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
// import * as PointInPolygon from 'point-in-polygon';

import { Barrios } from '../../providers/barrios';
import { DatabaseProvider } from "../../providers/database/database";

@IonicPage()
@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html',
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;
  item: any;
  form: FormGroup;
  locations = [];
  date: any;
  campaigns = [];
  location: any;

  constructor(public navCtrl: NavController, params: NavParams, public viewCtrl: ViewController, public toastCtrl: ToastController, formBuilder: FormBuilder, 
              public barrios: Barrios, private databaseprovider: DatabaseProvider, private geolocation: Geolocation) {    

    if (params.get('location'))
      this.location = parseInt(params.get('location'));
    else
      this.location = 4;

    this.form = formBuilder.group({
      location_id: this.location,
      title: ['', Validators.required],
      description: ['', Validators.required],
      campaign_id: ['', Validators.required],
      date: this.getCurrentDate()
    });

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });    
  }

  ionViewDidLoad() {
   this.databaseprovider.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.loadCampaigns();
        this.loadLocations();
      }
    }); 
  }

  loadCampaigns() {
    this.databaseprovider.getCampaigns().then(data => {
      this.campaigns = data;
    });    
  }

  loadLocations() {
    this.databaseprovider.getAllLocations().then(data => {
      this.locations = data;
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {
    if (!this.form.valid) { 
      return; 
    }

    this.databaseprovider.createIdea(this.form.value).then( data => {
      this.viewCtrl.dismiss(data);
   });
    
  }

  getCurrentDate() {
    var now = new Date();
    var dateString = now.getFullYear() + '-' + ("0"+(now.getMonth()+1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2) + " " +
     ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2) + "." + ("0" + now.getMilliseconds()).slice(-2);

    return dateString;
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition({'enableHighAccuracy': true}).then((resp) => {
      let points = [resp.coords.latitude, resp.coords.longitude];

      for (let location of this.locations){        
        if ( this.pointInPolygon(points, location.coordinates) ){          
          this.form.controls['location_id'].patchValue(location.id);          
          break;
        } 
      }
      
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  pointInPolygon (point, vs) {
    var s = vs.replace("[[", "").replace("]]", "").split('], [');
    var final = [];
    
    for (var l = 0; l < s.length; l++){
      let a = s[l].split(', ');
      final.push([parseFloat(a[0]), parseFloat(a[1])]);
    }

    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = final.length - 1; i < final.length; j = i++) {
        var xi = final[i][0], yi = final[i][1];
        var xj = final[j][0], yj = final[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
  }
  
}
