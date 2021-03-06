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

  getSessionKey() {
    return this.storage.get('session_key');
  }

  getComment(){

  }

  getComments(sid){
    return this.getSessionKey().then( (key) => {
      
      return this.api.get('space/' + sid + '/contribution', {'type': 'DISCUSSION', 'sorting': 'date_desc'}, {'SESSION_KEY': key});
    });    
  }

  postComment(sid, comment: string, type){
    return this.getSessionKey().then( (key) => {      
      let data = {
        "lang"     : "es-es",
        "title"    : comment.substring(0, 10),
        "text"     : comment,
        "type"     : type,
        "status"   : "PUBLISHED"     
      }
      
      return this.api.post('space/' + sid + '/contribution', data, {'SESSION_KEY': key});
    });
  }

  putComment(comment, type){
    return this.getSessionKey().then( (key) => {      
      let data = {
        "title" : comment.description.substring(0, 10),
        "text"  : comment.description,
        "type"  : type,
        "status": "PUBLISHED",
        "contributionId": comment.comment_id
      }

      return this.api.put('assembly/' + this.aid + '/contribution/' + comment.comment_id, data, {'SESSION_KEY': key});
    });
  }

  deleteComment(comment_id){
    return this.getSessionKey().then( (key) => {      
      
      return this.api.put('assembly/' + this.aid + '/contribution/' + comment_id + '/softremoval', {}, {'SESSION_KEY': key});
    });
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
            return this.updateIdeaCommentCounter(idea_id).then( () => {
              return Promise.resolve();
            });            
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
    return await this.databaseProvider.getAuthor("email", email).then( (res) => {
      if (res.id != null) {                
        console.log("COMMENT AUTHOR ID EXISTS: ", res.id);
        return res.id;
      } else {
        return this.databaseProvider.createAuthorAC({name: name, email: email, image: image, user_id: user_id}).then( (id) => {
          console.log("COMMENT AUTHOR ID CREATED: ", id);
          return id;
        });
      }           
    });
  }

  async updateIdeaCommentCounter(idea_id) {
    return await this.databaseProvider.getIdea("id", idea_id).then( (idea) => {
      console.log("Update Idea Comment Counter: ", idea);
      return this.databaseProvider.updateCommentCounter(idea, "create");
    });
  }

}
