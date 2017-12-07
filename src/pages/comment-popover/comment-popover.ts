import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { CommentsProvider } from '../../providers/comments/comments';
import { EditCommentPage } from '../edit-comment/edit-comment';

@Component({
  selector: 'page-comment-popover',
  templateUrl: 'comment-popover.html',
})
export class CommentPopoverPage {

  idea: any;
  comment: any;
  
  constructor(public viewCtrl: ViewController, private navParams: NavParams, public databaseProvider: DatabaseProvider, public commentProvider: CommentsProvider,
              public modalCtrl: ModalController) {
    if (this.navParams.data) {      
      this.idea    = this.navParams.get('idea');      
      this.comment = this.navParams.get('comment');
    }
  }

  editComment() {
    let modal = this.modalCtrl.create(EditCommentPage, {comment: this.comment});
    modal.present();
    modal.onDidDismiss( () => {
      this.viewCtrl.dismiss();
    })
  }

  deleteComment() {
    console.log("Popover Comment Id: ", this.comment.comment_id);
    this.commentProvider.deleteComment(this.comment.comment_id).then( (resp) => {
      console.log("Delete Comment Status: ", resp.status);      
    });
    this.databaseProvider.deleteComment(this.comment.id).then( () => {
      this.databaseProvider.updateCommentCounter(this.idea, "delete").then( () => {
        this.viewCtrl.dismiss();
      });
    });    
  }  
}
