import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicPage, NavController, NavParams, ViewController, ToastController, Platform } from 'ionic-angular';

import { DatabaseProvider } from "../../providers/database/database";
import { IdeasProvider } from '../../providers/ideas/ideas';
import { LoggingProvider } from '../../providers/logging/logging';
import { FlashProvider } from '../../providers/flash/flash';

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
  message = ['¡Gracias por tu contribución', '¡Excelente idea!', 'Tu idea ha sido creada', '¡Muy buena idea!']

  constructor(public navCtrl: NavController, params: NavParams, public viewCtrl: ViewController, public toastCtrl: ToastController, formBuilder: FormBuilder, 
    private databaseprovider: DatabaseProvider, private geolocation: Geolocation, public platform: Platform, public ideaProvider: IdeasProvider,
    public loggingProvider: LoggingProvider, private flashProvider: FlashProvider) {

    if (params.get('location'))
      this.location = parseInt(params.get('location'));
    else
      this.location = 1;

    this.form = formBuilder.group({
      location_id: [this.location, Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
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
      this.flashProvider.show(this.message[Math.floor(Math.random() * this.message.length)], 3000);
      console.log("datos: ", data);      
      let locationData = this.locations.filter(l => l.id == this.form.controls['location_id'].value)[0];
      console.log("Location => ", locationData);
      
      this.ideaProvider.postIdea(this.form.value, locationData).then( (resp) => {
        let response = JSON.parse(resp.data)
        console.log("===> IDEA ID: ", data);
        this.databaseprovider.updateIdeaIdeaId(data, response.contributionId);
        this.databaseprovider.updateIdeaRSID(data, response.resourceSpaceId);
      }).catch((error) => {
        let err = JSON.parse(error.error);
        if (err.statusMessage) {
          console.log("AC - Error on Create Idea Message: ", err.statusMessage);          
        } 
        let toast = this.toastCtrl.create({
          message: 'Error al crear Idea en AppCivist',
          duration: 3000,
          position: 'top'
        });
        toast.present();        
        console.log("Error creating Idea: ", error);
      });

      setTimeout( () => {
        this.viewCtrl.dismiss(data);
      }, 3100);
      
    });

    let data = {
      action: "Create Idea",
      action_data: this.form.value
    }
    this.loggingProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});}); 
  }

  getCurrentDate() {
    var now = new Date();
    var dateString = now.getFullYear() + '-' + ("0"+(now.getMonth()+1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2) + " " +
     ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2) + "." + ("0" + now.getMilliseconds()).slice(-2);

    return dateString;
  }

  getCurrentLocation() {
    this.platform.ready().then(() => {      
      this.geolocation.getCurrentPosition({'enableHighAccuracy': true, 'timeout': 30000}).then((resp) => {
        let points = [resp.coords.latitude, resp.coords.longitude];
        console.log('Point: ', points);
        let ban: boolean = false;
        for (let location of this.locations){        
          if ( this.pointInPolygon(points, location.coordinates) ){          
            this.form.controls['location_id'].patchValue(location.id);  
            ban = true;      
            
            this.flashProvider.show('Estás en el barrio: ' + location.name, 3000);
            break;
          } 
        }

        if (!ban){
          let toast = this.toastCtrl.create({
            message: 'No hemos podido encontrar tu ubicación',
            duration: 3000,
            position: 'top'
          });
          toast.present();
        }
        
      }).catch((error) => {
        let toast = this.toastCtrl.create({
          message: 'No hemos podido encontrar tu ubicación',
          duration: 3000,
          position: 'top'
        });
        toast.present();
        console.log('Error getting location Code', error.code);
        console.log('Error getting location Code', error.message);
      });
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
