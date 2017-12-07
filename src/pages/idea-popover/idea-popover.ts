import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { IdeasProvider } from '../../providers/ideas/ideas';
import { CommentsProvider } from '../../providers/comments/comments';
import { EditIdeaPage } from '../../pages/edit-idea/edit-idea';

@Component({
  selector: 'page-idea-popover',
  templateUrl: 'idea-popover.html',
})
export class IdeaPopoverPage {

  idea: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public databaseProvider: DatabaseProvider, 
              public ideaProvider: IdeasProvider, public commentProvider: CommentsProvider, public modalCtrl: ModalController) {
   
    if (this.navParams.data) {      
      this.idea = this.navParams.get('idea');                        
    }
  }

  editIdea() {
    let modal = this.modalCtrl.create(EditIdeaPage, {idea: this.idea});   
    
    modal.present();
    modal.onDidDismiss( () => {
      this.viewCtrl.dismiss({type:"edit"});
    })
  }

  deleteIdea() {
    console.log("Popover Idea Id: ", this.idea.idea_id);
    this.ideaProvider.deleteIdea(this.idea.idea_id).then( (resp) => {
      console.log("Delete Idea Status: ", resp.status);      
    });
    this.databaseProvider.deleteIdea(this.idea.id).then( () => {      
      this.viewCtrl.dismiss({type:"delete"});
    });
    this.deleteIdeaComments();
  }  

  deleteIdeaComments() {
    this.databaseProvider.getIdeaComments(this.idea).then( (comments) => {
      for(var l = 0; l < comments.length; l++){
        this.databaseProvider.deleteComment(comments[l].id);
        this.commentProvider.deleteComment(comments[l].comment_id);
      }
    });
  }
}
