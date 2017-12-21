import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CommentsProvider } from '../../providers/comments/comments';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-edit-comment',
  templateUrl: 'edit-comment.html',
})
export class EditCommentPage {
  @ViewChild('input') myInput ;

  comment: any;
  isReadyToSave: boolean = false;

  constructor (public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public commentProvider: CommentsProvider, 
              public databaseProvider: DatabaseProvider) {
              
    this.comment = this.navParams.get('comment');
  }

  ionViewWillLoad () {
    this.comment = this.navParams.get('comment');
  }

  ionViewDidLoad() {  
     setTimeout(() => {      
      this.myInput.setFocus();
     }, 1000);
  }

  commentChange() {
    this.isReadyToSave = true;
  }

  done () {
    console.log("Popover Comment Id: ", this.comment.comment_id);
    this.commentProvider.putComment(this.comment, "DISCUSSION").then( (resp) => {
      console.log("Update Comment Status: ", resp.status);      
    });
    this.databaseProvider.updateComment(this.comment).then( () => {      
      this.viewCtrl.dismiss();
    });     
  }

  cancel () {
    this.viewCtrl.dismiss();
  }
 }
