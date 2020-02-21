import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CollectionsComponent } from './collections.component';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
const artistRoutes: Routes = [];


@NgModule({
  declarations: [CollectionsComponent],
  imports: [
    RouterModule.forRoot(artistRoutes),
    ScrollingModule,
    CommonModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class CollectionsModule { }
