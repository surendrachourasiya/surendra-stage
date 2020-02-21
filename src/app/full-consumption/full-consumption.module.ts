import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullConsumptionComponent } from './full-consumption.component';
import { FullConsumptionPlaylistDrawerComponent } from './full-consumption-playlist-drawer/full-consumption-playlist-drawer.component';
import { FullConsumptionCardComponent } from './full-consumption-card/full-consumption-card.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [FullConsumptionComponent, FullConsumptionPlaylistDrawerComponent, FullConsumptionCardComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: FullConsumptionComponent }]),
    CommonModule,
    SharedModule,
    FormsModule,
    FontAwesomeModule
  ]
})
export class FullConsumptionModule { }
