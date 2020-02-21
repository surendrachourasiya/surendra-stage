import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ShowsComponent } from './shows.component';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';

const artistRoutes: Routes = [];


@NgModule({
  declarations: [ShowsComponent],
  imports: [
    RouterModule.forRoot(artistRoutes),
    ScrollingModule,
    CommonModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class ShowsModule { }
