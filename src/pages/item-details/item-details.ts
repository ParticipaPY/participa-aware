import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

import { NavController, NavParams, ToastController } from 'ionic-angular';
import { DatabaseProvider } from "../../providers/database/database";
import { CommentsProvider } from '../../providers/comments/comments';
import { IdeasProvider } from '../../providers/ideas/ideas';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider, public storage: Storage, public commentProvider: CommentsProvider, 
    public toastCtrl: ToastController, public ideaProvider: IdeasProvider) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');      
  } 

  ionViewDidLoad(){
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.getIdea();       
      }
    })
  }

  getIdea() {
    this.databaseprovider.getIdea(this.selectedItem.idea_id).then( (data) => {
      if (data.id) {
        console.log("Idea Exists");
        this.selectedItem = data;
      } else {
        console.log("Idea does not exist on database");                
        this.getIdeaAuthor();
      }
      this.loadIdeaComments();
    });
  }

  loadIdeaComments () {
    this.databaseprovider.getIdeaComments(this.selectedItem).then( (data) => {
      this.comments = data;
    });
  }

  voteUp(idea) {
    this.databaseprovider.voteUp(idea).then( (data) => {
      if (idea.voted_down == 1) {
        this.deleteVoteDown(idea);        
      }

      this.getIdea();
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
    this.databaseprovider.deleteVoteUp(idea).then( (data) => {
      this.selectedItem = data;
    });
  }

  voteDown(idea) {
    this.databaseprovider.voteDown(idea).then( (data) => {
      if (idea.voted_up == 1) {
        this.deleteVoteUp(idea);        
      }
      
      this.getIdea();
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
    this.databaseprovider.deleteVoteDown(idea).then( (data) => {
      this.selectedItem = data;
    });
  }

  createComment(){
    this.databaseprovider.createComment(this.comment, this.selectedItem).then( (data) => {
      this.databaseprovider.updateCommentCounter(this.selectedItem);
      this.commentProvider.postComment(this.selectedItem.resourceSpaceId, this.comment, "DISCUSSION").then ( (resp) => {
        let response = JSON.parse(resp.data);
        console.log("Status: ", resp.status);
        console.log("Data: ", resp.data);
        console.log("===> Comment ID: ", data);
        console.log("===> Comment Contribution ID: ", response.contributionId);
        console.log("===> Comment Resource Space ID: ", response.resourceSpaceId);        
        this.databaseprovider.updateCommentRSID(data, response.resourceSpaceId);
      }).catch((error) => {
        let toast = this.toastCtrl.create({
          message: 'Error al crear Comentario en AppCivist',
          duration: 3000,
          position: 'top'
        });
        toast.present();        
        console.log("Error creating Comment: ", error);
      });
      this.getIdea();
      this.loadIdeaComments();
      this.comment = "";      
    });
  }

  expandItem(item){
    this.comments.map( (listItem) => {
      if(item == listItem){
          listItem.expanded = !listItem.expanded;
      } else {
          listItem.expanded = false;
      }
      return listItem;
    });
  }  

  getIdeaAuthor(){
    if (this.selectedItem.email === ""){
      console.log("Don't have email");
      let author = {
        name : this.selectedItem.name,
        email: this.selectedItem.email
      };

      this.databaseprovider.createAuthorAC(author).then( (res) => {
        console.log("Author ID: ", res);
        this.createIdeaFromAC(res);        
      });
    } else {
      console.log("Have email");
      this.databaseprovider.getAuthor(this.selectedItem.email).then( (res) => {
        console.log("Author ID: ", res.id);
        this.createIdeaFromAC(res.id);
      });
    }
  }

  createIdeaFromAC(author_id) {    
    let new_idea = {
      author_id  : author_id,
      idea_id    : this.selectedItem.idea_id,
      date       : this.selectedItem.date, 
      campaign_id: this.selectedItem.campaign_id, 
      location_id: this.selectedItem.location_id, 
      title      : this.selectedItem.title, 
      description: this.selectedItem.description,
      ups        : this.selectedItem.ups,
      downs      : this.selectedItem.downs, 
      comments   : this.selectedItem.comments, 
      resourceSpaceId: this.selectedItem.resourceSpaceId
    };

    console.log("Idea Author ID: ", new_idea.author_id);

    this.databaseprovider.createIdeaAC(new_idea).then( (id) => {
      console.log("Idea ID ", id);            
      this.databaseprovider.getIdea(this.selectedItem.idea_id).then( (new_idea) => {
        console.log("New Idea: ", new_idea);
        this.selectedItem = new_idea;
      });
    }); 
  }
}
