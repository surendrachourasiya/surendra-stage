import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../../shared/others/constants';
import { ApiService } from './../../shared/others/api.service';

@Component({
  selector: 'app-artist-chip',
  templateUrl: './artist-chip.component.html',
  styleUrls: ['./artist-chip.component.scss']
})
export class ArtistChipComponent implements OnInit {

  public constantImg:any;

  constructor(private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() artistChipObj;
  @Input() artistChipS3Url;
  @Input() screenType;
  @Input() collection_show_detail;

  ngOnInit() {
    if(!this.artistChipObj['name'])
      this.artistChipObj['name']=this.artistChipObj['firstName']+' '+this.artistChipObj['lastName'];
  }

  // Amplitude Chip Code
  onChipPopup() {
    if(this.screenType == 'feature_artist') {
      this.apiService.getAmplitudeInstance('artiststory_profile_clk', {
        "ARTIST_ID" : this.artistChipObj['_id'], 
        "VIDEO_ID" : this.artistChipObj.story['hlsSourceLink'],
        "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.artistChipObj.story['duration']), 
        "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(this.artistChipObj['lapseTime']),
        "ARTIST_NAME" : this.artistChipObj['name'], 
        "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.artistChipObj.story['duration'], this.artistChipObj['lapseTime']),
      });
    }
    else if(this.screenType == 'consumption-card') {
      this.apiService.getAmplitudeInstance('artiststory_conn_profile', {
        'ARTIST_ID': this.artistChipObj['_id'],
        'ARTIST_NAME': this.artistChipObj['name'],
        'VIDEO_DURATION':  this.apiService.convertVideoTimeFormat(this.artistChipObj['story']['duration']),
        'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.artistChipObj['lapseTime']),
        'CONSUMED_PERCENT': this.apiService.consumedPercent(this.artistChipObj.story['duration'], this.artistChipObj['lapseTime'])
       });
    }
    else if(this.screenType == 'collection') {
      this.apiService.getAmplitudeInstance('cdp_artistchip_click', {
        'COLLECTION_ID': this.collection_show_detail['_id'], 
        'ARTIST_ID': this.artistChipObj['id'],
        'ARTIST_NAME': this.artistChipObj['name'],
        'COLLECTION_NAME': this.collection_show_detail['title']
      });
    }
    else if(this.screenType == 'individual-card') {
      this.apiService.getAmplitudeInstance('Icl_profile_click', {
        'ARTIST_ID': this.artistChipObj['id'],
        'ARTIST_NAME': this.artistChipObj['name'],
      });
    }
    else if(this.screenType == 'show') {
      // this.amplitudeShowArtistObj['VIDEO_CONSUMED'] = this.collection_show_detail['_id'];
      this.apiService.getAmplitudeInstance('sdp_chip_click', {
        'ARTIST_ID': this.artistChipObj['id'],
        'VIDEO_ID': this.collection_show_detail.selectedPeripheral['hlsSourceLink'],
        'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.collection_show_detail.selectedPeripheral['duration'])
      });
    }
  }

}
