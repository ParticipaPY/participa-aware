import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, ToastController, PopoverController, LoadingController, Loading } from 'ionic-angular';

import { Notification } from '../../providers/notification/notification';
import { IdeasProvider } from '../../providers/ideas/ideas';
import { LoggingProvider } from '../../providers/logging/logging';
import { IdeaPopoverPage } from '../idea-popover/idea-popover';
import { DatabaseProvider } from '../../providers/database/database';
import { CommentsProvider } from '../../providers/comments/comments';
import { CommentPopoverPage } from '../comment-popover/comment-popover';
import { FlashProvider } from '../../providers/flash/flash';

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
  loading: Loading;
  ideaLoaded: boolean = false;
  commentLoaded: boolean = false;
  finishLoading: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider, public storage: Storage, public commentProvider: CommentsProvider, 
    public toastCtrl: ToastController, public ideaProvider: IdeasProvider, public popoverCtrl: PopoverController, public loadingCtrl: LoadingController,
    public loggingProvider: LoggingProvider, public notificationProvider: Notification, private flashProvider: FlashProvider) {
   
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');     
  }

  ionViewWillLoad() {
    this.selectedItem = this.navParams.get('item');
    this.updateContent();
    this.loadIdeaComments();
  }

  ionViewDidLoad() {
    this.user_id = this.getUserID();
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.getIdea();       
      }
    });    
  }

  async getUserID() {
    return await this.storage.get('user_id');
  }

  updateIdea() {
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {   
        this.databaseprovider.getIdea("id", this.selectedItem.id).then( (data) => {
          if (data.id) {
            console.log("Idea Exists");
            this.ideaLoaded = true;
            this.selectedItem = data; 
          }
        });
      }
    });    
  }

  getIdea() { 
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {   
        this.databaseprovider.getIdea("idea_id", this.selectedItem.idea_id).then( (data) => {
          if (data.id != null) {
            console.log("Idea Exists on Database");
            this.ideaLoaded = true;
            this.selectedItem = data;            
            this.loadIdeaComments();
          } else {
            console.log("Idea does not exist");
            this.loading = this.loadingCtrl.create({
              spinner: 'bubbles',
              content: 'Cargando idea'
            });
            this.loading.present();            
            this.updateContent().then( () => {
              this.databaseprovider.getIdea("idea_id", this.selectedItem.idea_id).then( (data) => {
                if (data.id) {
                  console.log("Idea created on Database");
                  this.ideaLoaded = true;                  
                  this.loading.dismiss().then( () => {
                    this.selectedItem = data;
                    // this.loadIdeaComments();
                  });                  
                }
              });
            }).catch( (error) => {
              console.log("Error updating idea: ", error);
            });          
          }
        });
      }
    });
  }

  loadIdeaComments () {
    console.log("Loading Comments from database");
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.databaseprovider.getIdeaComments(this.selectedItem).then( (data) => {  
          this.comments = data;    
          this.commentLoaded = true;
        });
      }
    });
  }

  voteUp(idea) {
    this.ideaProvider.voteUp(idea).then( () => {
      this.updateIdea();
    });  
  }

  voteDown(idea) {
    this.ideaProvider.voteDown(idea).then( () => {
      this.updateIdea();
    });    
  } 

  deleteVoteUp(idea){
    this.ideaProvider.deleteVoteUp(idea).then( () => {
      this.updateIdea();
    });
  }

  deleteVoteDown(idea){
    this.ideaProvider.deleteVoteDown(idea).then( () => {
      this.updateIdea();
    });
  }

  createComment(){
    let data = {
      action: "Create Comment",
      action_data: this.comment
    }
    
    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.databaseprovider.createComment(this.comment, this.selectedItem).then( (data) => {      
          this.databaseprovider.updateCommentCounter(this.selectedItem, "create").then( () => {
            this.flashProvider.show('Tu comentario ha sido creado', 3000);
            this.updateIdea();
            setTimeout( () => {
              this.loadIdeaComments();
              this.comment = "";
            }, 3100);              
          });

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
        });
      }
    });
        
    this.getUserID().then( (user_id) => {    
      this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
        if (rdy) {
          this.databaseprovider.getAuthor("id", user_id).then( (comment_author) => {
            console.log("Comment Author: ", comment_author.user_id);
            this.databaseprovider.getAuthor("id", this.selectedItem.author_id).then( (idea_author) => {
              console.log("Idea Author: ", idea_author.user_id);
              if (idea_author.user_id != comment_author.user_id) {
                let param = {
                  "idea_id": this.selectedItem.idea_id,
                  "idea_author": idea_author.user_id,
                  "comment_author": comment_author.user_id
                }
                this.notificationProvider.notifyNewComment(param).subscribe( (resp) => {
                  console.log('Response from server - Notification on New Comment: ', resp);
                }, (err) => {
                  console.log('Error sending notification on new comment: ', err);
                });
              }
            });      
          });
        }
      });
    });

    this.loggingProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});   
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

      this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
        if (rdy) {
          this.databaseprovider.createAuthorAC(author).then( (res) => {
            console.log("Author ID: ", res);
            this.createIdeaFromAC(res);        
          });
        }
      });
    } else {
      console.log("Have email");
      this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
        if (rdy) {
          this.databaseprovider.getAuthor("email", this.selectedItem.email).then( (res) => {
            console.log("Author ID: ", res.id);
            this.createIdeaFromAC(res.id);
          });
        }
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

    this.databaseprovider.getDatabaseState().subscribe( (rdy) => {
      if (rdy) {
        this.databaseprovider.createIdeaAC(new_idea).then( (id) => {
          console.log("Idea ID ", id);            
          this.databaseprovider.getIdea("idea_id", this.selectedItem.idea_id).then( (new_idea) => {
            console.log("New Idea: ", new_idea);
            this.selectedItem = new_idea;
          });
        });
      }
    }); 
  }

  doRefresh(refresher) {
    this.updateContent().then( () => {
      setTimeout( () => {
        this.getIdea();    
        refresher.complete();
      }, 2000);
    });
  }  

  async updateContent(){
    return await this.ideaProvider.getIdea(this.selectedItem.idea_id).then( (res) => {
      console.log("GET IDEA FROM AC STATUS", res.status);
      let response = JSON.parse(res.data);      
      return this.ideaProvider.createEditIdea(response).then( (id) => {
        return this.commentProvider.getComments(response.resourceSpaceId).then( (resp) => {
          console.log("GET COMMENT FROM AC STATUS: ", resp.status);              
          let response    = JSON.parse(resp.data);
          let newComments = [];
          newComments     = response.list;            
          let chain       = Promise.resolve();                 
          for (let c of newComments){     
            chain = chain.then( () => {
              return this.commentProvider.createEditCommet(c, id).then( () => {
                this.loadIdeaComments();
              });
            });            
          }
        });
      });
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
        this.updateIdea();
      else if (type == "delete") {
        this.flashProvider.show('Tu idea ha sido borrada', 3000);
        setTimeout(() => {      
          this.navCtrl.pop();
        }, 3100);        
      }
    });    
  }

  presentCommentPopover(myEvent, comment) {
    let popover = this.popoverCtrl.create(CommentPopoverPage, {idea: this.selectedItem, comment: comment});
    
    popover.present({
      ev: myEvent
    });
    
    popover.onDidDismiss( (type) => {      
      if(type == "delete") {
        console.log("Comment Popover Dismissed on comment delete");
        let toast = this.toastCtrl.create({
          message: 'Comentario borrado',
          duration: 3000,
          position: 'top'
        });
        toast.present();   
        setTimeout(() => {      
          this.updateIdea();
          this.loadIdeaComments();
        }, 3100);
      } else if (type == "edit"){
        this.updateIdea();
        this.loadIdeaComments();  
      }
    });    
  }

}
