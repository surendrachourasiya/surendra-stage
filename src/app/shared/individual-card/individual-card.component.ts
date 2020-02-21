import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../others/constants';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-individual-card',
  templateUrl: './individual-card.component.html',
  styleUrls: ['./individual-card.component.scss']
})

export class IndividualCardComponent implements OnInit {
  public constantImg:any;
  passSingleArtistId = '';
  showArtistCardView:boolean = false;
  lang;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
    this.constantImg = Constants.image;
  }

  @Input() indvidualEpisodeObj;
  @Input() indvidualEpisodeS3Url;

  ngOnInit() {    
    this.lang = this.route.snapshot.data.lang;
  }

  //as per tushar ji. No need to optimise this right now. this function is duplicate in max component
  showArtistCard(artistData) {
    this.passSingleArtistId = artistData;
    this.showArtistCardView = !this.showArtistCardView;
    $('body').addClass('noscroll');
  }

  quickViewToggle(){
    this.showArtistCardView = false;
    $('body').removeClass('noscroll');
  }

  // Amplitude Code
  onIndivisualVideo(event) {
    if(event == 'play_btn') {
      this.amplitudeObj['ARTIST_ID'] = this.indvidualEpisodeObj.artistList[0]['id'];
      this.amplitudeObj['ARTIST_NAME'] = this.indvidualEpisodeObj.artistList[0]['name'];
      this.amplitudeObj['VIDEO_ID'] = this.indvidualEpisodeObj['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.indvidualEpisodeObj['duration']);
      this.apiService.getAmplitudeInstance('Icl_play', this.amplitudeObj);
    }
    if(event == 'profile_img') {
      this.amplitudeObj['ARTIST_ID'] = this.indvidualEpisodeObj.artistList[0]['id'];
      this.amplitudeObj['ARTIST_NAME'] = this.indvidualEpisodeObj.artistList[0]['name'];
      this.amplitudeObj['VIDEO_ID'] = this.indvidualEpisodeObj['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.indvidualEpisodeObj['duration']);
      this.apiService.getAmplitudeInstance('Icl_thumbnail_click', this.amplitudeObj);
    }
  }

  
}
