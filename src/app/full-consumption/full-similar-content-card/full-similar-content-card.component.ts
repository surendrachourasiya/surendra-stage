import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Constants } from './../../shared/others/constants';
import { ApiService } from 'src/app/shared/others/api.service.js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-full-similar-content-card',
  templateUrl: './full-similar-content-card.component.html',
  // styleUrls: ['./full-similar-content-card.component.scss']
  styleUrls: ['../../shared/similar-content-card/similar-content-card.component.scss'],
})
export class FullSimilarContentCardComponent implements OnInit {

  
  @Input() artistContentObj;
  @Input() artistContentIndex;
  @Input() artistContentS3Url;
  @Input() contentType;
  @Input() activeContentIndex;

  @Output() selectedContent = new EventEmitter<number>();
  @Output() quickViewEnabled = new EventEmitter<{ show: boolean, id: string }>();

  @ViewChild('completeDivClick', {static: true}) completeDivClick:ElementRef; 
  @ViewChild('bannerDivClick', {static: true}) bannerDivClick:ElementRef; 

  contentObj={
    title:null,
    posterImage: null,
    viewCount:0,
    lapseTime:0,
    duration:0,
    progressTime:0,
    id:null,
    artist:{
      name:null,
      image:null,
      count:0
    }
  }
  isFullConsumptionScreen:boolean = false;

  public constantImg:any;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  constructor(private apiService: ApiService, private route: ActivatedRoute,) { 
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    if(this.contentType === 'collection')
    {
      this.contentObj={
        title: this.artistContentObj['data']['title'],
        posterImage: this.artistContentS3Url.basePath+this.artistContentS3Url.episodePath+ this.constantImg.horizontalSmall+this.artistContentObj['data'].thumbnail.horizontal.ratio1.sourceLink,
        viewCount: this.artistContentObj['data']['viewCount'],
        lapseTime: this.artistContentObj['data']['lapsedPercent']*this.artistContentObj['data']['duration']/100,
        duration: this.artistContentObj['data']['duration'],
        progressTime: this.artistContentObj['data']['lapsedPercent'],
        id: this.artistContentObj['data']['_id'],
        artist:{
          name: this.artistContentObj['data']['artistList'][0]['name'],
          image: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistSmall+this.artistContentObj['data']['artistList'][0]['profilePic'],
          count: this.artistContentObj['data']['artistList'].length
        }
      }
    }
    else if(this.contentType === 'show')
    {
      this.contentObj={
        title: this.artistContentObj['data']['title'],
        posterImage: this.artistContentS3Url.basePath+this.artistContentS3Url.episodePath+ this.constantImg.horizontalSmall+this.artistContentObj['data'].thumbnail.horizontal.ratio1.sourceLink,
        viewCount: this.artistContentObj['data']['viewCount'],
        lapseTime: this.artistContentObj['data']['lapsedPercent']*this.artistContentObj['data']['duration']/100,
        duration: this.artistContentObj['data']['duration'],
        progressTime: this.artistContentObj['data']['lapsedPercent'],
        id: this.artistContentObj['data']['_id'],
        artist:{
          name: this.artistContentObj['data']['artistList'][0]['name'],
          image: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistSmall+this.artistContentObj['data']['artistList'][0]['profilePic'],
          count: this.artistContentObj['data']['artistList'].length
        }
      }
    }

    // isFullConsumptionScreen to true if it is full 
    if(this.route.snapshot.routeConfig.path == 'full-consumption'){
      this.isFullConsumptionScreen = true;
    }
  }

  ngAfterViewInit(){
    // bind the click event as per the screen
    if(this.isFullConsumptionScreen)
      this.completeDivClick.nativeElement.addEventListener('click', this.__passSelectedContent); 
    else
      this.bannerDivClick.nativeElement.addEventListener('click', this.__passSelectedContent); 
  }

  passSelectedContent() { 
    this.selectedContent.emit(this.artistContentIndex);

    // trigger amplitude
    if(this.isFullConsumptionScreen) {
      // Amplitude Code
      this.amplitudeObj['ARTIST_ID'] == this.artistContentObj.data['_id'];
      this.amplitudeObj['VIDEO_ID'] = this.artistContentObj.data['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] =  this.apiService.convertVideoTimeFormat(this.artistContentObj.data['duration']);
      this.amplitudeObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.artistContentObj.data['lapsedPercent']);
      this.apiService.getAmplitudeInstance('cws_draw_video', this.amplitudeObj);
    }
    else {
      // Amplitude Code
      this.apiService.getAmplitudeInstance('cdp_similar_click', {'ARTIST_ID': this.artistContentObj.data.artistList[0]['id'], 'ARTIST_NAME': this.artistContentObj.data.artistList[0]['name'], 'CONTENT_ID': this.artistContentObj.data['_id']});
    } 
  }  

  __passSelectedContent = this.passSelectedContent.bind(this);


  quickViewToggle(value: boolean, id: string) {
    this.quickViewEnabled.emit({ show: value, id: id });
  } 

}
