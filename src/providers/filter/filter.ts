import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { DatabaseProvider } from "../database/database";
import 'rxjs/add/operator/map';

/*
  Generated class for the FilterProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class FilterProvider {

  items: any;
 
  constructor(public databaseProvider: DatabaseProvider) {
    // if (location)
    //   this.databaseProvider.getAllIdeas(location).then(data => {
    //     this.items = data;
    //   });
    // else
    // this.databaseProvider.getDatabaseState().subscribe(rdy => {
    //   if (rdy) {
    //     this.databaseProvider.getAllIdeas().then(data => {
    //       this.items = data;
    //     });
    //   }
    // });
  }

  filterItems(searchTerm: string){

    return this.items.filter((item) => {
        return item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });     

  }

}
