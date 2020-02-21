import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: SearchComponent }]),
    CommonModule,
    SharedModule,
    FormsModule,
    ScrollingModule,
    FontAwesomeModule,
    NgxSpinnerModule
  ]
})
export class SearchModule { }
