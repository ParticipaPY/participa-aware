import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { ItemCreatePage } from '../item-create/item-create';
import { DatabaseProvider } from "./../../providers/database/database";
import { Http } from "@angular/http";

@Component({
  selector: 'page-location-others',
  templateUrl: 'location-others.html'
})
export class LocationOthersPage {
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, 
    private databaseprovider: DatabaseProvider, public http: Http, public storage: Storage, public toastCtrl: ToastController) {
      
    this.rootNavCtrl = navParams.get('rootNavCtrl');      
  }

  ionViewDidLoad() {
    this.setFilteredItems();
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
    this.databaseprovider.getAllIdeas().then(data => {
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
    let addModal = this.modalCtrl.create(ItemCreatePage);
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
