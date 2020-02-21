import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedConsumptionComponent } from './feed-consumption.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild([{ path: '', component: FeedConsumptionComponent }]),
        CommonModule,
        SharedModule,
        FormsModule,
        FontAwesomeModule
    ]
})
export class FeedConsumptionModule { }
