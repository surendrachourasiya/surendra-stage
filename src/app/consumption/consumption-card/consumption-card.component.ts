import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  HostListener,
  ViewEncapsulation
} from '@angular/core';
import {
  faEllipsisV, faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faCog,
  faRedo,
  faTimesCircle,
  faCaretRight,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import { Constants } from 'src/app/shared/others/constants.js';
import { ApiService } from 'src/app/shared/others/api.service.js';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';


declare var videojs: any;

@Component({
  selector: 'app-consumption-card',
  templateUrl: './consumption-card.component.html',
  styleUrls: ['./consumption-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConsumptionCardComponent implements OnInit, AfterViewInit, OnDestroy {

  faEllipsisV = faEllipsisV;
  faPlay = faPlay;
  faPause = faPause;
  faStepForward = faStepForward;
  faStepBackward = faStepBackward;
  faCog = faCog;
  faRedo = faRedo;
  faTimesCircle = faTimesCircle;
  faCaretRight = faCaretRight;
  faChevronRight = faChevronRight;
  isPlay = true;
  isReplay = false;
  timeLeft = 5;
  interval;
  isHLSPlayed: boolean = true;

  private videoJSplayer: any=null;
  private videoQualityLevels:any =null;
  showOverlay = false;
  issettingsDrawerVisible = false;
  nextOverlayVisible: boolean = false;
  controlOverlayVisible: boolean = false;
  showVideoContainer: boolean = true;
  showArtistCardView: boolean = false;
  actionBottomVisible: boolean = false;
  isSettingEnable:boolean = false;
  openPlaylistDrawer:boolean = false;

  activeArtistIndex: number = null;
  previousURL = '';
  public constantImg:any;
  lang;
  screen_type = 'consumption-card';
  sharedUrl:string=null;

  selectedVideoQuality={
    name:'auto',
    value: null
  };

  featuredList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    moreArtist: []
  }

  activeContent = {
    story: {
      title: '',
      hlsSourceLink: ''
    },
    slug: ''
  };

  commonDetail={
    screenType:null,
    slug:null,
    detailSlug:null,
    detailId:null,
    before:null,
  }

  collectionPheripheralDetails = {
    s3Url: null,
    detail: [],
    episodeList: [],
    seasonList: [],
    lastSeenDetail: [],
    isDataLoaded: false
  }

  // amplitude code
  commonData = {}

  amplitudeObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  amplitudeNextObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  amplitudeToggleCloseObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  amplitudeObjWithVideoId = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  constructor(private router: Router, private route: ActivatedRoute, private elementRef: ElementRef, private apiService: ApiService) {
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    this.isHLSPlayed = environment.isHLSPlayed;
    this.lang = this.route.snapshot.data.lang;
    this.previousURL = this.apiService.getPreviousUrl();

    this.route.queryParams.subscribe(params => {
      this.commonDetail.screenType = params['type'];
      this.commonDetail.slug = params['slug'];
      this.commonDetail.detailSlug = params['detailSlug'];
      this.commonDetail.detailId = params['detailId'];
      this.commonDetail.before = params['before'];
    });

    this.apiService.openSharedPopup.subscribe(show => {
      this.actionBottomVisible = show;
    });
  }

  ngAfterViewInit() {
    if(this.commonDetail.screenType=='artist')
    {
      if(!!this.commonDetail.slug)
        this.getArtistIndividualDetail()
      else
        this.getFeaturedArtistList();
    }
    else if (this.commonDetail.screenType == 'collectionPheripheral') {
      this.getCollecitonDetails();
    }
    else if (this.commonDetail.screenType == 'showPheripheral') {
      this.getShowDetails();
    }

    // add event listner on video change
    this.elementRef.nativeElement.querySelector('video')
      .addEventListener('timeupdate', this.shownextOverlay.bind(this));
  }

  // on destroy dom
  ngOnDestroy() {
    if (!!this.videoJSplayer) {
      this.exitContentConsumption(this.activeArtistIndex);
      setTimeout(() => {
        this.videoJSplayer.dispose();
      }, environment.destroyTimeout)
    }
  }

  actionBottomShift(value: boolean) {
    this.actionBottomVisible = value;

    this.playPauseVideoOnBottomShift(value);
    this.sharedUrl= this.generateSharedUrl;
  }

  // video controls 
  showControls() {
    this.controlOverlayVisible = true;
    setTimeout(() => {
      this.controlOverlayVisible = !this.controlOverlayVisible;
    }, 3000);
  }

  // play pause video item on open and close video item
  openCloseDrawer(event:boolean){
    if(event){
      this.pauseVideoItem();
      this.openPlaylistDrawer=true;
    } else {
      this.playVideoItem();
      this.openPlaylistDrawer=false;
    }
  }
  
  // change the video and play from the lapse time available
  changeSelectedVideo(event: number) {
    this.pauseTimer();
    // lapse time update of current
    this.exitContentConsumption(this.activeArtistIndex);

    this.activeArtistIndex = event;
    this.showVideoContainer = true;
    this.isReplay = false;
    this.videoJSplayer.playlist.currentItem(event);

    this.playVideoItem();

    this.openCloseDrawer(false);

    // set the selected quality level if not set it to auto
    if(this.isHLSPlayed)
    {
      this.videoQualityChange(this.selectedVideoQuality, false);
      this.videoQualityLevels=this.videoJSplayer.qualityLevels();
    }
    
    // update view count of new selected video
    this.updateViewCount(this.activeArtistIndex);

    if (this.commonDetail.screenType != 'artist')
      this.videoJSplayer.currentTime(this.collectionPheripheralDetails.detail[this.activeArtistIndex]['lapseTime'])
  }

  // video initialisation
  initVideoJs() {
    this.videoJSplayer = videojs('consumption_player');
    this.videoJSplayer.playlist([]);

    // form the playlist as per the check
    this.formPlayList();

    this.videoJSplayer.on('volumechange', (data) => {
      this.apiService.setMuteState(this.videoJSplayer.muted());
    });

    this.videoJSplayer.on("seeking", (e) => {
      if(this.videoJSplayer.paused())
        this.pauseVideoItem();
      else
        this.playVideoItem();

      if(this.commonDetail.screenType == 'artist'){ 
        this.apiService.getAmplitudeInstance('artiststory_con_progress', { 'ARTIST_ID': this.featuredList.data[this.activeArtistIndex]['_id'], 'ARTIST_NAME': this.featuredList.data[this.activeArtistIndex]['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['story']['duration']), 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['lapseTime']), "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.featuredList.data[this.activeArtistIndex]['story']['duration'], this.featuredList.data[this.activeArtistIndex]['lapseTime']) });
      } else if(this.commonDetail.screenType == 'showPheripheral') {
        let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_seeking_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_progressclick', showstory_seeking_obj);
      }
    });

    this.videoJSplayer.on('fullscreenchange', (e) => {
      // do stuff...
      if(this.commonDetail.screenType == 'artist'){
        this.apiService.getAmplitudeInstance('artiststory_con_fullscreen', { 'ARTIST_ID': this.featuredList.data[this.activeArtistIndex]['_id'], 'ARTIST_NAME': this.featuredList.data[this.activeArtistIndex]['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['story']['duration']), 'VIDEO_ID': this.featuredList.data[this.activeArtistIndex]['story']['hlsSourceLink'], 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['lapseTime']), "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.featuredList.data[this.activeArtistIndex]['story']['duration'], this.featuredList.data[this.activeArtistIndex]['lapseTime']) });
      } else if(this.commonDetail.screenType == 'showPheripheral'){
        let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_fullscreen_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_con_fullscreen', showstory_fullscreen_obj);
      }
    });

    this.videoJSplayer.on('ended', () => {
      this.videoTimerEvent();
    });

    let muteState = this.apiService.getMuteState();

    // if video is mute than start playing from where left
    if(this.commonDetail.screenType=='artist')
    {
      if(this.featuredList.data.length > 1)
      {
        let activeItem = localStorage.getItem('featuredArtistActive');
        this.activeArtistIndex = !!activeItem==true? parseInt(activeItem) : 0;
      }
      
      if(!muteState)
      {
        // set current time
        let watchTime =this.apiService.getWatchTimeInLocal();
          
        if(watchTime)
          this.videoJSplayer.currentTime(watchTime['featuredArtist'][this.featuredList.data[this.activeArtistIndex]['_id']]['lapseTime'])
      }
    }

    this.videoJSplayer.muted(false);
    this.apiService.setMuteState(this.videoJSplayer.muted());

    // get the qulaity levels for the hls video
    if(this.isHLSPlayed)
    {
      setTimeout(()=>{
        this.videoQualityLevels=this.videoJSplayer.qualityLevels();
      },1000)
    }    
    
    this.changeSelectedVideo(this.activeArtistIndex);
  }

  // change the video quality selected from the menu
  videoQualityChange(event, showToast){
    // hide the setting icon if not getting the levels
    this.enableSettingIcons();

    if(this.isHLSPlayed)
    {
      if(this.isSettingEnable)
      {
        switch (event.value) {
          case 360:
              this.videoQualityLevels.selectedIndex_=0;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: 0 });
              break;
          
          case 480:
              this.videoQualityLevels.selectedIndex_=1;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: 1 });
              break;
          
          case 720:
              this.videoQualityLevels.selectedIndex_=2;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: 2 });
              break;
          
          case 1080:
              this.videoQualityLevels.selectedIndex_=3;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: 3 });
              break;
  
          case 240:
              this.videoQualityLevels.selectedIndex_=4;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: 4 });
              break;
          
          default:
              this.videoQualityLevels.selectedIndex_=-1;
              this.videoQualityLevels.trigger({ type: 'change', selectedIndex: -1 });
        }
  
        // enable/disable the quality level values
        for(var i=0; i<this.videoQualityLevels.levels_.length; i++)
        {
          if(this.videoQualityLevels.selectedIndex == -1)
            this.videoQualityLevels[i].enabled = true;
          else if(this.videoQualityLevels.selectedIndex == i)
            this.videoQualityLevels[i].enabled = true;
          else
            this.videoQualityLevels[i].enabled = false;
        }
      }
    }
    else
    {
      this.changeMP4VideoUrl(!!event.value==true?event.value:environment.videoBitRate);
    }

    // toast for video quality change
    if(showToast)
      this.apiService.showHideSnackbar({'status': true, 'type':'smToast', 'msg': !!event.value==true?(event.value+' '+this.lang['home']['common']['px']+' '+this.lang['home']['common']['videoSingularCapitalize']):(this.lang['settingDrawer']['auto']+' '+this.lang['home']['common']['videoSingularCapitalize']) ,'actionText': null, 'autoHide': true});
    
    this.closeSettingDrawer();
  }

  // change the video source of MP4 video 
  changeMP4VideoUrl(newBitRate){

    let videoSrc=this.videoJSplayer.playlist();
    let currentTime = this.videoJSplayer.currentTime();
    let url = this.videoJSplayer.currentSrc();

    url = url.split("/");
    url[url.length-2] = newBitRate;
    url=url.join('/');

    // update the video source 
    videoSrc[this.activeArtistIndex]['sources'][0]['src'] = url;
    this.videoJSplayer.playlist(videoSrc);
    this.videoJSplayer.playlist.currentItem(this.activeArtistIndex);

    if(currentTime>0)
    {
      setTimeout(() => {
        this.videoJSplayer.currentTime(currentTime);
      },500);
    }
   
  }

  // event on video end (next in 5 overlay or other condition for next video)
  videoTimerEvent() {
    this.videoJSplayer.pause();

    if (this.commonDetail.screenType == 'artist' && this.activeArtistIndex === this.featuredList.data.length - 1) {
      this.showVideoContainer = false;
    }
    else if (this.commonDetail.screenType != 'artist' && this.activeArtistIndex === this.collectionPheripheralDetails.detail['mediaList'].length - 1) {
      this.changeSelectedVideo(0);
    }
    else {
      // start interval of 5 second
      this.timeLeft = 6;

      this.interval = setInterval(() => {
        if (this.timeLeft <= 6) {
          this.timeLeft--;
          this.isReplay = true;
          this.nextOverlayVisible = true;
          this.controlOverlayVisible = true;

          // play next video on timer end
          if (this.timeLeft <= 0) {
            this.nextOverlayVisible = false;
            this.isReplay = false;

            this.nextVideoItem();
          }
        }
        else {
          this.nextOverlayVisible = false;
          this.isReplay = false;
          this.pauseTimer();
        }
      }, 1000)
    }
  }

  // form the playlist
  formPlayList() {
    let videoSrc = [];

    if (this.commonDetail.screenType === 'artist') {
      this.featuredList.data.forEach(item => {
        if (this.isHLSPlayed) {
          videoSrc.push({
            sources: [
              {
                src: this.featuredList.s3Url.basePath + '/artist/HLS/' + item['story']['hlsSourceLink'],
                type: 'application/x-mpegURL'
              }
            ],
            poster: this.featuredList.s3Url.basePath + this.featuredList.s3Url.artistPath + '/' + item['profilePic']
          });
        } else {
          videoSrc.push({
            sources: [
              {
                src: this.featuredList.s3Url.basePath + '/artist/main-video/' + environment.videoBitRate + '/' + item['story']['sourceLink'],
                type: 'video/mp4'
              }
            ],
            poster: this.featuredList.s3Url.basePath + this.featuredList.s3Url.artistPath + '/' + item['profilePic']
          });
        }

      });
    }
    else if (this.commonDetail.screenType === 'collectionPheripheral') {
      this.collectionPheripheralDetails.detail['mediaList'].forEach(item => {
        if (this.isHLSPlayed) {
          videoSrc.push({
            sources: [
              {
                src: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.collectionPath + this.constantImg.hls + item.hlsSourceLink,
                type: 'application/x-mpegURL'
              }
            ],
            poster: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.collectionPath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['sourceLink'],
          });
        } else {
          videoSrc.push({
            sources: [
              {
                src: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.collectionPath + '/main-video/' + environment.videoBitRate + '/' + item.sourceLink,
                type: 'video/mp4'
              }
            ],
            poster: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.collectionPath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['sourceLink'],
          });
        }

      });

    }
    else if (this.commonDetail.screenType === 'showPheripheral') {
      this.collectionPheripheralDetails.detail['mediaList'].forEach(item => {
        if (this.isHLSPlayed) {
          videoSrc.push({
            sources: [
              {
                src: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.showPath + this.constantImg.hls + item.hlsSourceLink,
                type: 'application/x-mpegURL'
              }
            ],
            poster: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.showPath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['sourceLink'],
          });
        } else {
          videoSrc.push({
            sources: [
              {
                src: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.showPath + '/main-video/' + environment.videoBitRate + '/' + item.sourceLink,
                type: 'video/mp4'
              }
            ],
            poster: this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.showPath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['sourceLink'],
          });
        }

      });
    }

    this.videoJSplayer.playlist(videoSrc);
  }

  // check the current state of player and take action of play or pause respectively
  playPauseVideoItem() {
    if (this.videoJSplayer.paused()) {
      this.playVideoItem();
      
      // if(this.previousURL == '/'){
      //   // Amplitude Code
      //   this.amplitudeObj['ARTIST_ID'] = this.commonData['_id'];
      //   // this.amplitudeObj['VIDEO_ID'] = this.commonData['story']['hlsSourceLink'];
      //   this.amplitudeObj['VIDEO_DURATION'] =  this.apiService.convertVideoTimeFormat(this.commonData['story']['duration']);
      //   this.amplitudeObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.commonData['lapseTime']);
      //   this.apiService.getAmplitudeInstance('artiststory_con_videopause', this.amplitudeObj);
      // }
    } else {
      this.pauseVideoItem();

      if (this.previousURL == '/' && this.commonDetail.screenType == 'artist') {
        // Amplitude Code
        let artiststory_pause_obj = {
          "ARTIST_ID" : this.commonData['_id'], "ARTIST_NAME" : this.commonData['firstName'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.commonData['story']['duration']),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(this.commonData['lapseTime']),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.commonData['story']['duration'], this.commonData['lapseTime'])
        }
        this.apiService.getAmplitudeInstance('artiststory_con_videopause', artiststory_pause_obj);
      } else if((this.previousURL.includes('show-details') && this.commonDetail.screenType == 'showPheripheral') || (this.previousURL == '/' && this.commonDetail.screenType == 'showPheripheral')) {
        let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_pause_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_pause', showstory_pause_obj);
      }
    }
  }

  playVideoItem(){
    this.videoJSplayer.play();
    this.isPlay = true;
  }

  pauseVideoItem(){
    this.videoJSplayer.pause();
    this.isPlay = false;
  }

  // play/pause video in background on opening/closing of bottom shift
  playPauseVideoOnBottomShift(value: boolean) {
    if (!value) {
      this.playVideoItem()
    } else {
      this.pauseVideoItem();
    }
  }

  calculateLapseTime(index) {
    return this.collectionPheripheralDetails.detail['mediaList'][index]['lapsedPercent'] * 50 / 100;
  }

  // enable the setting icon 
  enableSettingIcons(){
    if(this.isHLSPlayed)
    {
      this.videoQualityLevels=this.videoJSplayer.qualityLevels();
      if(this.videoQualityLevels.levels_.length > 0)
        this.isSettingEnable=true;
      else
        this.isSettingEnable=false;
    }
    else
      this.isSettingEnable=true;
  }

  // Perform operation on video time changes
  shownextOverlay() {
    this.nextOverlayVisible = false;
    this.isReplay = false;

    // hide the setting icon if not getting the levels
    this.enableSettingIcons();
    
    // show overlay in last 5 second of video
    let videoRemainingTime = Math.ceil(this.videoJSplayer.duration() - this.videoJSplayer.currentTime())
    // if (videoRemainingTime <= 5) {}

    // push the data into the localstorage after every 10 seconds
    if (this.commonDetail.screenType == 'artist') {
      if (this.featuredList.data[this.activeArtistIndex]['lapseTime'] + 2 < this.videoJSplayer.currentTime()) {
        this.featuredList.data[this.activeArtistIndex]['lapseTime'] = this.videoJSplayer.currentTime();

        let localObj = {
          'lapseTime': this.videoJSplayer.currentTime()
        }
        this.apiService.setWatchTimeInLocal(this.featuredList.data[this.activeArtistIndex]['_id'], localObj, 'featuredArtist')
      }
    }
    else if (this.commonDetail.screenType == 'collectionPheripheral' || this.commonDetail.screenType == 'showPheripheral') {

      let currentLapseTime = this.calculateLapseTime(this.activeArtistIndex);
      if (currentLapseTime + 2 < this.videoJSplayer.currentTime()) {
        this.collectionPheripheralDetails.detail['mediaList'][this.activeArtistIndex]['lapsedPercent'] = this.collectionPheripheralDetails.detail['mediaList'][this.activeArtistIndex]['duration'] / this.videoJSplayer.currentTime() * 100;

        let localObj = {
          'lapseTime': this.videoJSplayer.currentTime()
        }
        this.apiService.setWatchTimeInLocal(this.collectionPheripheralDetails.detail['mediaList'][this.activeArtistIndex]['id'], localObj, this.commonDetail.screenType)
      }
    }
  }

  // on click of replay icon start the current video from the starting
  replayVideoItem() {
    this.videoJSplayer.currentTime(0);
    this.playVideoItem();
    this.isReplay=false;

    if(this.commonDetail.screenType == 'showPheripheral') {
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_replay_obj = {
          "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration())
        }
        this.apiService.getAmplitudeInstance('showintbuilder_replay', showstory_replay_obj);
    }
  }

  // play the next video on next button and nextIn5 button (also pause the timer which is runnig)
  nextVideoItem() {
    if(this.commonDetail.screenType == 'artist') {
      this.amplitudeNextObj['ARTIST_ID'] = this.commonData['_id'];
      this.amplitudeNextObj['ARTIST_NAME'] = this.commonData['firstName'];
      // this.amplitudeObj['VIDEO_ID'] = this.commonData['story']['hlsSourceLink'];
      this.amplitudeNextObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.commonData['story']['duration']);
      this.amplitudeNextObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.commonData['lapseTime']);
      this.amplitudeNextObj['CONSUMED_PERCENT'] = this.apiService.consumedPercent(this.commonData['story']['duration'], this.commonData['lapseTime']);
    }
    else if(this.commonDetail.screenType == 'showPheripheral') {
      let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_next_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_nextvideo', showstory_next_obj);
    }
    this.pauseTimer();
    // update lapse time of current video
    this.exitContentConsumption(this.activeArtistIndex);

    this.videoJSplayer.playlist.next();
    this.isPlay = true;
    this.activeArtistIndex = this.videoJSplayer.playlist.currentItem();
    // update view count of next video
    this.updateViewCount(this.activeArtistIndex);
    if (this.previousURL == '/') {
      // Amplitude Code
      this.commonData = {};
      this.commonData = this.featuredList.data[this.activeArtistIndex];
      this.amplitudeNextObj['NEXT_ARTIST_ID'] = this.commonData['_id'];
      this.apiService.getAmplitudeInstance('artiststory_con_videonext', this.amplitudeNextObj);
    }

  }

  previousVideoItem() {
    if(this.commonDetail.screenType == 'showPheripheral') {
      let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_prev_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_prevvideo', showstory_prev_obj);
    }
    // update lapse time of current video
    this.exitContentConsumption(this.activeArtistIndex);

    this.videoJSplayer.playlist.previous();
    this.activeArtistIndex = this.videoJSplayer.playlist.currentItem();
    // update view count of next video
    this.updateViewCount(this.activeArtistIndex);
  }

  // on change setting toggle
  settingsToggle() {
    this.issettingsDrawerVisible = !this.issettingsDrawerVisible;
    this.pauseVideoItem();
  }

  // on close of setting drawer
  closeSettingDrawer(){
    this.issettingsDrawerVisible=false;
    this.playVideoItem();
  }

  // pause the timer 
  pauseTimer() {
    this.isPlay = true;
    clearInterval(this.interval);
  }

  // show the replay icon and remove the timer action on click of close icon on the over
  closeOverlay() {
    this.nextOverlayVisible = false;
    this.pauseTimer();
    this.videoJSplayer.pause();
    this.controlOverlayVisible = true;
    this.isReplay = true;
  }

  // action to open the quick view of the artist
  quickViewToggle(value: boolean) {
    this.showArtistCardView = value;
    value == true ? this.videoJSplayer.pause() : this.videoJSplayer.play();
    // Amplitude Code
    if (value == true) {
      this.amplitudeObjWithVideoId['ARTIST_ID'] = this.commonData['_id'];
      this.amplitudeObjWithVideoId['ARTIST_NAME'] = this.commonData['firstName'];
      this.amplitudeObjWithVideoId['VIDEO_ID'] = this.commonData['story']['hlsSourceLink'];
      this.amplitudeObjWithVideoId['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.commonData['story']['duration']);
      this.amplitudeObjWithVideoId['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.commonData['lapseTime']);
      this.amplitudeObjWithVideoId['CONSUMED_PERCENT'] = this.apiService.consumedPercent(this.commonData['story']['duration'], this.commonData['lapseTime']),
      this.apiService.getAmplitudeInstance('artistquickview_showartist', this.amplitudeObjWithVideoId);
    }
    if (value == false) {
      this.amplitudeToggleCloseObj['ARTIST_ID'] = this.commonData['_id'];
      this.amplitudeToggleCloseObj['ARTIST_NAME'] = this.commonData['firstName'];
      this.apiService.getAmplitudeInstance('artistquickview_cancel', this.amplitudeToggleCloseObj);
    }
  }

  // generate the shared url of the current element
  get generateSharedUrl(){
    if(this.commonDetail.screenType == 'artist')
    {
      return 'consumption?type='+this.commonDetail.screenType+'&slug='+this.featuredList.data[this.activeArtistIndex]['slug'];
    }
    
    return 'consumption?type='+this.commonDetail.screenType+'&slug='+this.collectionPheripheralDetails.detail['slug']+'&detailId='+this.collectionPheripheralDetails.detail['mediaList'][this.activeArtistIndex]['id'];
  }

  // api calling
  // get featured artist list
  getFeaturedArtistList() {
    let url = Constants.url.getFeaturedArtistList;

    this.apiService.getApiData(url).subscribe(response => {
      this.featuredList.data = [];
      this.featuredList.moreArtist = [];

      if (response['responseCode'] == 200) {
        this.featuredList.s3Url = response['data']['s3Url'];
        this.featuredList.data = response['data']['artistList'];
        if (!!response['data']['moreArtist'])
          this.featuredList.moreArtist = response['data']['moreArtist'];

        // manully concat the first name and last name to name
        this.featuredList.data = this.featuredList.data.filter(item => {
          return item['name'] = item.firstName + ' ' + item.lastName;
        });

        this.activeArtistIndex = 0;

        // amplitude code
        this.commonData = this.featuredList.data[this.activeArtistIndex];
        // this.commonData['index']=this.activeArtistIndex

        this.initVideoJs();
      } else {
        console.log('Something went wrong');
      }
    })
  }

  // get show original listing with details 
  getArtistIndividualDetail(){
    let url = Constants.url.getArtistDetail+'?artistSlug='+this.commonDetail.slug;
    this.apiService.getApiData(url).subscribe(response =>{
      this.featuredList.data=[];
      this.featuredList.moreArtist=[];

      if(response['responseCode'] == 200)
      {
        this.featuredList.s3Url = response['data']['s3Url'];
        this.featuredList.data.push(response['data']['artistDetail']);

        if(!!response['data']['moreArtist'])
          this.featuredList.moreArtist = response['data']['moreArtist'];

        // manully concat the first name and last name to name
        this.featuredList.data = this.featuredList.data.filter(item=>{
          return item['name'] = item.firstName + ' ' + item.lastName;
        });

        this.activeArtistIndex = 0;
        this.initVideoJs();
      }
    })
  }

  // get collection details
  getCollecitonDetails(){
    let url = Constants.url.getCollectionDetailDesc+'?slug='+this.commonDetail.slug;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {

        this.collectionPheripheralDetails.detail = response['data']['collectionDetail'];
        this.collectionPheripheralDetails.episodeList = response['data']['episodeList'];
        this.collectionPheripheralDetails.s3Url = response['data']['s3Url'];

        // if route has detail id the match it from media list and assign it
        if (this.commonDetail.detailId) {
          this.activeArtistIndex = this.collectionPheripheralDetails.detail['mediaList'].findIndex(x => x['id'].toString() === this.commonDetail.detailId);
        }
        else {
          // if route does not have detail Id the check the selected pheriphereal status and assign it
          this.activeArtistIndex = this.collectionPheripheralDetails.detail['mediaList'].findIndex(x => x['selectedPeripheralStatus'] === 'true');
        }

        // artist index is minus 1 (means above condition are not present) then set it to 0
        if (this.activeArtistIndex === -1 || !this.activeArtistIndex) {
          this.activeArtistIndex = 0;
        }

        this.initVideoJs();
      }
    })
  }

  // get show details
  getShowDetails() {
    let url = Constants.url.getShowDetails + '?slug=' + this.commonDetail.slug;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {

        this.collectionPheripheralDetails.detail = response['data']['showDetail'];
        this.collectionPheripheralDetails.s3Url = response['data']['s3Url'];
        this.collectionPheripheralDetails.seasonList = response['data']['seasonList'];
        this.collectionPheripheralDetails.lastSeenDetail = response['data']['lastSeenDetail'];

        if (this.commonDetail.detailId) {
          this.activeArtistIndex = this.collectionPheripheralDetails.detail['mediaList'].findIndex(x => x['id'].toString() === this.commonDetail.detailId);
        }
        else {
          // if route does not have detail Id the check the selected pheriphereal status and assign it
          this.activeArtistIndex = this.collectionPheripheralDetails.detail['mediaList'].findIndex(x => x['selectedPeripheralStatus'] === 'true');
        }

        if (this.activeArtistIndex === -1 || !this.activeArtistIndex) {
          this.activeArtistIndex = 0;
        }

        this.initVideoJs();
      }
    })
  }

  amplituteBackEvent() {
    if(this.commonDetail.screenType == 'artist'){
      this.apiService.getAmplitudeInstance('artiststory_con_back', { 'ARTIST_ID': this.featuredList.data[this.activeArtistIndex]['_id'], 'ARTIST_NAME': this.featuredList.data[this.activeArtistIndex]['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['story']['duration']), 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.featuredList.data[this.activeArtistIndex]['lapseTime']), "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.featuredList.data[this.activeArtistIndex]['story']['duration'], this.featuredList.data[this.activeArtistIndex]['lapseTime']) });
    }
    else if(this.commonDetail.screenType === 'showPheripheral') {
      let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
        
        let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
        let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
        let showstory_back_obj = {
          "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
          'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
          "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
        }
        this.apiService.getAmplitudeInstance('showintbuilder_back', showstory_back_obj)
    }
  }

  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.amplituteBackEvent();
  }

  // exitContentAPI call on unload or before unload
  @HostListener('window:unload', ['$event'])
  callApiOnPageUnload(event) {
    this.exitContentConsumption(this.activeArtistIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  callApiOnPageBeforeUnload(event) {
    this.exitContentConsumption(this.activeArtistIndex);
  }

  // call API on exit content consumption
  exitContentConsumption(index) {
    let url = Constants.url.exitContentConsumption;
    let data = {};

    if (this.commonDetail.screenType == 'artist') {
      data = {
        "artistId": this.featuredList.data[index]['_id'],
        "lapsedTime": this.featuredList.data[index]['lapseTime'],
        "totalMediaDuration": this.featuredList.data[index]['story']['duration']
      }
    }
    else if (this.commonDetail.screenType == 'collectionPheripheral') {
      data = {
        "collectionId": this.collectionPheripheralDetails.detail['_id'],
        "collectionMediaId": this.collectionPheripheralDetails.detail['mediaList'][index]['id'],
        "lapsedTime": this.calculateLapseTime(index),
        "totalMediaDuration": this.collectionPheripheralDetails.detail['mediaList'][index]['duration']
      }
    }
    else if (this.commonDetail.screenType == 'showPheripheral') {
      data = {
        "showId": this.collectionPheripheralDetails.detail['_id'],
        'showMediaId': this.collectionPheripheralDetails.detail['mediaList'][index]['id'],
        "showSlug": this.collectionPheripheralDetails.detail['slug'],
        "lapsedTime": this.calculateLapseTime(index),
        "totalMediaDuration": this.collectionPheripheralDetails.detail['mediaList'][index]['duration']
      }
    }

    // api call
    if(data['lapsedTime']>0)
    {
      this.apiService.getPostData(url, data).subscribe();
    }

  }

  // API call to update the view count on next previou and video change
  updateViewCount(index){
    var url:string;
    var data:any;
    if(this.commonDetail.screenType=='artist')
    {
      url = Constants.url.updateStoryView;
      data={
        "artistId": this.featuredList.data[index]['_id'],
        "viewCount": this.featuredList.data[index]['viewCount']
      };
    }
    else if(this.commonDetail.screenType=='collectionPheripheral')
    {
      url = Constants.url.countUpdateCollectionPheripheral;
      data={
        "collectionId": this.collectionPheripheralDetails.detail['_id'],
        "mediaId": this.collectionPheripheralDetails.detail['mediaList'][index]['id'],
        "viewCount": this.collectionPheripheralDetails.detail['mediaList'][index]['viewCount']
      };
    }
    else if(this.commonDetail.screenType=='showPheripheral')
    {
      url = Constants.url.countUpdateShowPheripheral;
      data={
        "showId": this.collectionPheripheralDetails.detail['_id'],
        "mediaId": this.collectionPheripheralDetails.detail['mediaList'][index]['id'],
        "viewCount": this.collectionPheripheralDetails.detail['mediaList'][index]['viewCount']
      };
    }
    // api calling 
    this.apiService.getPostData(url, data).subscribe();
  }

  // Amplitude show artist code
  playArtist(obj) {
    this.amplitudeObj['ARTIST_ID'] = obj['_id'];
    this.amplitudeObj['ARTIST_NAME'] = obj['firstName'];
    this.amplitudeObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(obj['story']['duration']);
    this.amplitudeObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(obj['lapseTime']);
    this.amplitudeObj['CONSUMED_PERCENT'] = this.apiService.consumedPercent(obj['story']['duration'], obj['lapseTime']),
    this.apiService.getAmplitudeInstance('artiststory_conn_showartist', this.amplitudeObj);
  }

  onChipClick(){
    if(this.previousURL == '/' && this.commonDetail.screenType == 'showPheripheral') {
      let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
      
      let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
      let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
      let showstory_chip_obj = {
        "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
        'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
        "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
        "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
        "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
      }
      this.apiService.getAmplitudeInstance('showintbuilder_showchip', showstory_chip_obj);
    }
    this.router.navigate(['full-consumption'], { queryParams: {type: 'show', 'slug': this.collectionPheripheralDetails.detail['slug'], 'seasonSlug': this.collectionPheripheralDetails.seasonList[0]['slug']} });
  }

  onDrawerClick() { 
    if((this.previousURL.includes('show-details') && this.commonDetail.screenType == 'showPheripheral') || (this.previousURL == '/' && this.commonDetail.screenType == 'showPheripheral')) {
      let cons_vid = (this.videoJSplayer.duration() - this.videoJSplayer.remainingTime()).toFixed(2);
      
      let artist_ids = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.id);
      let artist_names = this.collectionPheripheralDetails.detail['artistList'].map(artist => artist.name);
      
      this.apiService.getAmplitudeInstance('showintbuilder_drawerclick', 
      {
        "ARTIST_IDs" : artist_ids, "ARTIST_NAME" : artist_names, 'SHOW_ID': this.collectionPheripheralDetails.detail['_id'], 'SHOW_NAME': this.collectionPheripheralDetails.detail['title'],
        'VIDEO_ID': this.collectionPheripheralDetails.detail['selectedPeripheral']['hlsSourceLink'],
        "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.videoJSplayer.duration()),
        "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(cons_vid),
        "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.videoJSplayer.duration(), cons_vid)
      });
    }
  }

}