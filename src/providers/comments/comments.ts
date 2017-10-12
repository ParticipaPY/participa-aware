import { Injectable } from '@angular/core';
import { Api } from '../api';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

@Injectable()
export class CommentsProvider {

  session_key: string;

  constructor(public api: Api, public storage: Storage) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });    
  }

  getComment(){

  }

  getComments(){

  }

  postComment(sid, comment: string, type){
    let data = {
      "lang"     : "es-es",
      "title"    : comment.substring(0, 10),
      "text"     : comment,
      "type"     : type,      
      "status"   : "PUBLISHED"     
    }
    console.log ("DATA: ", data);
    return this.api.post('space/' + sid + '/contribution', data, {'SESSION_KEY': this.session_key});
  }

  putIdea(){

  }

  deleteIdea(){

  }  

}
