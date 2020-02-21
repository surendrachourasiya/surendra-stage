import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionDetailsComponent } from './collection-details.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';

const collectionDetailRoute: Routes = [];

@NgModule({
  declarations: [CollectionDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(collectionDetailRoute),
    SharedModule,
    ScrollingModule,
    FontAwesomeModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CollectionDetailsModule { }
