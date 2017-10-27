import { Injectable } from '@angular/core';
import { Api } from '../api';
import { Storage } from '@ionic/storage';
import { Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class IdeasProvider {

  session_key: string;
  aid = 111;

  constructor(public api: Api,  public storage: Storage) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });    
  }

  getIdea(sid, cid){
    let headers = new Headers();
    headers.append('SESSION_KEY', this.session_key);
    let options = new RequestOptions({ headers: headers });

    return this.api.get('space/' + sid + '/contribution/' + cid, {'SESSION_KEY': this.session_key});
  }

  getIdeas(){
    let headers = new Headers();
    headers.append('SESSION_KEY', this.session_key);
    let options = new RequestOptions({ headers: headers });
    
    return this.api.get('assembly/'+ this.aid + '/contribution', {'type': 'idea', 'space': 'resources'}, {'SESSION_KEY': this.session_key});
  }

  postIdea(sid, idea: any){
    let data = {
      "lang"     : "es-es",
      "title"    : idea.title,
      "text"     : idea.description,
      "type"     : "IDEA",      
      "status"   : "PUBLISHED",
      "campaigns": [parseInt(idea.campaign_id)]      
    }
    console.log ("DATA: ", data);
    return this.api.post('space/' + sid + '/contribution', data, {'SESSION_KEY': this.session_key});
  }

  putIdea(){

  }

  deleteIdea(){

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

}
