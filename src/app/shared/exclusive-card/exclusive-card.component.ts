import { Component, OnInit, Input, HostListener, ViewChild, ElementRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';
import { ApiService } from './../../shared/others/api.service';
import { Constants } from '../others/constants';

declare var videojs: any;


@Component({
  selector: 'app-exclusive-card',
  templateUrl: './exclusive-card.component.html',
  styleUrls: ['./exclusive-card.component.scss']
})
export class ExclusiveCardComponent implements OnInit {

  public constantImg:any;
  
  constructor(private route: ActivatedRoute, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() exclusiveDetailObj;
  @Input() exclusiveDetailS3Url;
  @Input() exclusiveID;
  exploreShowText:string;
  isVideoPlay: boolean = false;
  videoJSplayer;
  posterPath:string;
  isHLSPlayed: boolean = true;
  isVideoplayed: boolean = false;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  @ViewChild('videoElement', {static: false}) videoElement: ElementRef;

  ngOnInit() {
    this.isHLSPlayed = environment.isHLSPlayed;
    this.exploreShowText = this.route.snapshot.data.lang.home.exclusiveSec.exploreShow;
    this.posterPath = this.exclusiveDetailS3Url.basePath + this.exclusiveDetailS3Url.showPath+this.constantImg.horizontalMedium+this.exclusiveDetailObj.thumbnail.horizontal.ratio1.sourceLink;
    var id = 'exclusive_player_'+this.exclusiveID;
    
    // initialising the video player and start with a default time out interval
    var timer = setTimeout(()=>{
      this.videoJSplayer = videojs(id, { "poster": this.posterPath });
      if (this.isHLSPlayed) {
        var video = this.exclusiveDetailS3Url.basePath + this.exclusiveDetailS3Url.showPath + '/HLS/' + this.exclusiveDetailObj.selectedPeripheral.hlsSourceLink;
      } else {
        var video = this.exclusiveDetailS3Url.basePath + this.exclusiveDetailS3Url.showPath + '/main-video/' + environment.videoBitRate +'/'+ this.exclusiveDetailObj.selectedPeripheral.sourceLink;
      }
      this.videoJSplayer.src(video);
      //this.videoJSplayer.pause(); 
      this.videoJSplayer.play(); 


      // volume change event
      this.videoJSplayer.on('volumechange', (data)=>{ 
        if(this.apiService.getMuteState() == true) {
          let artist_ids = this.exclusiveDetailObj['artistList'].map(artistId => artistId.id);
          let artist_name = this.exclusiveDetailObj['artistList'].map(artistName => artistName.name);
          this.apiService.getAmplitudeInstance('showintbuilder_unmute', {'SHOW_ID' : this.exclusiveDetailObj['_id'], 'SHOW_NAME' : this.exclusiveDetailObj['title'], 'ARTIST_IDs' : artist_ids, 'ARTIST_NAMEs' : artist_name, 'VIDEO_ID' : this.exclusiveDetailObj.selectedPeripheral['hlsSourceLink']});
        }
          this.apiService.setMuteState(this.videoJSplayer.muted());
      });

      // mute/unmute video on check
      this.muteUnmuteVideo(); 
      this.videoJSplayer.muted(true);
      clearTimeout(timer);
      this.videoJSplayer.play();

      this.videoJSplayer.on('ended', (data) => {
        this.videoJSplayer.play();
      });

    }, environment.autoPlayVideoDuration);
  }

  ngOnDestroy() {
    setTimeout(() => {
      if(!!this.videoJSplayer)
        this.videoJSplayer.dispose();
    }, environment.destroyTimeout)
  }

  // scroll event and check the video is in the viewport or not
  @HostListener("window:scroll", ['videoElement'])
  elementInViewport(elName) {
    var el = elName.nativeElement;
    
    // play or pause the video according to the viewport
    if (this.apiService.identifyPlayPauseEvent(el)){
      if (!this.isVideoPlay) {
        this.videoJSplayer.play();

        if (environment.deviceType == 'ios'){
          if (this.isVideoplayed) {
            this.muteUnmuteVideo();
          } else {
            this.videoJSplayer.muted(true);
          }
        }else{
          this.muteUnmuteVideo(); 
        }

        this.isVideoPlay = true;
        this.isVideoplayed = true;
      }
    } else{
      if (this.isVideoPlay){
        this.videoJSplayer.pause();
        this.isVideoPlay = false;
      }
    }
  }

  // check the mute state and update it
  muteUnmuteVideo(){
    let muteState= this.apiService.getMuteState();
    this.videoJSplayer.muted(muteState);
  }

  onButtonClick(tab) {
    // Amplitude Code
    let artist_ids = this.exclusiveDetailObj['artistList'].map(artistId => artistId.id);
    let artist_names = this.exclusiveDetailObj['artistList'].map(artistName => artistName.name);
    if(tab == 'play_btn') {
      this.amplitudeObj['SHOW_ID'] = this.exclusiveDetailObj['_id'];
      this.amplitudeObj['SHOW_NAME'] = this.exclusiveDetailObj['title'];
      this.amplitudeObj['ARTIST_IDs'] = artist_ids;
      this.amplitudeObj['ARTIST_NAMEs'] = artist_names;
      this.amplitudeObj['VIDEO_ID'] = this.exclusiveDetailObj.selectedPeripheral['hlsSourceLink'];
      this.apiService.getAmplitudeInstance('showintbuilder_explshow', this.amplitudeObj);
    }
    if(tab == 'play_thumbnail') {
      this.amplitudeObj['SHOW_ID'] = this.exclusiveDetailObj['_id'];
      this.amplitudeObj['SHOW_NAME'] = this.exclusiveDetailObj['title'];
      this.amplitudeObj['ARTIST_IDs'] = artist_ids;
      this.amplitudeObj['ARTIST_NAMEs'] = artist_names;
      this.amplitudeObj['VIDEO_ID'] = this.exclusiveDetailObj.selectedPeripheral['hlsSourceLink'];
      this.apiService.getAmplitudeInstance('showintbuilder_fullscreen', this.amplitudeObj);
    }
  }

}