import { Injectable } from '@angular/core';
import { Api } from '../api';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

@Injectable()
export class IdeasProvider {

  session_key: string;

  constructor(public api: Api,  public storage: Storage) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });    
  }

  getIdea(){

  }

  getIdeas(){

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

}
