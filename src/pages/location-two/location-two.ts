import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ModalController, ToastController, Platform } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { ItemCreatePage } from '../item-create/item-create';
import { DatabaseProvider } from "./../../providers/database/database";
import { Http } from "@angular/http";
import { IdeasProvider } from '../../providers/ideas/ideas';

@Component({
  selector: 'page-location-two',
  templateUrl: 'location-two.html'
})
export class LocationTwoPage {
  location_two: any;
  rootNavCtrl: NavController;
  items: Array<{title: string, note: string, icon: string}>;
  ideas = [];
  idea = {};
  authors = [];
  vote_up: any;
  vote_down: any;
  comment: any;
  email: string;
  searchTerm = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public platform: Platform,  
    private databaseprovider: DatabaseProvider, public http: Http, public storage: Storage, public toastCtrl: ToastController, private ideaProvider: IdeasProvider) {
      
    this.rootNavCtrl = navParams.get('rootNavCtrl');  
  }

  ionViewDidLoad() {
    this.getUserInfo();
    this.setFilteredItems();
  }

  ionViewWillEnter(){
    this.getUserInfo();
    this.setFilteredItems();    
  }  

  getUserInfo() {         
    this.storage.get('location_two').then( (val) => {
      this.location_two = val;
    });  
  }

  setFilteredItems() {
    if (this.searchTerm && this.searchTerm.trim() != '')
      this.ideas = this.ideas.filter((item) => {
        return ((item.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1) || 
                (item.description.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1));
      })
    else
     this.databaseprovider.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.loadIdeas();
        }
      });
  } 

  loadIdeas() {
    this.databaseprovider.getAllIdeas("TWO").then(data => {
      this.ideas = data;
    });
  }

  loadAuthors() {
    this.databaseprovider.getAllAuthors().then(data => {
      this.authors = data;
    });    
  }

  itemTapped(event, item) {
    this.rootNavCtrl.push(ItemDetailsPage, {
      item: item
    });
  }

  addItem() {
    let addModal = this.modalCtrl.create(ItemCreatePage, {location: this.location_two});
    addModal.onDidDismiss((item) => {
      
      if (item > 0) {
        this.loadIdeas();             
      } else if (item <= 0) {
        let toast = this.toastCtrl.create({
          message: "Error Creating Idea",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    });
    addModal.present();
  }  

  voteUp(idea) {
    this.databaseprovider.voteUp(idea).then(data => {
      let index = this.ideas.indexOf(idea);

      if(index > -1){
        this.ideas[index] = data;
      }
    });

    let data = {
      "up": true, 
      "down": false,
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }
    this.ideaProvider.ideaFeedback(data).then( (resp) => {
      console.log("Status: ", resp.status);
      console.log("Data: ", resp.data);
    }).catch((error) => {
      let toast = this.toastCtrl.create({
        message: 'Error al crear feedback en AppCivist',
        duration: 3000,
        position: 'top'
      });
      toast.present();        
      console.log("Error creating feedback: ", error);
    });
  }

  deleteVoteUp(idea) {
    this.databaseprovider.deleteVoteUp(idea).then(data => {
      let index = this.ideas.indexOf(idea);

      if(index > -1){
        this.ideas[index] = data;
      }
    });
  }

  voteDown(idea) {
    this.databaseprovider.voteDown(idea).then(data => {
      let index = this.ideas.indexOf(idea);

      if(index > -1){
        this.ideas[index] = data;
      }
    });

    let data = {
      "up": false, 
      "down": true,
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }
    this.ideaProvider.ideaFeedback(data).then( (resp) => {
      console.log("Status: ", resp.status);
      console.log("Data: ", resp.data);
    }).catch((error) => {
      let toast = this.toastCtrl.create({
        message: 'Error al crear feedback en AppCivist',
        duration: 3000,
        position: 'top'
      });
      toast.present();        
      console.log("Error creating feedback: ", error);
    });    
  }
  
  deleteVoteDown(idea) {
    this.databaseprovider.deleteVoteDown(idea).then(data => {
      let index = this.ideas.indexOf(idea);

      if(index > -1){
        this.ideas[index] = data;
      }
    });
  }  

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }  
}
