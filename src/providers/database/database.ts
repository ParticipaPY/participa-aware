import { Injectable, OnInit } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
 
@Injectable()
export class DatabaseProvider implements OnInit{
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;
  author_id: any;
  location_one: any;
  location_two: any;
  location_three: any;
 
  constructor(public sqlitePorter: SQLitePorter, private storage: Storage, private sqlite: SQLite, private platform: Platform, private http: Http, public events: Events) {

    this.databaseReady = new BehaviorSubject(false);

    this.platform.ready().then(() => {
      this.getUserInfo();
      this.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        this.storage.get('database_filled').then(val => {
          if (val) {
            this.databaseReady.next(true);
          } else {
            this.fillDatabase();
          }
        });
      });
    });
  }

  ngOnInit(){
    this.getUserInfo();
  }
 
  getUserInfo(){
    this.storage.get('user_id').then( id => {
      this.author_id = id;
    });
    this.storage.get('location_one').then( (val) => {
      this.location_one = val;
    });
    this.storage.get('location_two').then( (val) => {
      this.location_two = val;
    });        
    this.storage.get('location_three').then( (val) => {
      this.location_three = val;
    });
  }

  fillDatabase() {
    this.http.get('assets/ideas.sql')
      .map(res => res.text())
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data => {
            this.databaseReady.next(true);
            this.storage.set('database_filled', true);
          })
          .catch(e => console.error(e));
      });
  }

  deleteDatabase() {
    this.sqlite.deleteDatabase({
        name: 'data.db',
        location: 'default'
      });
  }
 
  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  getAllLocations() {
    return this.database.executeSql("SELECT * FROM location;", []).then((data) => {
      let locations = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          locations.push(
            { 
              id: data.rows.item(i).id,
              name: data.rows.item(i).name,
              population: data.rows.item(i).population,
              coordinates: data.rows.item(i).coordinates
            });
        }
      }
      return locations;
    }, err => {
      console.log('Error: ', err);
      return [];
    });    
  }

  getAllAuthors() {
    return this.database.executeSql("SELECT * FROM author;", []).then((data) => {
      let authors = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          authors.push({ name: data.rows.item(i).name });
        }
      }
      return authors;
    }, err => {
      console.log('Error: ', err);
      return [];
    });    
  }

  getAuthor(email){
    let sql = "SELECT * FROM author WHERE email = ?;";
    return this.database.executeSql(sql, [email]).then((data) => {
      let author = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          author.push({ 
            id: data.rows.item(i).id, 
            name: data.rows.item(i).name,
            email: data.rows.item(i).email,
            profile_pic: data.rows.item(i).profile_pic });
        }
      }
      return author[0];
    }, err => {
      console.log('Error: ', err);
      return {};
    });    
  }

  getAllIdeas(location?: string) {
    this.getUserInfo();
    let where: string;
    let data;
    if (location) {
      where = "WHERE i.location_id = ? ";
      if (location === "ONE")
        data = [parseInt(this.location_one)];
      else if (location === "TWO")
        data = [parseInt(this.location_two)];
      else
        data = [parseInt(this.location_three)];
    } else {
      where = "";
      data = [];
    }
    
    let sql = "SELECT i.id, i.idea_id, i.campaign_id, i.title, i.date, i.description, i.location_id, i.votes_up, i.votes_down, i.comments, i.voted_up, i.voted_down, i.resourceSpaceId, a.name, a.profile_pic, l.name as location_name " +
              "FROM idea i " + 
              "JOIN author a on (i.author_id = a.id) " +
              "JOIN location l on (i.location_id = l.id)" + 
              where + 
              "ORDER BY i.date desc;"

    return this.database.executeSql(sql, data).then((data) => {
      let ideas = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          ideas.push({ 
            id: data.rows.item(i).id,
            idea_id: data.rows.item(i).idea_id,
            campaign_id: data.rows.item(i).campaign_id,
            title: data.rows.item(i).title, 
            date: data.rows.item(i).date, 
            description: data.rows.item(i).description,
            location_id: data.rows.item(i).location_id,
            votes_up: data.rows.item(i).votes_up,
            votes_down: data.rows.item(i).votes_down,
            comments: data.rows.item(i).comments,
            voted_up: data.rows.item(i).voted_up,
            voted_down: data.rows.item(i).voted_down,
            author: data.rows.item(i).name,
            author_pic : data.rows.item(i).profile_pic,
            location: data.rows.item(i).location_name,
            resourceSpaceId: data.rows.item(i).resourceSpaceId
          });
        }
      }
      return ideas;
    }, err => {
      console.log('Error: ', err);
      return [];
    });
  }

  getIdeaComments(idea) {
    let sql = "SELECT c.id, c.idea_id, c.date, c.description, a.name, a.profile_pic " +
              "FROM comments c " + 
              "JOIN author a on (c.author_id = a.id) " +
              "WHERE c.idea_id=?";
    
    return this.database.executeSql(sql, [idea.id]).then((data) => {
      let comments = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          comments.push({ 
            id: data.rows.item(i).id,
            idea_id: data.rows.item(i).idea_id,
            date: data.rows.item(i).date, 
            description: data.rows.item(i).description,
            author: data.rows.item(i).name,
            author_pic : data.rows.item(i).profile_pic,
            expanded: false
          });
        }
      }
      return comments;
    }, err => {
      console.log('Error: ', err);
      return [];
    });    
  }
 
  getIdea(id) {
    let sql = "SELECT i.id, i.idea_id, i.campaign_id, i.title, i.date, i.description, i.location_id, i.votes_up, i.votes_down, i.comments, i.voted_up, i.voted_down, i.resourceSpaceId, a.name, a.profile_pic " +
              "FROM idea i " + 
              "JOIN author a on (i.author_id = a.id) " +
              "WHERE i.idea_id=?;"
    return this.database.executeSql(sql, [id]).then((data) => {
      let ideas = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          ideas.push({ 
            id: data.rows.item(i).id,
            idea_id: data.rows.item(i).idea_id,
            campaign_id: data.rows.item(i).campaign_id,
            title: data.rows.item(i).title, 
            date: data.rows.item(i).date, 
            description: data.rows.item(i).description,
            location_id: data.rows.item(i).location_id,
            votes_up: data.rows.item(i).votes_up,
            votes_down: data.rows.item(i).votes_down,
            comments: data.rows.item(i).comments,
            voted_up: data.rows.item(i).voted_up,
            voted_down: data.rows.item(i).voted_down,
            author: data.rows.item(i).name,
            author_pic : data.rows.item(i).profile_pic,
            resourceSpaceId: data.rows.item(i).resourceSpaceId
          });
        }
      }
      return ideas[0];
    }, err => {
      console.log('Error: ', err);
      return {};
    });    
  }

  getCampaigns() {
    return this.database.executeSql("SELECT * FROM campaign ORDER BY name;", []).then((data) => {
      let campaigns = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          campaigns.push({ 
            id: data.rows.item(i).id,
            name: data.rows.item(i).name,
            hashtag: data.rows.item(i).hashtag,
            resourceSpaceId: data.rows.item(i).resourceSpaceId
          });
        }
      }
      return campaigns;
    }, err => {
      console.log('Error: ', err);
      return [];
    });        
  }

  getCampaign(id) {
    return this.database.executeSql("SELECT * FROM campaign WHERE id = ?;", [id]).then( (data) => {
      let campaigns = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          campaigns.push({ 
            id: data.rows.item(i).id,
            name: data.rows.item(i).name,
            hashtag: data.rows.item(i).hashtag,
            resourceSpaceId: data.rows.item(i).resourceSpaceId
          });
        }
      }
      return campaigns[0];
    }, err => {
      console.log('Error: ', err);
      return {};
    });        
  }

  getUsersLocation(author_id) {
    let sql = "SELECT * FROM users_locations WHERE author_id = ?;";
    
    return this.database.executeSql(sql, [author_id]).then( (data) => {
      let locations = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++){
          locations.push({
            location: data.rows.item(i).location,
            location_id: data.rows.item(i).location_id
          });
        }
      }
      return locations;
    }, err => {
      console.log('Error getting user locations: ', err);
      return [];
    }); 
  }

  voteUp(idea) {
    let votes = parseInt(idea.votes_up) + 1;
    let sql = "UPDATE idea SET votes_up=?, voted_up=1 WHERE id=?;";

    this.database.executeSql(sql, [votes, parseInt(idea.id)]); 
    return this.getIdea(idea.id);
  }

  deleteVoteUp(idea) {
    let votes = parseInt(idea.votes_up) - 1;
    let sql = "UPDATE idea SET votes_up=?, voted_up=0 WHERE id=?;";

    this.database.executeSql(sql, [votes, parseInt(idea.id)]); 
    return this.getIdea(idea.id);    
  }

  voteDown(idea) {
    let votes = parseInt(idea.votes_down) + 1;
    let sql = "UPDATE idea SET votes_down=?, voted_down=1 WHERE id=?;";

    this.database.executeSql(sql, [votes, parseInt(idea.id)]); 
    return this.getIdea(idea.id);
  }

  deleteVoteDown(idea) {
    let votes = parseInt(idea.votes_down) - 1;
    let sql = "UPDATE idea SET votes_down=?, voted_down=0 WHERE id=?;";

    this.database.executeSql(sql, [votes, parseInt(idea.id)]); 
    return this.getIdea(idea.id);    
  }

  createIdea(idea) {    
    let data = [parseInt(this.author_id), idea.date, parseInt(idea.campaign_id), parseInt(idea.location_id), idea.title, idea.description];
    let sql = "INSERT INTO idea (author_id, date, campaign_id, location_id, title, description, total_votes, votes_up, votes_down, comments, voted_up, voted_down) "+
              "VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0);";

    return this.database.executeSql(sql, data).then(data => {
      return data.insertId;
    }, err => {
      console.log('Error: ', err);
      return 0;
    });
  }

  createComment(comment, idea) {
    let date = this.getCurrentDate();
    let data = [date, idea.id, comment, parseInt(this.author_id)];
    let sql = "INSERT INTO comments (date, idea_id, description, author_id)" + 
              "VALUES (?, ?, ?, ?);"

    return this.database.executeSql(sql, data).then(data => {
      return data.insertId;
    }, err => {
      console.log('Error: ', err);
      return 0;
    });
  }

  updateCommentCounter(idea){
    let comments = parseInt(idea.comments) + 1;
    let sql = "UPDATE idea SET comments=? WHERE id=?;";

    return this.database.executeSql(sql, [comments, parseInt(idea.id)]).then(data => {
      return data;
    }, err => {
      console.log('Error: ', err);
      return false;
    });       
  }

  createUserLocation(user, author_id){
    this.database.executeSql("INSERT INTO users_locations (author_id, location, location_id) VALUES (?, 'CASA', ?);", [author_id, user.place_one]);
    this.database.executeSql("INSERT INTO users_locations (author_id, location, location_id) VALUES (?, 'TRABAJO', ?);", [author_id, user.place_two]);
    this.database.executeSql("INSERT INTO users_locations (author_id, location, location_id) VALUES (?, 'OTRO', ?);", [author_id, user.place_three]);

    return this.getAuthor(user.email);
  }

  createAuthor(user){
    let sql = "INSERT INTO author (name, email, session_key, profile_pic) VALUES(?, ?, ?, ?);"

    return this.database.executeSql(sql, [user.name, user.email, user.session_key, user.profile_pic]).then( data => {
        console.log("INSERT ID -> " , data.insertId);
        // this.storage.set('user_id', data.insertId);
        return this.createUserLocation(user, data.insertId);
      }, err => {
        console.error(err);
        return {};
      });
  }

  updateIdeaIdeaId (id, idea_id){
    let sql = "UPDATE idea set idea_id = ? WHERE id = ?;"

    return this.database.executeSql(sql, [idea_id, id]).then(data => {
      return id;
    }, err => {
      console.log('Error: ', err);
      return 0;
    });     
  }

  updateIdeaRSID(id, resourceSpaceId){
    let sql = "UPDATE idea set resourceSpaceId = ? WHERE id = ?;"
    
    return this.database.executeSql(sql, [resourceSpaceId, id]).then(data => {
      return id;
    }, err => {
      console.log('Error: ', err);
      return 0;
    });     
  }

  updateCommentRSID(id, resourceSpaceId){
    let sql = "UPDATE comments set resourceSpaceId = ? WHERE id = ?;"
    
    return this.database.executeSql(sql, [resourceSpaceId, id]).then(data => {
      return id;
    }, err => {
      console.log('Error: ', err);
      return 0;
    });     
  }

  getCurrentDate() {
    var now = new Date();
    var dateString = now.getFullYear() + '-' + ("0"+(now.getMonth()+1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2) + " " +
     ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2) + "." + ("0" + now.getMilliseconds()).slice(-2);

    return dateString;
  }
}