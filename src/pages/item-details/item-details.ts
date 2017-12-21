import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ToastController, PopoverController } from 'ionic-angular';
import { DatabaseProvider } from "../../providers/database/database";
import { CommentsProvider } from '../../providers/comments/comments';
import { IdeasProvider } from '../../providers/ideas/ideas';
import { IdeaPopoverPage } from '../idea-popover/idea-popover';
import { CommentPopoverPage } from '../comment-popover/comment-popover';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  rootNavCtrl: NavController;
  selectedItem: any;
  comment: string = "";  
  ideas = [];
  comments = [];
  itemExpandHeight: number = 100;
  user_id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider, public storage: Storage, public commentProvider: CommentsProvider, 
              public toastCtrl: ToastController, public ideaProvider: IdeasProvider, public popoverCtrl: PopoverController) {
   
    this.rootNavCtrl = this.navParams.get('rootNavCtrl'); 
  }

  ionViewWillLoad() {
    this.selectedItem = this.navParams.get('item');
    this.user_id      = this.getUserID(); 
    this.loadIdeaComments();
  }

  ionViewDidLoad() {
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.getIdea();       
      }
    })
  }

  async getUserID() {
    return await this.storage.get('user_id');
  }

  getIdea() {
    console.log("Selected Item: ", this.selectedItem);
    if (this.selectedItem.idea_id != null) {
      this.databaseprovider.getIdea("idea_id", this.selectedItem.idea_id).then( (data) => {
        if (data.id) {
          console.log("Idea Exists");
          this.selectedItem = data;
        } else {
          console.log("Idea does not exist on database");                
          this.getIdeaAuthor();
        }
        this.loadIdeaComments();
      });
    } else {
      console.log("Idea_id is null");
      this.databaseprovider.getIdea("id", this.selectedItem.id).then( (data) => {
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
  }

  loadIdeaComments () {
    this.databaseprovider.getIdeaComments(this.selectedItem).then( (data) => {
      this.comments = data;
    });
  }

  voteUp(idea) {
    this.ideaProvider.voteUp(idea).then( () => {
      this.getIdea();
    });  
  }

  voteDown(idea) {
    this.ideaProvider.voteDown(idea).then( () => {
      this.getIdea();
    });    
  } 

  deleteVoteUp(idea){
    this.ideaProvider.deleteVoteUp(idea).then( () => {
      this.getIdea();
    });
  }

  deleteVoteDown(idea){
    this.ideaProvider.deleteVoteDown(idea).then( () => {
      this.getIdea();
    });
  }

  createComment(){
    this.databaseprovider.createComment(this.comment, this.selectedItem).then( (data) => {      
      this.databaseprovider.updateCommentCounter(this.selectedItem, "create");
      this.commentProvider.postComment(this.selectedItem.resourceSpaceId, this.comment, "DISCUSSION").then ( (resp) => {
        let response = JSON.parse(resp.data);
        console.log("Status Create Comment: ", resp.status);      
        this.databaseprovider.updateCommentRSID(data, response.contributionId, response.resourceSpaceId);
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
      this.databaseprovider.getIdea("idea_id", this.selectedItem.idea_id).then( (new_idea) => {
        console.log("New Idea: ", new_idea);
        this.selectedItem = new_idea;
      });
    }); 
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    this.ideaProvider.getIdea(this.selectedItem.idea_id).then( (res) => {
      console.log("GET IDEA FROM AC STATUS", res.status);      
      let response = JSON.parse(res.data);
      let feedback;     
      let userfeedback; 
      this.ideaProvider.getIdeaFeedBack({campaign_id: response.campaignIds[0], idea_id: response.contributionId}).then( (f) => {
        feedback = f;
        this.ideaProvider.getUserIdeaFeedback({campaign_id: response.campaignIds[0], idea_id: response.contributionId}).then( (uf) => {
          userfeedback = uf;
          this.ideaProvider.editIdea(response, feedback, userfeedback).then( () => {
            this.commentProvider.getComments(response.resourceSpaceId).then( (resp) => {
              console.log("GET COMMENT FROM AC STATUS: ", resp.status);              
              let response    = JSON.parse(resp.data);
              let newComments = [];
              newComments     = response.list;
                            
              if (newComments.length > 0) {
                for (var i = 0; i < newComments.length; i++){      
                  this.commentProvider.createEditCommet(newComments[i], this.selectedItem.id).then( () => {
                    if (i == newComments.length){
                      refresher.complete();
                      this.getIdea();
                    }
                  });
                }
              } else {
                refresher.complete();
                this.getIdea();
              }
            })        
          })
        })
      })    
    });
  }  

  presentIdeaPopover(myEvent) {
    let popover = this.popoverCtrl.create(IdeaPopoverPage, {idea: this.selectedItem});
    
    popover.present({
      ev: myEvent
    });
    
    popover.onDidDismiss( (type) => {
      console.log("Popover Dismessed");
      console.log("Type: ", type);
      if (type == "edit")
        this.getIdea();
      else if (type == "delete")
        this.navCtrl.pop();
    });    
  }

  presentCommentPopover(myEvent, comment) {
    let popover = this.popoverCtrl.create(CommentPopoverPage, {idea: this.selectedItem, comment: comment});
    
    popover.present({
      ev: myEvent
    });
    
    popover.onDidDismiss( () => {
      console.log("Popover Dismessed");
      this.getIdea();
    });    
  }

}
