import { Injectable } from '@angular/core';
import { ToastController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Api } from '../api';
import { DatabaseProvider } from '../database/database';
import 'rxjs/add/operator/map';
import { LoggingProvider } from '../logging/logging';


@Injectable()
export class IdeasProvider {

  session_key: string;
  aid  = 112;
  cid  = 209;
  csid = 7903;

  constructor(public platform: Platform, public api: Api,  public storage: Storage, public databaseProvider: DatabaseProvider, public toastCtrl: ToastController,
              public loggingProvider: LoggingProvider) {
    this.platform.ready().then( () => {
      this.storage.get('session_key').then( (key) => {
        this.session_key = key;
      });
    });
  }

  getSessionKey() {
    return this.storage.get('session_key');
  }

  getIdea(cid){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      return this.api.get('space/' + this.csid + '/contribution/' + cid, {}, {'SESSION_KEY': this.session_key});
    });    
  }

  getIdeas(page, location?){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      let params = {
        'type': 'idea',
        'page': page,
        'pageSize': 5,
        'sorting': 'date_desc',
        'by_location': location
      }
      return this.api.get('space/' + this.csid + '/contribution', params, {'SESSION_KEY': this.session_key});
    });
  }

  postIdea(idea: any, location: any){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;

      let data = {
        "lang"     : "es-ES",
        "title"    : idea.title,
        "text"     : idea.description,
        "type"     : "IDEA",      
        "status"   : "PUBLISHED",
        "campaigns": [this.cid],
        "location" : {
          "placeName": location.name,
          "geoJson"  : "[{\"type\": \"Polygon\",\"coordinates\": [" + location.coordinates + "]}]"
        }
      }

      console.log("POST IDEA DATA: ", data);
      return this.api.post('space/' + this.csid + '/contribution', data, {'SESSION_KEY': this.session_key});
    });
  }

  putIdea(idea: any, location: any){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;

      let data = {
        "title"    : idea.title,
        "text"     : idea.description,
        "type"     : "IDEA",      
        "status"   : "PUBLISHED",
        "location" : {          
          "placeName": location.name,
          "geoJson"  : "[{\"type\": \"Polygon\",\"coordinates\": [" + location.coordinates + "]}]"          
        },      
        "contributionId": idea.idea_id
      }

      console.log("PUT IDEA DATA: ", data);
      return this.api.put('assembly/' + this.aid + '/contribution/' + idea.idea_id, data, {'SESSION_KEY': this.session_key});
    });
  }

  deleteIdea(idea_id){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      return this.api.put('assembly/' + this.aid + '/contribution/' + idea_id + '/softremoval', {}, {'SESSION_KEY': this.session_key});
    });
  }

  ideaFeedback(data){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      let feedback = {
        "up": data.up, 
        "down": data.down,
        "fav": "false", 
        "flag": "false", 
        "type": "MEMBER", 
        "status": "PUBLIC"
      }

      return this.api.put('assembly/' + this.aid + '/campaign/' + this.cid + '/contribution/' + data.idea_id + '/feedback', feedback, {'SESSION_KEY': this.session_key} );
    });
  }

  userFeedback(data){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      return this.api.get('assembly/' + this.aid + '/campaign/' + this.cid + '/contribution/' + data.idea_id + '/userfeedback', {}, {'SESSION_KEY': this.session_key} );
    });
  }

  ideaStat(data){
    return this.getSessionKey().then( (key) => {
      this.session_key = key;
      return this.api.get('assembly/' + this.aid + '/campaign/'+ this.cid + '/contribution/' + data.idea_id + '/stats', {}, {'SESSION_KEY': this.session_key});
    });
  }

  voteUp(idea){
    let data = {
      "up": true, 
      "down": false,
      "campaign_id": this.cid,
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

    let param = {
      action: "Vote Up Idea",
      action_data: idea
    }
    this.loggingProvider.logAction(param).then( (resp) => {resp.subscribe(()=>{});});

    return this.databaseProvider.voteUp(idea).then( (data) => {
      if (idea.voted_down == 1) {
        return this.deleteVoteDown(idea);        
      } else {
        return;
      }
    });    
  }

  deleteVoteDown(idea){
    let data = {
      "up": false, 
      "down": false, 
      "campaign_id": this.cid,
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

    let param = {
      action: "Delete Vote Down Idea",
      action_data: idea
    }
    this.loggingProvider.logAction(param).then( (resp) => {resp.subscribe(()=>{});});   

    return this.databaseProvider.deleteVoteDown(idea);
  }

  voteDown(idea){       
    let data = {
      "up": false, 
      "down": true,
      "campaign_id": this.cid,
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

    let param = {
      action: "Vote Down Idea",
      action_data: idea
    }
    this.loggingProvider.logAction(param).then( (resp) => {resp.subscribe(()=>{});});

    return this.databaseProvider.voteDown(idea).then(data => {
      if (idea.voted_up == 1) {
        return this.deleteVoteUp(idea);        
      } else {
        return;
      }
    });
  }

  deleteVoteUp(idea) {
    let data = {
      "up": false, 
      "down": false, 
      "campaign_id": this.cid,
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

    let param = {
      action: "Delete Vote Up Idea",
      action_data: idea
    }
    this.loggingProvider.logAction(param).then( (resp) => {resp.subscribe(()=>{});});

    return this.databaseProvider.deleteVoteUp(idea);
  }

  createEditIdea(data){
    return this.databaseProvider.getIdea("idea_id", data.contributionId).then( (res) => {      
      return this.getIdeaFeedBack({campaign_id: data.campaignIds[0], idea_id: data.contributionId}).then( (feedback) => {        
        return this.getUserIdeaFeedback({campaign_id: data.campaignIds[0], idea_id: data.contributionId}).then( (userfeedback) => {          
          if (res.id != null) {
            console.log("Edit Idea ID: ", data.contributionId);
            return this.editIdea(data, feedback, userfeedback).then( () => {
              return res.id;
            });
          } else {
            console.log("Create Idea ID: ", data.contributionId);                        
            return this.getIdeaAuthor(data).then( (author_id) => {
              if (data.location != null && data.location.placeName != null)              
                return this.getIdeaLocation(data.location.placeName).then( (location_id) => {                  
                  return this.createIdea(data, author_id, location_id, feedback, userfeedback).then( (new_id) => {
                    return new_id;
                  });
                });
              else
                return this.createIdea(data, author_id, null, feedback, userfeedback).then( (new_id) => {
                  return new_id;
                });
            });        
          }
        })
      })
    });
  }

  async editIdea(data, feedback, userfeedback){
    let idea = {  
      idea_id    : data.contributionId,    
      title      : data.title,
      description: data.plainText,
      votes_up   : feedback.ups,
      votes_down : feedback.downs,  
      // comments   : data.commentCount,
      voted_up   : userfeedback.up,
      voted_down : userfeedback.down
    }
    console.log("Edit Idea: ", idea);
    return await this.databaseProvider.updateIdea(idea);
  }

  async createIdea(data, author_id, location_id, feedback, userfeedback){
    let idea = {
      author_id  : author_id,
      idea_id    : data.contributionId,
      date       : data.creation,
      campaign_id: data.campaignIds[0],
      location_id: location_id,
      title      : data.title,
      description: data.plainText,
      ups        : feedback.ups,
      downs      : feedback.downs,  
      comments   : 0,
      voted_up   : userfeedback.up,
      voted_down : userfeedback.down,
      resourceSpaceId: data.resourceSpaceId
    }
    console.log("New Idea: ", idea);
    return await this.databaseProvider.createIdeaAC(idea);
  }

  getIdeaAuthor(data){  
    let email = "";
    let name = "";
    let image;
    let user_id;

    if (data.nonMemberAuthors) {
      if (data.nonMemberAuthors[0].email)      
        email = data.nonMemberAuthors[0].email;
      if (data.nonMemberAuthors[0].name)
        name  = data.nonMemberAuthors[0].name;
    } else if (data.firstAuthor) {       
      if (data.firstAuthor.email)
        email = data.firstAuthor.email;
      if (data.firstAuthor.name)
        name  = data.firstAuthor.name;
      if (data.firstAuthor.profilePic)
        image = data.firstAuthor.profilePic.urlAsString;
      if (data.firstAuthor.userId)
        user_id = data.firstAuthor.userId
    }    
    console.log("===> AUTHOR: ", [email, name, image]);
    return this.databaseProvider.getAuthor("email", email).then( (res) => {
      if (res.id != null) {
        console.log("GET IDEA AUTHOR ID: ", res.id);        
        return res.id;        
      } else {
        return this.databaseProvider.createAuthorAC({name: name, email: email, image: image, user_id: user_id}).then( (id) => {
          console.log("CREATE IDEA AUTHOR ID: ", id);          
          return id;
        });
      }
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
    }).catch( (error) => {      
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

  voteAction(vote, idea_id){
    return this.getIdea(idea_id).then( (res) => {      
      let response = JSON.parse(res.data);                
      return this.createEditIdea(response).then( () => {
        return this.databaseProvider.getIdea("idea_id", idea_id).then( (data) => {
          if (vote == "up")
            return this.voteUp(data);
          else
            return this.voteDown(data);
        });
      });
    });    
  }
}
