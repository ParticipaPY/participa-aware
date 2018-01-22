import { Injectable } from '@angular/core';
import { Api } from '../api';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../database/database';
import 'rxjs/add/operator/map';

@Injectable()
export class CommentsProvider {

  session_key: string;
  aid  = 112;
  csid = 7903;  

  constructor(public api: Api, public storage: Storage, public databaseProvider: DatabaseProvider) {
    this.storage.get('session_key').then( (key) => {
      this.session_key = key
    });    
  }

  getComment(){

  }

  getComments(sid){
    return this.api.get('space/' + sid + '/contribution', {'type': 'DISCUSSION', 'sorting': 'date_desc'}, {'SESSION_KEY': this.session_key});
  }

  postComment(sid, comment: string, type){
    let data = {
      "lang"     : "es-es",
      "title"    : comment.substring(0, 10),
      "text"     : comment,
      "type"     : type,
      "status"   : "PUBLISHED"     
    }
    console.log ("SESSION_KEY: ", this.session_key);
    return this.api.post('space/' + sid + '/contribution', data, {'SESSION_KEY': this.session_key});
  }

  putComment(comment, type){
    let data = {
      "title" : comment.description.substring(0, 10),
      "text"  : comment.description,
      "type"  : type,
      "status": "PUBLISHED",
      "contributionId": comment.comment_id
    }

    return this.api.put('assembly/' + this.aid + '/contribution/' + comment.comment_id, data, {'SESSION_KEY': this.session_key});
  }

  deleteComment(comment_id){
    console.log("Comment ID: ", comment_id);
    return this.api.put('assembly/' + this.aid + '/contribution/' + comment_id + '/softremoval', {}, {'SESSION_KEY': this.session_key});
  }  

  async createEditCommet(data, idea_id){    
    return await this.databaseProvider.getComment(data.contributionId).then( (res) => {
      if (res.id != null) {
        console.log("Edit Comment");
        return this.editComment(data).then( () => {
          return Promise.resolve();
        });
      } else {
        console.log("Create Comment");        
        return this.getCommentAuthor(data).then( (author_id) => {          
          return this.createComment(data, author_id, idea_id).then( () => {
            return Promise.resolve();
          });         
        });        
      }
    });
  }

  async editComment(data){
    let comment = {
      "comment_id" : data.contributionId,
      "description": data.text
    }

    console.log("Edit Commnet Data: ", comment);
    return await this.databaseProvider.updateComment(comment);
  }

  async createComment(data, author, idea_id){       
    let comment = {
      "comment_id" : data.contributionId,
      "idea_id"    : idea_id,
      "description": data.text,
      "author_id"  : author,
      "resourceSpaceId": data.resourceSpaceId
    }

    console.log("New Comment Data: ", comment);
    return await this.databaseProvider.createCommentAC(comment);    
  }

  async getCommentAuthor(data){    
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
    console.log("===> AUTHOR: ", [email, name, image]);
    return await this.databaseProvider.getAuthor(email).then( (res) => {
      if (res.id != null) {                
        console.log("COMMENT AUTHOR ID EXISTS: ", res.id);
        return res.id;
      } else {
        return this.databaseProvider.createAuthorAC({name: name, email: email, image: image}).then( (id) => {
          console.log("COMMENT AUTHOR ID CREATED: ", id);
          return id;
        });
      }           
    });
  }

}
