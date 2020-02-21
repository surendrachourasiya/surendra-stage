

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsumptionComponent } from './consumption.component';
import { ConsumptionCardComponent } from './consumption-card/consumption-card.component';
import { ConsumptionPlaylistDrawerComponent } from './consumption-playlist-drawer/consumption-playlist-drawer.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ConsumptionComponent, ConsumptionCardComponent, ConsumptionPlaylistDrawerComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: ConsumptionComponent }]),
    CommonModule,
    SharedModule,
    FormsModule,
    FontAwesomeModule
  ]
})
export class ConsumptionModule { }
