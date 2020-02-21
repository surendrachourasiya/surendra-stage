import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { viewsNumberFormatter } from '../shared/others/views-number-formatter';
import { timeFormatter } from '../shared/others/time-formatter';

import { HomeComponent } from './home.component';
import { ListingComponent } from '../listing/listing.component';
//import { SharedComponent } from '../shared/shared.component';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';


import { FeaturedArtistComponent } from '../shared/featured-artist/featured-artist.component';
import { ExclusiveCardComponent } from '../shared/exclusive-card/exclusive-card.component';
import { ContinueWatchingCardComponent } from '../shared/continue-watching-card/continue-watching-card.component';
import { StageCollectionListComponent } from '../shared/stage-collection-list/stage-collection-list.component';
import { ArtistContentComponent } from '../shared/artist-content/artist-content.component';
import { IndividualCardComponent } from '../shared/individual-card/individual-card.component';


const homeRoutes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot(homeRoutes,
      {
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
    ScrollingModule,
    CommonModule,
    SharedModule,
    NgxSpinnerModule
  ],
  declarations: [ 
    HomeComponent,
    ListingComponent,
    FeaturedArtistComponent,
    ExclusiveCardComponent,
    ContinueWatchingCardComponent,
    StageCollectionListComponent,
    ArtistContentComponent,
    IndividualCardComponent
  ],
  exports: [
  ]

})
export class HomeModule { }
