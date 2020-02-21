import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../others/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-continue-watching-card',
  templateUrl: './continue-watching-card.component.html',
  styleUrls: ['./continue-watching-card.component.scss']
})
export class ContinueWatchingCardComponent implements OnInit {

  public constantImg:any;
  
  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() continueWatchingObj;
  @Input() continueWatchingS3Url;

  totalVideoTime:string='';
  type = '';

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  ngOnInit() {
    this.totalVideoTime = this.convertVideoTimeFormat(this.continueWatchingObj.duration);
  }

  convertVideoTimeFormat(totalSeconds){
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    if(hours > 0)
      return hours+':'+minutes+':'+seconds;

    return minutes+':'+seconds;
  }

  redirectToConsumption(){
    // Amplitude Code
    // let video_duration = this.convertVideoTimeFormat(this.continueWatchingObj['duration'])
    // let consume_video_duration = this.convertVideoTimeFormat(this.continueWatchingObj['lapsedPercent'])
    // this.amplitudeObj['VIDEO_ID'] = this.continueWatchingObj['hlsSourceLink'];
    // this.amplitudeObj['VIDEO_DURATION'] = video_duration;
    // this.amplitudeObj['VIDEO_CONSUMED'] = consume_video_duration;
    // this.apiService.getAmplitudeInstance('cw_play', this.amplitudeObj);

    if(!!this.continueWatchingObj['seasonId'])
      this.router.navigate(['full-consumption'], { queryParams: {type: 'show', 'slug': this.continueWatchingObj['showSlug'], 'seasonSlug': this.continueWatchingObj['seasonSlug'], 'episodeSlug': this.continueWatchingObj['slug']} });
    else
      this.router.navigate(['full-consumption'], { queryParams: {type: 'collection', 'slug': this.continueWatchingObj['collectionSlug'], 'detailSlug': this.continueWatchingObj['slug']} });
  }

}
