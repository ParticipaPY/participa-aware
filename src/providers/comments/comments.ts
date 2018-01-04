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

  createEditCommet(data, idea_id){
    console.log("Idea ID CE: ", idea_id);
    return this.databaseProvider.getComment(data.contributionId).then( (res) => {
      if (res.id) {
        console.log("Edit Comment");
        this.editComment(data);
      } else {
        console.log("Create Comment");
        let author;        
        this.getCommentAuthor(data).then( (author_id) => {
          author = author_id;          
            this.createComment(data, author, idea_id);          
        });        
      }
    });
  }

  editComment(data){
    let comment = {
      "comment_id" : data.contributionId,
      "description": data.text
    }

    console.log("Edit Commnet Data: ", comment);
    return this.databaseProvider.updateComment(comment);
  }

  createComment(data, author, idea_id){   
    console.log("IDEA ID C: ", idea_id); 
    let comment = {
      "comment_id" : data.contributionId,
      "idea_id"    : idea_id,
      "description": data.text,
      "author_id"  : author,
      "resourceSpaceId": data.resourceSpaceId
    }

    console.log("New Comment Data: ", comment);
    return this.databaseProvider.createCommentAC(comment);    
  }

  getCommentAuthor(data){
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
    console.log("===> AUTHOR: ", [email, name, image]);
    return this.databaseProvider.getAuthor(email).then( (res) => {
      if (res.id) {        
        author_id = res.id;        
      } else {
        this.databaseProvider.createAuthorAC({name: name, email: email, image: image}).then( (id) => {        
          author_id = id;
        });
      }
      console.log("AUTHOR ID: ", author_id);
      return author_id;      
    });
  }

}
