import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController, AlertController, ToastController } from 'ionic-angular';
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
              public modalCtrl: ModalController, private alertCtrl: AlertController, public toastCtrl: ToastController) {

    if (this.navParams.data) {      
      this.idea    = this.navParams.get('idea');      
      this.comment = this.navParams.get('comment');
    }
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'top'
    });
    toast.present();
  }
  
  editComment() {
    let modal = this.modalCtrl.create(EditCommentPage, {comment: this.comment});
    modal.present();
    modal.onDidDismiss( () => {
      this.viewCtrl.dismiss();
    })
  }

  deleteComment() {
    let alert = this.alertCtrl.create({
      title: 'Borrar Comentario',
      message: '¿Estás seguro de que deseas borrar este comentario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('El borrado del comentario ha sido cancelado');            
            alert.dismiss().then( () => {
              this.viewCtrl.dismiss();
            });
            return false;
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Borrar comentario');
            alert.dismiss().then( () => { 
              console.log("Popover Comment Id: ", this.comment.comment_id);
              this.commentProvider.deleteComment(this.comment.comment_id).then( (resp) => {
                console.log("Delete Comment Status: ", resp.status);      
              }).catch( (error) => {
                if (error.status != 500) {
                  let err = JSON.parse(error.error);
                  console.log("AC - Error Deleting Comment: ", error);
                  if (err.statusMessage) {
                    console.log("AC - Error on Deleting Comment Message: ", err.statusMessage);
                    this.presentToast(err.statusMessage);
                  } 
                }else {
                  console.log("AC - Error on Deleting Comment Message: ", error);
                  this.presentToast("Error desde AppCivist al borrar comentario");
                }                
              });
              this.databaseProvider.deleteComment(this.comment.id).then( () => {
                this.databaseProvider.updateCommentCounter(this.idea, "delete").then( () => {
                  this.viewCtrl.dismiss();
                });
              });
            });
            return false;
          }
        }
      ]
    });
    alert.present();
  }  
}
