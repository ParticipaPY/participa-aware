import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ModalController, ToastController, Platform, PopoverController } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { ItemCreatePage } from '../item-create/item-create';
import { DatabaseProvider } from "./../../providers/database/database";
import { Http } from "@angular/http";
import { IdeasProvider } from '../../providers/ideas/ideas';
import { IdeaPopoverPage } from '../idea-popover/idea-popover';

@Component({
  selector: 'page-location-two',
  templateUrl: 'location-two.html'
})
export class LocationTwoPage {
  
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
  user_id: any;
  page: number      = 0;
  perPage: number   = 0;
  totalData: number = 0;
  totalPage: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public platform: Platform,  
    private databaseprovider: DatabaseProvider, public http: Http, public storage: Storage, public toastCtrl: ToastController, private ideaProvider: IdeasProvider,
    public popoverCtrl: PopoverController) {
      
    this.rootNavCtrl = navParams.get('rootNavCtrl');  
  }

  ionViewWillLoad() {
    this.user_id = this.getUserID(); 
  }

  ionViewDidLoad() {    
    this.setFilteredItems();
  }

  ionViewWillEnter(){    
    this.setFilteredItems();    
  }  

  getUserInfo() {         
    return this.storage.get('location_two');  
  }

  async getUserID() {
    return await this.storage.get('user_id');
  }

  setFilteredItems() {
    if (this.searchTerm && this.searchTerm.trim() != '') {
      this.loadIdeas().then( (data) => {
        this.ideas = data.filter((item) => {
          return ((item.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1) || 
            (item.description.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1));
        });
      });
      
    } else {
      this.databaseprovider.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.loadIdeas();
        }
      });
    }
  } 

  loadIdeas() {
    return this.getUserInfo().then( (location_two) => {
      console.log("List Ideas Location ID: ", location_two);
      return this.databaseprovider.getAllIdeas(location_two).then(data => {
        return this.ideas = data;
      });
    });
  }

  loadAuthors() {
    this.databaseprovider.getAllAuthors().then(data => {
      this.authors = data;
    });    
  }

  itemTapped(event, item) {
    this.searchTerm = "";
    let addModal = this.modalCtrl.create(ItemDetailsPage, {item: item});
    
    addModal.onDidDismiss((item) => {
      this.loadIdeas();             
    });

    addModal.present();   
  }

  addItem() {
    this.getUserInfo().then( (location_two) => {
      let addModal = this.modalCtrl.create(ItemCreatePage, {location: location_two});
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
    });
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
    this.page = 0;
    this.perPage = 0;
    this.updateContent().then( () => {
      setTimeout( () => { 
        refresher.complete();    
      }, 2000);
    });
  } 

  async updateContent() {
    return await this.storage.get('location_two').then( (location_two) => {
      return this.databaseprovider.getLocationById(parseInt(location_two)).then( (location) => {
        return this.ideaProvider.getIdeas(this.page, location.name).then( (res) => {
          console.log("PAGE VALUE: ", this.page);
          console.log("GET IDEA RESPONSE STATUS: ", res.status);
          let response = JSON.parse(res.data);
          this.perPage = 5;
          this.totalData = response.total;
          this.totalPage = Math.ceil(response.total/5);
          let newIdeas = [];
          newIdeas     = response.list;
          let chain    = Promise.resolve();
          for (let i of newIdeas){     
            chain = chain.then( () => {
              return this.ideaProvider.createEditIdea(i).then(() => {
                this.loadIdeas();
              });
            });
          }
        }).catch( (error) => {
          let err = JSON.parse(error.error);
          console.log("AC - Error getting ideas message: ", err);
          let toast = this.toastCtrl.create({
            message: "Error al actualizar ideas",
            duration: 3000,
            position: 'top'
          });
          toast.present()
          return;
        });
      });
    });  
  }   

  doInfinite(infiniteScroll) {
    this.page = this.page + 1;
    this.updateContent().then( () => {
      setTimeout( () => {        
        infiniteScroll.complete();    
      }, 2000);
    });
  }

  presentIdeaPopover(myEvent, idea) {
    let popover = this.popoverCtrl.create(IdeaPopoverPage, {idea: idea});
    
    popover.present({
      ev: myEvent
    });
    
    popover.onDidDismiss( (type) => {
      console.log("Popover Dismessed");
      
      if (type == "delete") {
        let toast = this.toastCtrl.create({
          message: "Tu idea ha sido borrada",
          duration: 3000,
          position: 'top'
        });
        toast.present();
        setTimeout(() => {      
          this.loadIdeas();
        }, 3100);        
      } else {
        this.loadIdeas();
      }
    });   
  }  
}
