import * as Hammer from 'hammerjs';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {
  NgModule, Injectable, Injector, InjectionToken, ErrorHandler } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { CookieService } from 'ngx-cookie-service';
import { Resolver } from './shared/others/resolver';
import { AppComponent } from './app.component';
import { InterceptorService } from './shared/others/interceptor.service';

// Created Modules
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { ArtistsModule } from './artists/artists.module';
import { CollectionsModule } from './collections/collections.module';
import { ShowsModule } from './shows/shows.module';
import { ShowDetailsModule } from './show-details/show-details.module';
import { CollectionDetailsModule } from './collection-details/collection-details.module';
import { ConsumptionModule } from './consumption/consumption.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';

// Library modules
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArtistLandscapeModule } from './artist-landscape/artist-landscape.module';
import { SettingsModule } from './settings/settings.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FeedConsumptionComponent } from './feed-consumption/feed-consumption.component';
import { CountdownModule } from 'ngx-countdown';

import { FullConsumptionModule } from './full-consumption/full-consumption.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AtatusErrorHandler } from './atatus.handler';

// hammer js config
@Injectable({
  providedIn: 'root'
})
export class HammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL }
  } as any;
}


@Injectable()

@NgModule({
  declarations: [
    AppComponent,
    FeedConsumptionComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
    SharedModule,
    ArtistsModule,
    ArtistLandscapeModule,
    SearchModule,
    AuthModule,
    CollectionsModule,
    ShowsModule,
    ShowDetailsModule,
    CollectionDetailsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    FontAwesomeModule,
    ConsumptionModule,
    CountdownModule,
    FullConsumptionModule,
    NgxSpinnerModule,

  ],
  providers: [
    CookieService,
    Resolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
    { provide: ErrorHandler, useClass: AtatusErrorHandler }  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
