import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistLandscapeComponent } from './artist-landscape.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [ArtistLandscapeComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: ArtistLandscapeComponent }]),
    CommonModule,
    SharedModule,
    FormsModule,
    ScrollingModule,
    FontAwesomeModule,
    NgxSpinnerModule
  ]
})
export class ArtistLandscapeModule { }
