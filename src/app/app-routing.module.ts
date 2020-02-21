import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Resolver } from './shared/others/resolver';


import { HomeComponent } from './home/home.component';
import { ArtistsComponent } from './artists/artists.component';
import { CollectionsComponent } from './collections/collections.component';
import { ShowsComponent } from './shows/shows.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { AuthComponent } from './auth/auth.component';
import { ArtistLandscapeComponent } from './artist-landscape/artist-landscape.component';
import { SettingsComponent } from './settings/settings.component';
import { ConsumptionComponent } from './consumption/consumption.component';
import { FeedConsumptionComponent } from './feed-consumption/feed-consumption.component';
import { SearchComponent } from './search/search.component';
import { FullConsumptionComponent } from './full-consumption/full-consumption.component';
 
const routes: Routes = [
  //{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, resolve: { lang: Resolver } },
  { path: 'search', component: SearchComponent, resolve: { lang: Resolver } },
  // { path: 'auth', component: AuthComponent,  resolve: { lang: Resolver }},
  { path: 'artist-list', component: ArtistsComponent, resolve: { lang: Resolver } },
  { path: 'show-list', component: ShowsComponent, resolve: { lang: Resolver } },
  { path: 'collection-list', component: CollectionsComponent, resolve: { lang: Resolver } },
  { path: 'show-details/:slug', component: ShowDetailsComponent,  resolve: { lang: Resolver } },
  { path: 'collection-details/:slug', component: CollectionDetailsComponent,  resolve: { lang: Resolver } },
  { path: 'auth', component: AuthComponent,  resolve: { lang: Resolver } },
  { path: 'artist-landscape/:slug', component: ArtistLandscapeComponent,  resolve: { lang: Resolver } },
  { path: 'settings', component: SettingsComponent,  resolve: { lang: Resolver } },
  { path: 'settings/:slug', component: SettingsComponent,  resolve: { lang: Resolver } },
  { path: 'consumption', component: ConsumptionComponent,  resolve: { lang: Resolver } },
  { path: 'feed-consumption', component: FeedConsumptionComponent, resolve: { lang: Resolver } },
  { path: 'full-consumption', component: FullConsumptionComponent,  resolve: { lang: Resolver } },
  { path: 'consumption', component: ConsumptionComponent,  resolve: { lang: Resolver } },
  { path: '', component: HomeComponent, resolve: { lang: Resolver } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
