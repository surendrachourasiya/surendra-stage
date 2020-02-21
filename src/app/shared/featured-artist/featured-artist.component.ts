import { Component, OnInit, Input, HostListener, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from './../../../environments/environment';
import { ApiService } from './../../shared/others/api.service';
import { Constants } from '../others/constants';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

declare let videojs: any; // just to avoid TS stuffs for this demo
@Component({
  selector: 'app-featured-artist',
  templateUrl: './featured-artist.component.html',
  styleUrls: ['./featured-artist.component.scss']
})

export class FeaturedArtistComponent implements OnInit {
  faPlay = faPlay;
  @Input() featuredArtistObj;
  @Input() featuredArtistS3Url;
  @Input() featuredArtistID;
  @ViewChild('featuredVideoElement', { static: false }) featuredVideoElement: ElementRef;

  @Output() activeFeatureArtist = new EventEmitter<number>();

  public constantImg: any;
  activeContentPrevious: {};

  passSingleArtistId = '';
  activeIndex: number;
  activeContent = {
    story: {
      title: '',
      hlsSourceLink: '',
      sourceLink: ''
    },
    slug: '',
    _id: ''
  };
  lang;
  video: string;
  myPlayer;
  isVideoPlay: boolean = false;
  showArtistCardView: boolean = false;
  isTabClickable = false;
  isHLSPlayed: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService) {
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    this.isHLSPlayed = environment.isHLSPlayed;
    this.lang = this.route.snapshot.data.lang;
    this.updateActiveArtistDetail(0, false);
  }

  ngOnDestroy() {
    setTimeout(() => {
      if (!!this.myPlayer)
        this.myPlayer.dispose();
    }, environment.destroyTimeout)
  }

  redirectToConsumption() {
    localStorage.setItem('featuredArtistActive', this.activeIndex.toString());

    if (!this.myPlayer.muted()) {
      let localObj = {
        'lapseTime': this.myPlayer.currentTime()
      }
      this.apiService.setWatchTimeInLocal(this.featuredArtistObj[this.activeIndex]['_id'], localObj, 'featuredArtist')
    }

    this.router.navigate(['consumption'], { queryParams: { type: 'artist' } });

    // Amplitude Code
    let playArtistConsObj = {
      "ARTIST_ID": this.activeContent['_id'], "ARTIST_NAME": this.activeContent['firstName'], "VIDEO_ID": this.activeContent.story['hlsSourceLink'],
      "VIDEO_DURATION": this.apiService.convertVideoTimeFormat(this.activeContent.story['duration']), "VIDEO_CONSUMED": this.apiService.convertVideoTimeFormat(this.activeContent['lapseTime']),
      "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.activeContent.story['duration'], this.activeContent['lapseTime']),
    };
    this.apiService.getAmplitudeInstance('artiststory_videotap', playArtistConsObj);
  }

  // update the active Aritist Detail
  updateActiveArtistDetail(index, isChanged) {
    var duration = environment.autoPlayVideoDuration;
    if (isChanged) {
      duration = 0;
    }
    var timer1 = setTimeout(() => {
      this.myPlayer = videojs('player_' + this.featuredArtistID);
      this.isTabClickable = false;
      if (isChanged) {
        this.myPlayer.pause();
      }
      this.activeContentPrevious = this.activeContent;

      this.activeIndex = index;
      this.activeContent = this.featuredArtistObj[index];
      this.activeContent['firstName'] = this.featuredArtistObj[index].firstName;
      this.activeContent['name'] = this.featuredArtistObj[index].firstName + ' ' + this.featuredArtistObj[index].lastName;
      this.activeFeatureArtist.emit(this.activeIndex);

      // Amplitude Code for toggle
      if (this.activeContent['_id'] != '') {
        let obj = {
          "PREV_VIDEO_ID": this.activeContentPrevious['story']['hlsSourceLink'],
          "PREV_VIDEO_DURATION": this.apiService.convertVideoTimeFormat(this.activeContentPrevious['story']['duration']),
          "PREV_VIDEO_CONSUMED": this.apiService.convertVideoTimeFormat(this.activeContent['lapseTime']),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.activeContent.story['duration'], this.activeContent['lapseTime']),
          "ARTIST_ID": this.activeContent['_id'],
          "ARTIST_NAME": this.activeContent['firstName'],
          "TOGGLE_POSITION_INDEX": this.activeIndex
        }
        // this.apiService.getAmplitudeInstance('artiststory_artist_tog_click', obj);
      }

      clearInterval(timer1);
      this.videoEvents(this.activeContent, index, duration, isChanged);
    }, duration);
  }

  videoEvents(activeContent, index, duration, isChanged) {
    var timer = setTimeout(() => {
      if (this.isHLSPlayed) {
        var video = this.featuredArtistS3Url.basePath + '/artist/HLS/' + activeContent.story.hlsSourceLink;
      } else {
        var video = this.featuredArtistS3Url.basePath + '/artist/main-video/' + environment.videoBitRate + '/' + activeContent.story.sourceLink;
      }

      if (!isChanged) {
        this.myPlayer.src(video);
        this.myPlayer.muted(true);
        this.myPlayer.pause();
      } else {
        var video1 = document.getElementById('player_' + this.featuredArtistID + '_html5_api');
        video1.setAttribute('src', video);
        this.muteUnmuteVideo();
        this.myPlayer.play();
      }

      this.isTabClickable = true;
      this.myPlayer.on('ended', (data) => {
        var currentIndex = index + 1;
        if (index == 4) {
          currentIndex = 0;
        }
        this.updateActiveArtistDetail(currentIndex, true);
      });

      this.myPlayer.on('volumechange', (data) => {
        // Amplitude code for mute and unmute
          this.apiService.getAmplitudeInstance(this.myPlayer.muted() == true? 'artiststory_mute': 'artiststory_unmute', { 'ARTIST_ID': this.activeContent['_id'], 'ARTIST_NAME': this.activeContent['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.activeContent['story']['duration']), 'VIDEO_ID': this.activeContent['story']['hlsSourceLink'], 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.activeContent['lapseTime']), "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.activeContent.story['duration'], this.activeContent['lapseTime']) });
        this.apiService.setMuteState(this.myPlayer.muted());
      });

      // mute/unmute video on check
      //this.muteUnmuteVideo();
      clearTimeout(timer);
      this.isVideoPlay = true;
    }, duration);
  }

  // check the mute state and update it
  muteUnmuteVideo() {
    let muteState = this.apiService.getMuteState();
    this.myPlayer.muted(muteState);
  }

  // scroll event and check the video is in the viewport or not
  @HostListener("window:scroll", ['featuredVideoElement'])
  elementInViewport(elName) {
    var el = elName.nativeElement;
    // console.log(this.isVideoPlay)
    // play or pause the video according to the viewport
    if (this.apiService.identifyPlayPauseEvent(el)) {
      if (!this.isVideoPlay) {
        this.myPlayer.play();
        this.muteUnmuteVideo();
        this.isVideoPlay = true;
      }
    } else {
      if (this.isVideoPlay) {
        this.myPlayer.pause();
        this.isVideoPlay = false;
      }
    }
  }

  showArtistCard(artistData) {
    this.passSingleArtistId = artistData._id;
    this.showArtistCardView = !this.showArtistCardView;
    this.myPlayer.pause();
    $('body').addClass('noscroll');
  }

  quickViewToggle() {
    this.showArtistCardView = false;
    this.myPlayer.play();
    $('body').removeClass('noscroll');
  }

  // Amplitude Code
  playFeatureArtist(obj) {
    let playArtistObj = {
      "ARTIST_ID": obj['_id'], "VIDEO_ID": obj.story['hlsSourceLink'],
      "VIDEO_DURATION": this.apiService.convertVideoTimeFormat(obj.story['duration']), "VIDEO_CONSUMED": this.apiService.convertVideoTimeFormat(obj['lapseTime']),
      "ARTIST_NAME": obj['firstName'], "CONSUMED_PERCENT" : this.apiService.consumedPercent(obj.story['duration'], obj['lapseTime']),
    };

    this.apiService.getAmplitudeInstance('artiststory_showartist', playArtistObj);
  }

}
