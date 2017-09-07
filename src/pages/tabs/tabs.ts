import { Component } from '@angular/core';

import { SuperTabsController } from 'ionic2-super-tabs';

import { LocationThreePage } from '../location-three/location-three';
import { LocationTwoPage } from '../location-two/location-two';
import { LocationOthersPage } from '../location-others/location-others';
import { ListPage } from '../list/list';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  public toggled: boolean;
  searchTerm = {term: ""};
  items: any;
  location: any;
  tab1Root = ListPage;
  tab2Root = LocationTwoPage;
  tab3Root = LocationThreePage;
  tab4Root = LocationOthersPage;

  constructor(private superTabsCtrl: SuperTabsController) {
    this.toggled = false;
  }

  toggleSearch() {
      this.toggled = this.toggled ? false : true;
  }
}
