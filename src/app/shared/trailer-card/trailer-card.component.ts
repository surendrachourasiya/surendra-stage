import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../others/constants';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-trailer-card',
  templateUrl: './trailer-card.component.html',
  styleUrls: ['./trailer-card.component.scss']
})
export class TrailerCardComponent implements OnInit {

  public constantImg:any;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }
  
  constructor(private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() trailerDetailObj;
  @Input() trailerDetailS3Url;
  @Input() trailerDetailType;

  ngOnInit() {}

  onTrailerClick() {
    // Amplitude Code
    if(this.trailerDetailType == 'show') {
      this.amplitudeObj['ARTIST_ID'] = this.trailerDetailObj['id'];
      this.amplitudeObj['VIDEO_ID'] = this.trailerDetailObj['hlsSourceLink']
      this.amplitudeObj['VIDEO_DURATION'] = this.trailerDetailObj['duration'];
      this.apiService.getAmplitudeInstance('sdp_trailer_video_click', this.amplitudeObj);
    }
    if(this.trailerDetailType == 'colletion') { 
      this.apiService.getAmplitudeInstance('cdp_trailer_video_click', {'ARTIST_ID': this.trailerDetailObj['id'], 'ARTIST_NAME': this.trailerDetailObj['name'], 'VIDEO_ID': this.trailerDetailObj['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.trailerDetailObj['duration'])});
    }
  }

}
