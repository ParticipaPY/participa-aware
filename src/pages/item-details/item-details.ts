import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

import { NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from "../../providers/database/database";

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  selectedItem: any;
  comment: string = "";  
  ideas = [];
  comments = [];
  itemExpandHeight: number = 100;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider, public storage: Storage) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');      
  } 

  ionViewDidLoad(){
    this.databaseprovider.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.getIdea();
        this.loadIdeaComments();
      }
    })
  }

  getIdea() {
    this.databaseprovider.getIdea(this.selectedItem.id).then(data => {
      this.selectedItem = data;
    });
  }

  loadIdeaComments () {
    this.databaseprovider.getIdeaComments(this.selectedItem).then(data => {
      this.comments = data;
    });
  }

  voteUp(idea) {
    this.databaseprovider.voteUp(idea).then(data => {
      if (idea.voted_down == 1) {
        this.deleteVoteDown(idea);        
      }

      this.getIdea();
    });
  }

  deleteVoteUp(idea) {
    this.databaseprovider.deleteVoteUp(idea).then(data => {
      this.selectedItem = data;
    });
  }

  voteDown(idea) {
    this.databaseprovider.voteDown(idea).then(data => {
      if (idea.voted_up == 1) {
        this.deleteVoteUp(idea);        
      }
      
      this.getIdea();
    }); 
  } 

  deleteVoteDown(idea) {
    this.databaseprovider.deleteVoteDown(idea).then(data => {
      this.selectedItem = data;
    });
  }

  createComment(){
    this.databaseprovider.createComment(this.comment, this.selectedItem).then(data => {
      this.getIdea();
      this.loadIdeaComments();
      this.comment = "";
    });
  }

  expandItem(item){
    this.comments.map((listItem) => {
        if(item == listItem){
            listItem.expanded = !listItem.expanded;
        } else {
            listItem.expanded = false;
        }
        return listItem;
    });
  }  
}
