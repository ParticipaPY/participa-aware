import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Api } from '../api';
import { DatabaseProvider } from '../database/database';
import 'rxjs/add/operator/map';


@Injectable()
export class IdeasProvider {

  session_key: string;
  aid  = 112;
  cid  = 209;
  csid = 7903;

  constructor(public api: Api,  public storage: Storage, public databaseProvider: DatabaseProvider, public toastCtrl: ToastController) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });    
  }

  getIdea(cid){
    return this.api.get('space/' + this.csid + '/contribution/' + cid, {}, {'SESSION_KEY': this.session_key});
  }

  getIdeas(){
    let params = {
      'type': 'idea',
      'page': 0,
      'pageSize': 35,
      'sorting': 'date_desc'
    }
    return this.api.get('space/' + this.csid + '/contribution', params, {'SESSION_KEY': this.session_key});
  }

  postIdea(idea: any, location: any){
    let s = location.coordinates.replace("[[", "").replace("]]", "").split('], [');
    let final = [];
    
    for (var l = 0; l < s.length; l++){
      let a = s[l].split(', ');
      final.push([parseFloat(a[0]), parseFloat(a[1])]);
    }

    let data = {
      "lang"     : "es-es",
      "title"    : idea.title,
      "text"     : idea.description,
      "type"     : "IDEA",      
      "status"   : "PUBLISHED",
      "campaigns": [this.cid],
      "location" : {
        "placeName": location.name,
        "geoJson"  : "[{\"type\": \"Polygon\",\"coordinates\": [final]}]"
      }
    }

    return this.api.post('space/' + this.csid + '/contribution', data, {'SESSION_KEY': this.session_key});
  }

  putIdea(idea: any, location: any){
    let s = location.coordinates.replace("[[", "").replace("]]", "").split('], [');
    let final = [];
    
    for (var l = 0; l < s.length; l++){
      let a = s[l].split(', ');
      final.push([parseFloat(a[0]), parseFloat(a[1])]);
    }

    let data = {
      "title"    : idea.title,
      "text"     : idea.description,
      "type"     : "IDEA",      
      "status"   : "PUBLISHED",
      "location" : {
        "location" : {
          "placeName": location.name,
          "geoJson"  : "[{\"type\": \"Polygon\",\"coordinates\": [final]}]"
        }
      },      
      "contributionId": idea.idea_id
    }

    return this.api.put('assembly/' + this.aid + '/contribution/' + idea.idea_id, data, {'SESSION_KEY': this.session_key});

  }

  deleteIdea(idea_id){
    return this.api.put('assembly/' + this.aid + '/contribution/' + idea_id + '/softremoval', {}, {'SESSION_KEY': this.session_key});
  }

  ideaFeedback(data){
    let feedback = {
      "up": data.up, 
      "down": data.down,
      "fav": "false", 
      "flag": "false", 
      "type": "MEMBER", 
      "status": "PUBLIC"
    }

    return this.api.put('assembly/' + this.aid + '/campaign/' + data.campaign_id + '/contribution/' + data.idea_id + '/feedback', feedback, {'SESSION_KEY': this.session_key} );
  }

  userFeedback(data){
    return this.api.get('assembly/' + this.aid + '/campaign/' + data.campaign_id + '/contribution/' + data.idea_id + '/userfeedback', {}, {'SESSION_KEY': this.session_key} );
  }

  ideaStat(data){
    return this.api.get('assembly/' + this.aid + '/campaign/'+ data.campaign_id + '/contribution/' + data.idea_id + '/stats', {}, {'SESSION_KEY': this.session_key});
  }

  voteUp(idea){
    let data = {
      "up": true, 
      "down": false,
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }

    this.ideaFeedback(data).then( (resp) => {
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

    return this.databaseProvider.voteUp(idea).then( (data) => {
      if (idea.voted_down == 1) {
        this.deleteVoteDown(idea);        
      }
    });    
  }

  deleteVoteDown(idea){
    let data = {
      "up": false, 
      "down": false, 
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }

    this.ideaFeedback(data).then( (resp) => {
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

    return this.databaseProvider.deleteVoteDown(idea);
  }

  voteDown(idea){   
    console.log("VOte DOwn from Idea Provider");     
    let data = {
      "up": false, 
      "down": true,
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }
    this.ideaFeedback(data).then( (resp) => {
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

    return this.databaseProvider.voteDown(idea).then(data => {
      if (idea.voted_up == 1) {
        this.deleteVoteUp(idea);        
      }
    });
  }

  deleteVoteUp(idea) {
    let data = {
      "up": false, 
      "down": false, 
      "campaign_id": idea.campaign_id,
      "idea_id": idea.idea_id
    }

    this.ideaFeedback(data).then( (resp) => {
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

    return this.databaseProvider.deleteVoteUp(idea);
  }

  createEditIdea(data){

    return this.databaseProvider.getIdea("idea_id", data.contributionId).then( (res) => {      
      return this.getIdeaFeedBack({campaign_id: data.campaignIds[0], idea_id: data.contributionId}).then( (feedback) => {        
        return this.getUserIdeaFeedback({campaign_id: data.campaignIds[0], idea_id: data.contributionId}).then( (userfeedback) => {          
          if (res.id != null) {
            console.log("Edit Idea ID: ", data.contributionId);
            return this.editIdea(data, feedback, userfeedback);
          } else {
            console.log("Create Idea ID: ", data.contributionId);                        
            return this.getIdeaAuthor(data).then( (author_id) => {
              if (data.location != null && data.location.placeName != null)              
                this.getIdeaLocation(data.location.placeName).then( (location_id) => {                  
                  return this.createIdea(data, author_id, location_id, feedback, userfeedback);
                });
              else
                return this.createIdea(data, author_id, null, feedback, userfeedback);
            });        
          }
        })
      })
    });
  }

  editIdea(data, feedback, userfeedback){
    let idea = {  
      idea_id    : data.contributionId,    
      title      : data.title,
      description: data.text,
      votes_up   : feedback.ups,
      votes_down : feedback.downs,  
      comments   : data.commentCount,
      voted_up   : userfeedback.up,
      voted_down : userfeedback.down
    }
    console.log("Edit Idea: ", idea);
    return this.databaseProvider.updateIdea(idea);
  }

  createIdea(data, author_id, location_id, feedback, userfeedback){
    let idea = {
      author_id  : author_id,
      idea_id    : data.contributionId,
      date       : data.creation,
      campaign_id: data.campaignIds[0],
      location_id: location_id,
      title      : data.title,
      description: data.text,
      ups        : feedback.ups,
      downs      : feedback.downs,  
      comments   : data.commentCount,
      voted_up   : userfeedback.up,
      voted_down : userfeedback.down,
      resourceSpaceId: data.resourceSpaceId
    }
    console.log("New Idea: ", idea);
    return this.databaseProvider.createIdeaAC(idea);
  }

  getIdeaAuthor(data){
    let author_id;
    let email = "";
    let name = "";
    let image;

    if (data.nonMemberAuthors) {      
      email = data.nonMemberAuthors[0].email;
      name  = data.nonMemberAuthors[0].name;
    } else if (data.firstAuthor) {            
      email = data.firstAuthor.email;
      name  = data.firstAuthor.name;
      image = data.firstAuthor.profilePic.urlAsString;
    }    
    return this.databaseProvider.getAuthor(email).then( (res) => {
      if (res.id) {
        console.log("GET AUTHOR ID: ", res.id);
        author_id = res.id;        
      } else {
        this.databaseProvider.createAuthorAC({name: name, email: email, image: image}).then( (id) => {
          console.log("CREATE AUTHOR ID: ", id);
          author_id = id;
        });
      }
      return author_id;      
    });
  }

  getIdeaLocation(name){
    return this.databaseProvider.getLocationByName(name).then( (res) => {
      console.log("Location FROM DB", res);
      return res.id;
    });
  }

  getIdeaFeedBack(data){
    let feedback = { ups: 0, downs: 0};

    return this.ideaStat(data).then( (resp) => {      
      let response = JSON.parse(resp.data);
      feedback.ups = response.ups;
      feedback.downs = response.downs;
      return feedback;
    });

  }

  getUserIdeaFeedback(data){
    let feedback = { up: 0, down: 0};
    
    return this.userFeedback(data).then( (resp) => {
      console.log("GET USER FEDDBACK STATUS: ", resp.status);
      let response = JSON.parse(resp.data);
      if (resp.status == 200) {
        if (response.up)
          feedback.up = 1;
        
        if (response.down)
          feedback.down = 1;
      }
      return feedback;
    }).catch( (error) => {      
      return feedback;
    });

  }
}
