import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ArtistsComponent } from './artists.component';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
const artistRoutes: Routes = [];


@NgModule({
  declarations: [ArtistsComponent],
  imports: [
    RouterModule.forRoot(artistRoutes,
    // {
    //   scrollPositionRestoration: 'enabled',
    //   anchorScrolling: 'enabled'
    // }
    ),
    ScrollingModule,
    CommonModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class ArtistsModule { }
