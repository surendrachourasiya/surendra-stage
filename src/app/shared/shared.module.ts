import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SharedComponent } from '../shared/shared.component';
import { ArtistCardComponent } from '../shared/artist-card/artist-card.component';
import { StageCollectionCardComponent } from '../shared/stage-collection-card/stage-collection-card.component';
import { StageOriginalCardComponent } from '../shared/stage-original-card/stage-original-card.component';
import { ArtistChipComponent } from './artist-chip/artist-chip.component';
import { ArtistSmallCardComponent } from './artist-small-card/artist-small-card.component';
import { ArtistQuickViewComponent } from './artist-quick-view/artist-quick-view.component';
import { SeeAllBtnComponent } from './see-all-btn/see-all-btn.component';
import { DetailTopCardComponent } from './detail-top-card/detail-top-card.component';
import { TrailerCardComponent } from './trailer-card/trailer-card.component';
import { viewsNumberFormatter } from './others/views-number-formatter';
import { timeFormatter } from './others/time-formatter';
import { playBtnTextFormatter }  from './others/play-btn-text-formatter';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SeasonDropdownComponent } from './season-dropdown/season-dropdown.component';
import { ActionOverflowMenuComponent } from './action-overflow-menu/action-overflow-menu.component';
import { EpisodeCardComponent } from './episode-card/episode-card.component';
import { SimilarContentCardComponent } from './similar-content-card/similar-content-card.component';
import { QuickViewCardComponent } from './quick-view-card/quick-view-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConsumptionSettingsComponent } from '../consumption/consumption-settings/consumption-settings.component';
import { FullSimilarContentCardComponent } from '../full-consumption/full-similar-content-card/full-similar-content-card.component';
import { SvgIconsComponent } from './svg-icons/svg-icons.component';
import { ToastComponent } from './toast/toast.component';


const homeRoutes: Routes = [];

@NgModule({
    imports: [
        RouterModule.forRoot(homeRoutes),
        ScrollingModule,
        CommonModule,
        FontAwesomeModule
    ],
    declarations: [
        SharedComponent,
        ArtistCardComponent,
        ArtistSmallCardComponent,
        ArtistQuickViewComponent,
        StageCollectionCardComponent,
        StageOriginalCardComponent,
        ArtistChipComponent,
        SeeAllBtnComponent,
        DetailTopCardComponent,
        TrailerCardComponent,
        HeaderComponent,
        FooterComponent,
        SeasonDropdownComponent,
        ActionOverflowMenuComponent,
        EpisodeCardComponent,
        SimilarContentCardComponent,
        QuickViewCardComponent,
        viewsNumberFormatter,
        timeFormatter,
        playBtnTextFormatter,
        ConsumptionSettingsComponent,
        FullSimilarContentCardComponent,
        SvgIconsComponent,
        ToastComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        SharedComponent,
        ArtistCardComponent,
        ArtistSmallCardComponent,
        ArtistQuickViewComponent,
        StageCollectionCardComponent,
        StageOriginalCardComponent,
        ArtistChipComponent,
        SeeAllBtnComponent,
        DetailTopCardComponent,
        TrailerCardComponent,
        SeasonDropdownComponent,
        ActionOverflowMenuComponent,
        EpisodeCardComponent,
        SimilarContentCardComponent,
        QuickViewCardComponent,
        HeaderComponent,
        FooterComponent,
        viewsNumberFormatter,
        timeFormatter,
        playBtnTextFormatter,
        ConsumptionSettingsComponent,
        FullSimilarContentCardComponent,
        SvgIconsComponent,
        ToastComponent
    ],
})
export class SharedModule { }
