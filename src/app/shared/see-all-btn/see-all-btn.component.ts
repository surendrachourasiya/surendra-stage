import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-see-all-btn',
  templateUrl: './see-all-btn.component.html',
  styleUrls: ['./see-all-btn.component.scss']
})
export class SeeAllBtnComponent implements OnInit {

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  seeAllText;
  @Input() link;

  ngOnInit() {
    this.seeAllText = this.route.snapshot.data.lang.home.common.seeAll;
  }

  // Amplitude code
  onButtonClick() {
    if(this.link == 'artist-list'){ 
      this.apiService.getAmplitudeInstance('artistlist_seeall', {});
    }
    if(this.link == 'collection-list'){
      this.apiService.getAmplitudeInstance('collectionlist_seeall', {});
    }
    if(this.link == 'collection-detail-list'){
      this.apiService.getAmplitudeInstance('cdp_similarcol_seeall', {});
    }
    if(this.link == 'show-list'){
      this.apiService.getAmplitudeInstance('ss_seeall', {});
    }
  }

}
