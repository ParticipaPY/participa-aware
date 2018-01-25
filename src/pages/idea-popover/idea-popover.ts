import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { IdeasProvider } from '../../providers/ideas/ideas';
import { CommentsProvider } from '../../providers/comments/comments';
import { EditIdeaPage } from '../../pages/edit-idea/edit-idea';
import { LoggingProvider } from '../../providers/logging/logging';

@Component({
  selector: 'page-idea-popover',
  templateUrl: 'idea-popover.html',
})
export class IdeaPopoverPage {

  idea: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public databaseProvider: DatabaseProvider, 
              public ideaProvider: IdeasProvider, public commentProvider: CommentsProvider, public modalCtrl: ModalController, private alertCtrl: AlertController,
              public toastCtrl: ToastController, public loggingProvider: LoggingProvider) {
   
    if (this.navParams.data) {      
      this.idea = this.navParams.get('idea');                        
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

  editIdea() {
    let modal = this.modalCtrl.create(EditIdeaPage, {idea: this.idea});   
    
    modal.present();
    modal.onDidDismiss( () => {
      this.viewCtrl.dismiss("edit");
    })
  }

  deleteIdea() {
    console.log("Popover Idea Id: ", this.idea.idea_id);
    let alert = this.alertCtrl.create({
      title: 'Borrar Idea',
      message: '¿Estás seguro de que deseas borrar esta idea?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('El borrado de la idea ha sido cancelado');            
            alert.dismiss().then( () => {
              this.viewCtrl.dismiss();
            });
            return false;          
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Borrar idea');
            alert.dismiss().then( () => { 
              this.ideaProvider.deleteIdea(this.idea.idea_id).then( (resp) => {
                console.log("AC - Delete Idea Status: ", resp.status);      
              }).catch( (error) => {
                if (error.status != 500) {
                  let err = JSON.parse(error.error);
                  console.log("AC - Error Deleting Idea: ", error);
                  if (err.statusMessage) {
                    console.log("AC - Error on Deleting Idea Message: ", err.statusMessage);
                    this.presentToast(err.statusMessage);
                  } 
                }else {
                  console.log("AC - Error on Deleting Idea Message: ", error);
                  this.presentToast("Error desde AppCivist al borrar idea");
                }
              });
              this.databaseProvider.deleteIdea(this.idea.id).then( () => {         
                this.viewCtrl.dismiss("delete");
              });
              this.deleteIdeaComments();

              let data = {
                action: "Delete Idea",
                action_data: this.idea
              }
              this.loggingProvider.logAction(data).then( (resp) => {resp.subscribe(()=>{});});
            });
            return false;
          }
        }
      ]
    });
    alert.present();
  }  

  deleteIdeaComments() {
    this.databaseProvider.getIdeaComments(this.idea).then( (comments) => {
      for(var l = 0; l < comments.length; l++){
        this.databaseProvider.deleteComment(comments[l].id);        
      }
    });
  }
}
