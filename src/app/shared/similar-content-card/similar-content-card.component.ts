import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Constants } from '../others/constants';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/shared/others/api.service.js';

@Component({
  selector: 'app-similar-content-card',
  templateUrl: './similar-content-card.component.html',
  styleUrls: ['./similar-content-card.component.scss']
})

export class SimilarContentCardComponent implements OnInit {

  @Input() artistContentObj;
  @Input() artistContentIndex;
  @Input() artistContentS3Url;
  @Input() contentType;
  @Input() activeContentIndex;

  @Output() selectedContent = new EventEmitter<number>();
  @Output() quickViewEnabled = new EventEmitter<boolean>();

  contentObj={
    title:null,
    posterImage: null,
    viewCount:0,
    lapseTime:0,
    duration:0,
    progressTime:0,
    artist:{
      name:null,
      image:null,
      count:0
    }
  }

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  pageType:string=null;

  public constantImg:any;

  constructor(private router: Router, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    // set the type of page if it is consumption
    if(this.router.url.match('consumption'))
      this.pageType='consumption';

    if(this.contentType === 'artist')
    {
      this.contentObj={
        title: this.artistContentObj['data']['story']['title'],
        posterImage: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistLarge200+this.artistContentObj['data'].profilePic,
        viewCount: this.artistContentObj['data']['viewCount'],
        lapseTime: this.artistContentObj['data']['lapseTime'],
        duration: this.artistContentObj['data']['story']['duration'],
        progressTime: this.artistContentObj['data']['lapseTime']/this.artistContentObj['data']['story']['duration']*100,
        artist:{
          name: this.artistContentObj['data']['firstName'] +' '+ this.artistContentObj['data']['lastName'],
          image: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistSmall+this.artistContentObj['data']['profilePic'],
          count:0
        }
      }
    }
    else if(this.contentType === 'collectionPheripheral')
    {
      this.contentObj={
        title: this.artistContentObj['data']['title'],
        posterImage: this.artistContentS3Url.basePath+this.artistContentS3Url.collectionPath+ this.constantImg.horizontalSmall+this.artistContentObj['data'].thumbnail.horizontal.sourceLink,
        viewCount: this.artistContentObj['data']['viewCount'],
        lapseTime: !this.artistContentObj['data']['lapseTime']==false?0:this.artistContentObj['data']['lapseTime'],
        duration: this.artistContentObj['data']['duration'],
        progressTime: this.artistContentObj['data'].lapseTime/this.artistContentObj['data'].duration*100,
        artist:{
          name: this.artistContentObj['artistData'][0]['name'],
          image: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistSmall+this.artistContentObj['artistData'][0]['profilePic'],
          count: this.artistContentObj['artistData'].length
        }
      }
    }
    else if(this.contentType === 'showPheripheral')
    {
      this.contentObj={
        title: this.artistContentObj['data']['title'],
        posterImage: this.artistContentS3Url.basePath+this.artistContentS3Url.showPath+ this.constantImg.horizontalSmall+this.artistContentObj['data'].thumbnail.horizontal.sourceLink,
        viewCount: this.artistContentObj['data']['viewCount'],
        lapseTime: !this.artistContentObj['data']['lapseTime']==false?0:this.artistContentObj['data']['lapseTime'],
        duration: this.artistContentObj['data']['duration'],
        progressTime: this.artistContentObj['data'].lapseTime/this.artistContentObj['data'].duration*100,
        artist:{
          name: this.artistContentObj['artistData'][0]['name'],
          image: this.artistContentS3Url.basePath+this.artistContentS3Url.artistPath+ this.constantImg.artistSmall+this.artistContentObj['artistData'][0]['profilePic'],
          count: this.artistContentObj['artistData'].length
        }
      }
    }
   
  }

  passSelectedContent(value: number) {
    this.selectedContent.emit(value);
    if(this.contentType === 'artist'){
      // Amplitude Code
      this.amplitudeObj['ARTIST_ID'] = this.artistContentObj.data['_id'];
      this.amplitudeObj['ARTIST_NAME'] = this.artistContentObj.data['firstName'];
      this.amplitudeObj['VIDEO_ID'] = this.artistContentObj.data['story']['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] =  this.apiService.convertVideoTimeFormat(this.artistContentObj.data.story['duration']);
      this.amplitudeObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.artistContentObj.data['lapseTime']);
      this.amplitudeObj['CONSUMED_PERCENT'] = this.apiService.consumedPercent(this.artistContentObj.data.story['duration'], this.artistContentObj.data['lapseTime']),
      this.amplitudeObj['VIDEO_FULLSCREEN'] = 0;
      this.apiService.getAmplitudeInstance('artiststory_con_drawvideo', this.amplitudeObj);
    }

    if(this.contentType === 'showPheripheral'){
      let artist_ids = this.artistContentObj.artistData.map(artist => artist.id);
      let artist_names = this.artistContentObj.artistData.map(artist => artist.name);
      
      this.apiService.getAmplitudeInstance('showintbuilder_drawervideoclick', {'ARTIST_IDs': artist_ids, 'ARTIST_NAME': artist_names, 'SHOW_ID': this.artistContentObj.data['id'], 'SHOW_NAME': this.artistContentObj.data['title'], 'VIDEO_ID': this.artistContentObj.data['hlsSourceLink'], 'VIDEO_DURATION': this.artistContentObj.data['duration']});
    }
  }  

  quickViewToggle(value: boolean) {
    this.quickViewEnabled.emit(value);
  }  

}
