import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';

import { DatabaseProvider } from '../../providers/database/database';
import { IdeasProvider } from '../../providers/ideas/ideas';
import { LoggingProvider } from '../../providers/logging/logging';

@Component({
  selector: 'page-edit-idea',
  templateUrl: 'edit-idea.html',
})
export class EditIdeaPage {

  idea: any;
  form: FormGroup;
  locations = [];
  isReadyToSave: boolean = false;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public ideaProvider: IdeasProvider, 
              public databaseProvider: DatabaseProvider, public formBuilder: FormBuilder, private geolocation: Geolocation, 
              public platform: Platform, public toastCtrl: ToastController, public loggingProvider: LoggingProvider) {

    this.idea = this.navParams.get('idea');
    
    this.form = formBuilder.group({
      id: this.idea.id,
      idea_id: this.idea.idea_id,
      location_id: [this.idea.location_id, Validators.required],
      title: [this.idea.title, Validators.required],      
      description: [this.idea.description, Validators.required]
    });

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });  
  }

  ionViewDidLoad() {
    this.databaseProvider.getDatabaseState().subscribe(rdy => {
       if (rdy) {         
         this.loadLocations();
       }
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

   loadLocations() {
     this.databaseProvider.getAllLocations().then(data => {
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
    
    this.databaseProvider.updateIdeaByAuthor(this.form.value).then( () => {
      this.presentToast("Tu idea ha sido editada");    
      setTimeout(() => {      
        this.viewCtrl.dismiss();
      }, 3100);
    });

    let locationData = this.locations.filter(l => l.id == this.form.controls['location_id'].value)[0];
    this.ideaProvider.putIdea(this.form.value, locationData).then( (resp) => {
      console.log("AC - Update Idea Status: ", resp.status);      
    }).catch( (error) => {
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error Editing Idea: ", error);
        if (err.statusMessage) {
          console.log("AC - Error on Editing Idea Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      } else {
        console.log("AC - Error on Editing Idea Message: ", error);
        this.presentToast("Error desde AppCivist al editar idea");
      }                
    });

    let data = {
      action: "Edit Idea",
      action_data: this.form.value
    }
    this.loggingProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});    
   }
 
   getCurrentLocation() {
     this.platform.ready().then(() => {      
       this.geolocation.getCurrentPosition({'enableHighAccuracy': true, 'timeout': 30000}).then((resp) => {
         let points = [resp.coords.latitude, resp.coords.longitude];
         console.log('Point: ', points);
         for (let location of this.locations){        
           if ( this.pointInPolygon(points, location.coordinates) ){          
             this.form.controls['location_id'].patchValue(location.id);          
             break;
           } 
         }         
       }).catch((error) => {
         this.presentToast('Error al obtener ubicación');         
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
