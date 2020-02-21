import { Component, OnInit, Input, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { Constants } from '../others/constants';
import { ApiService } from './../../shared/others/api.service';

@Component({
  selector: 'app-artist-content',
  templateUrl: './artist-content.component.html',
  styleUrls: ['./artist-content.component.scss']
})
export class ArtistContentComponent implements OnInit {

  public constantImg:any;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }
  
  constructor( private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() contentByArtistObj;
  @Input() contentByArtistS3Url;
  @Output() activeArtistContent = new EventEmitter<number>();

  activeIndex:number;
  activeContent=[];
  artistSlug = '';
  ngOnInit() {
    //this.updateActiveArtistDetail(0);
    this.activeContent = this.contentByArtistObj['episodeList'];
  }

  // update the active Aritist Detail
  updateActiveArtistDetail(index){
    this.activeIndex = index;
    this.activeContent = this.contentByArtistObj[index]['artistContent'];
    this.artistSlug = this.contentByArtistObj[index]['slug'];
    this.activeArtistContent.emit(this.activeIndex ); 
  }

  // Amplitude Code
  switchTab(item, index) {
    this.apiService.getAmplitudeInstance('acs_artist_click', {'ARTIST_ID': item['_id'], 'ARTIST_NAME': item['firstName'], 'ARTIST_TOGGLE_INDEX': index});
  }

  onArtistClick(item, index) {
    this.apiService.getAmplitudeInstance('acs_tile_click', {'ARTIST_ID': item['id'], 'ARTIST_NAME':  item['title'], 'VIDEO_ID': item['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(item['duration']), 'TILE_ID': index});
  }

}
