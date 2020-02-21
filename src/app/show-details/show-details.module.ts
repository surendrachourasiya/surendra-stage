import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowDetailsComponent } from './show-details.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const showDetailRoute: Routes = [];

@NgModule({
  declarations: [ShowDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(showDetailRoute),
    SharedModule,
    ScrollingModule,
    FontAwesomeModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShowDetailsModule { }
