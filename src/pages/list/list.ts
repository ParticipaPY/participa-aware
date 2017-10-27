import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ModalController, ToastController, Platform } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { ItemCreatePage } from '../item-create/item-create';
import { DatabaseProvider } from "./../../providers/database/database";
import { Http } from "@angular/http";
import { IdeasProvider } from '../../providers/ideas/ideas';

import { IdeaModel } from '../../models/idea-model'

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  rootNavCtrl: NavController;
  items: Array<{title: string, note: string, icon: string}>;
  ideas = [];
  idea = {};
  authors = [];
  detailPage: any;
  vote_up: any;
  vote_down: any;
  comment: any;
  email: string;
  location_one: any;
  searchTerm = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private databaseprovider: DatabaseProvider, public http: Http, 
    public storage: Storage, public toastCtrl: ToastController, public platform: Platform, private ideaProvider: IdeasProvider) {
      
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');  
  }
 
  ionViewDidLoad() {
    console.log("List Page DidLoad");
    this.getUserInfo();
    this.setFilteredItems();
  }

  ionViewWillEnter(){
    console.log("List Page WillEnter");
    this.getUserInfo();
    this.setFilteredItems();    
  }

  getUserInfo() {      
    this.storage.get('location_one').then( (val) => {
      this.location_one = val;
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
    this.databaseprovider.getAllIdeas("ONE").then(data => {
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
    let addModal = this.modalCtrl.create(ItemCreatePage, {location: this.location_one});
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
      if (idea.voted_down == 1) {
        this.deleteVoteDown(idea);        
      }

      this.loadIdeas();
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
      if (idea.voted_up == 1) {
        this.deleteVoteUp(idea);        
      }
      
      this.loadIdeas();
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
