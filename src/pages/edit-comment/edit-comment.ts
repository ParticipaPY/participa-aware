import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { CommentsProvider } from '../../providers/comments/comments';
import { DatabaseProvider } from '../../providers/database/database';
import { LoggingProvider } from '../../providers/logging/logging';
import { FlashProvider } from '../../providers/flash/flash';

@Component({
  selector: 'page-edit-comment',
  templateUrl: 'edit-comment.html',
})
export class EditCommentPage {
  @ViewChild('input') myInput ;

  comment: any;
  isReadyToSave: boolean = false;

  constructor (public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, 
    public commentProvider: CommentsProvider, public databaseProvider: DatabaseProvider, public toastCtrl: ToastController, 
    public loggingProvider: LoggingProvider, private flashProvider: FlashProvider) {
              
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

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }  
  
  done () {
    console.log("Popover Comment Id: ", this.comment.comment_id);
    this.commentProvider.putComment(this.comment, "DISCUSSION").then( (resp) => {
      console.log("Update Comment Status: ", resp.status);      
    });

    this.databaseProvider.updateComment(this.comment).then( () => {      
      this.flashProvider.show('Tu comentario ha sido editado', 3000);  
      setTimeout(() => {      
        this.viewCtrl.dismiss();
      }, 3100);
    }).catch( (error) => {
      if (error.status != 500) {
        let err = JSON.parse(error.error);
        console.log("AC - Error Editing Comment: ", error);
        if (err.statusMessage) {
          console.log("AC - Error on Editing Comment Message: ", err.statusMessage);
          this.presentToast(err.statusMessage);
        } 
      }else {
        console.log("AC - Error on Editing Comment Message: ", error);
        this.presentToast("Error desde AppCivist al editar comentario");
      }                
    });

    let data = {
      action: "Edit Comment",
      action_data: this.comment
    }
    this.loggingProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
  }

  cancel () {
    this.viewCtrl.dismiss();
  }
 }
