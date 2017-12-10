import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from "@angular/http";
import { NavController, NavParams, ModalController, ToastController, Platform , PopoverController} from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { ItemCreatePage } from '../item-create/item-create';
import { DatabaseProvider } from "./../../providers/database/database";
import { IdeasProvider } from '../../providers/ideas/ideas';
import { IdeaPopoverPage } from '../idea-popover/idea-popover';

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
  user_id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private databaseprovider: DatabaseProvider, public http: Http, 
    public storage: Storage, public toastCtrl: ToastController, public platform: Platform, private ideaProvider: IdeasProvider, public popoverCtrl: PopoverController) {
      
    this.rootNavCtrl = this.navParams.get('rootNavCtrl'); 
  }
 
  ionViewWillLoad() {
    this.user_id      = this.getUserID(); 
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

  async getUserID() {
    return await this.storage.get('user_id');
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
    this.ideaProvider.voteUp(idea).then( () => {
      this.loadIdeas();
    });        
  }

  voteDown(idea) {
    console.log("VOte Down from List");
    this.ideaProvider.voteDown(idea).then( () => {
      this.loadIdeas();
    });
  }

  deleteVoteUp(idea){
    this.ideaProvider.deleteVoteUp(idea).then( () => {
      this.loadIdeas();
    });
  }

  deleteVoteDown(idea){
    this.ideaProvider.deleteVoteDown(idea).then( () => {
      this.loadIdeas();
    });
  }    

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    this.ideaProvider.getIdeas().then( (res) => {
      let response = JSON.parse(res.data);
      let newIdeas = [];
      newIdeas     = response.list;

      if (newIdeas.length > 0) {
        for (var i = 0; i < newIdeas.length; i++){      
          this.ideaProvider.createEditIdea(newIdeas[i]);//.then( () => {          
            if (i == newIdeas.length){            
              refresher.complete();
              this.loadIdeas();
            }
          //});
        }
      } else {
        refresher.complete();
      }
    });
  } 

  presentIdeaPopover(myEvent, idea) {
    let popover = this.popoverCtrl.create(IdeaPopoverPage, {idea: idea});
    
    popover.present({
      ev: myEvent
    });
    
    popover.onDidDismiss( (type) => {
      console.log("Popover Dismessed");
      this.loadIdeas();
    });    
  }  

}
