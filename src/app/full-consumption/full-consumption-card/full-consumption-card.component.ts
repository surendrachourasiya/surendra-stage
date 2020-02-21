import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy, 
  ElementRef,
  HostListener,
  ViewEncapsulation} from '@angular/core';
import {
  faEllipsisV, faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faCog,
  faRedo,
  faTimesCircle,
  faCaretRight } from '@fortawesome/free-solid-svg-icons';

import '../.././../assets/js/consumption.js';
import { Constants } from 'src/app/shared/others/constants.js';
import { ApiService } from 'src/app/shared/others/api.service.js';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';


declare var videojs: any;

@Component({
  selector: 'app-full-consumption-card',
  templateUrl: './full-consumption-card.component.html',
  // styleUrls: ['./full-consumption-card.component.scss'],
  styleUrls: ['../../consumption/consumption-card/consumption-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FullConsumptionCardComponent  implements OnInit, AfterViewInit, OnDestroy {

  faEllipsisV = faEllipsisV;
  faPlay = faPlay;
  faPause = faPause;
  faStepForward = faStepForward;
  faStepBackward = faStepBackward;
  faCog = faCog;
  faRedo = faRedo;
  faTimesCircle = faTimesCircle;
  faCaretRight = faCaretRight;
  isPlay = true ;
  isReplay = false;
  timeLeft:number = 5;
  interval;
  isHLSPlayed: boolean = true;
  previousURL = '';
  isOpenDirectly: boolean = false;
  
  lang;
  public constantImg:any;

  private videoJSplayer: any=null;
  private videoQualityLevels:any =null;
  showOverlay = false;
  issettingsDrawerVisible = false;
  nextOverlayVisible = false;
  controlOverlayVisible = false;
  showVideoContainer:boolean = true;
  isSettingEnable:boolean = false;
  openPlaylistDrawer:boolean = false;

  activeArtistIndex:number=null;
  selectedVideoQuality={
    name:'auto',
    value: null
  };


  activeContent = {
    story: {
      title: '',
      hlsSourceLink: ''
    },
    slug: ''
  };

  commonDetail={
    screenType:null,
    seasonSlug:null,
    detailSlug:null,
    before:null,
    slug:null,
    count:null,
    episodeSlug:null
  }

  listDetails={
    s3Url:null,
    detail:[],
    episodeList:[],
    seasonList:[],
    lastSeenDetail:[],
    isDataLoaded: false
  }

  // amplitude code
  commonData = {}

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudePrevObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudeNextObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  constructor(private route: ActivatedRoute, private elementRef: ElementRef, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    this.previousURL = this.apiService.getPreviousUrl();

    this.lang = this.route.snapshot.data.lang;
    this.isHLSPlayed = environment.isHLSPlayed;
    this.route.queryParams.subscribe(params => { 
      this.commonDetail.screenType = params['type'];
      this.commonDetail.seasonSlug = params['seasonSlug'];
      this.commonDetail.detailSlug = params['detailSlug'];
      this.commonDetail.before = params['before'];
      this.commonDetail.slug = params['slug'];
      this.commonDetail.count = 100;
      this.commonDetail.episodeSlug = params['episodeSlug'];
    });
  }
  
  ngAfterViewInit() {
    if(this.commonDetail.screenType=='collection')
    {
      this.getCollectionList();
    }
    else if(this.commonDetail.screenType=='show')
    {
      this.getEpisodeList();
    }
    
    // add event listner on video change
    this.elementRef.nativeElement.querySelector('video')
      .addEventListener('timeupdate', this.shownextOverlay.bind(this));
  }
  ngOnDestroy() {
    if(!!this.videoJSplayer)
    {
      this.exitContentConsumption(this.activeArtistIndex);
      setTimeout(() => {
        this.videoJSplayer.dispose();
      }, environment.destroyTimeout)      
    } 
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

  playPauseVideo(event:boolean){
    if(event){
      this.videoJSplayer.pause();
      this.isPlay = false;
    } else {
      this.videoJSplayer.play();
      this.isPlay = true;
    }
  }

  // change the video and play from the lapse time available
  changeSelectedVideo(event:number){
    this.pauseTimer();
    // lapse time update of current
    this.exitContentConsumption(this.activeArtistIndex);

    this.activeArtistIndex=event;
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

    if(this.listDetails.episodeList[this.activeArtistIndex]['lapsedPercent'] >= 100)
      this.videoJSplayer.currentTime(0);
    else
    {
      setTimeout(()=>{
        let updatedLapseTime = this.calculateLapseTime(this.activeArtistIndex);
        this.videoJSplayer.currentTime(updatedLapseTime);
      },2000)
    }

     // update view count of new selected video
     this.updateViewCount(this.activeArtistIndex);
  }

  calculateLapseTime(index){
   return this.listDetails.episodeList[index]['lapsedPercent']*this.listDetails.episodeList[index]['duration']/100;
  }


  initVideoJs() {
    
    this.videoJSplayer = videojs('full_consumption_player');
       
    this.videoJSplayer.playlist([]);
    
    // form the playlist as per the check
    this.formPlayList();
    
    this.videoJSplayer.on('volumechange', (data)=>{
        this.apiService.setMuteState(this.videoJSplayer.muted());

        // Amplitude Unmute Code
        if(this.previousURL == '/'){ 
          // Amplitude Code
          this.amplitudeObj['ARTIST_ID'] = this.commonData['_id'];
          this.amplitudeObj['VIDEO_ID'] = this.commonData['hlsSourceLink'];
          this.amplitudeObj['VIDEO_DURATION'] =  this.convertVideoTimeFormat(this.commonData['duration']);
          this.amplitudeObj['VIDEO_CONSUMED'] = this.convertVideoTimeFormat(this.commonData['lapsedPercent']);
          this.apiService.getAmplitudeInstance('cws_unmute', this.amplitudeObj);
        }
    });
    
    this.videoJSplayer.on('ended', () => {
      this.videoTimerEvent();
    });

    this.videoJSplayer.on('playing', () => {
      this.isOpenDirectly = true
    });

    this.videoJSplayer.on("seeking", (e) => {
      if(this.videoJSplayer.paused())
        this.pauseVideoItem();
      else
        this.playVideoItem();
        
      // Amplitude Unmute Code
      if(this.previousURL == '/'){ 
        var click_duration = this.commonData['duration'] - this.videoJSplayer.remainingTime();
        this.apiService.getAmplitudeInstance('cws_progress', {'ARTIST_ID' : this.commonData['artistList'][0]['id'], 'VIDEO_ID' : this.commonData['hlsSourceLink'], 'VIDEO_DURATION' :  this.apiService.convertVideoTimeFormat(this.commonData['duration']), 'CLICKED_DURATION' : this.apiService.convertVideoTimeFormat(click_duration)});
      }
    });

    let muteState= this.apiService.getMuteState();
    //this.videoJSplayer.muted(muteState);
    this.videoJSplayer.muted(false);
    this.apiService.setMuteState(this.videoJSplayer.muted());

    // get the qulaity levels for the hls video
    if(this.isHLSPlayed)
    {
      setTimeout(()=>{
        this.videoQualityLevels=this.videoJSplayer.qualityLevels();
        this.videoQualityLevels.on('change', (event)=> {
          // console.log('New level:', this.videoQualityLevels.selectedIndex, this.videoQualityLevels.selectedIndex_);
        });
      },1000)
    } 

  }

  playPeripheralVideo() {
    this.videoJSplayer.play();
    this.isOpenDirectly = false;
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
  videoTimerEvent(){
    this.videoJSplayer.pause();

    // if it is last video start playing the video from first video
    if(this.activeArtistIndex === this.listDetails.episodeList.length-1)
    {
      this.changeSelectedVideo(0);
    }
    else
    {
      // start interval of 5 second
      this.timeLeft=6;
      
      this.interval = setInterval(() => {
        if(this.timeLeft <= 6) {
          this.timeLeft--;
          this.isReplay=true;
          this.nextOverlayVisible = true;
          this.controlOverlayVisible=true;
                 
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
      },1000)
    }
  }

  // create a playlist
  formPlayList(){
    let videoSrc=[];

    if(this.commonDetail.screenType ==='collection')
    {
        this.listDetails.episodeList.forEach(item => {
          if (this.isHLSPlayed) {
            videoSrc.push({
              sources: [
                {
                  src: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.hls + item.hlsSourceLink,
                  type: 'application/x-mpegURL'
                }
              ],
              poster: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['ratio1']['sourceLink'],
            });
          } else {
            videoSrc.push({
              sources: [
                {
                  src: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + '/main-video/' + environment.videoBitRate + '/' + item.sourceLink,
                  type: 'video/mp4'
                }
              ],
              poster: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['ratio1']['sourceLink'],
             // textTracks: [{ kind: 'captions', srclang: 'hin', label: 'Hindi', src: 'http://192.168.2.3:4200/assets/images/subtitles.vtt', default: true }]

            });
          }
            
        });
    }
    else if(this.commonDetail.screenType ==='show')
    {
        this.listDetails.episodeList.forEach(item => {
          if (this.isHLSPlayed) {
            videoSrc.push({
              sources: [
                {
                  src: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.hls + item.hlsSourceLink,
                  type: 'application/x-mpegURL'
                }
              ],
              poster: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['ratio1']['sourceLink'],
            });
          }else{
            videoSrc.push({
              sources: [
                {
                  src: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + '/main-video/' + environment.videoBitRate + '/' + item.sourceLink,
                  type: 'video/mp4'
                }
              ],
              poster: this.listDetails.s3Url.basePath + this.listDetails.s3Url.episodePath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['ratio1']['sourceLink'],
            });
          }
            
        });
    }
    this.videoJSplayer.playlist(videoSrc);  
    this.changeSelectedVideo(this.activeArtistIndex);
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

  // check the current state of player and take action of play or pause respectively
  playPauseVideoItem() {
    let duration = this.convertVideoTimeFormat(this.commonData['duration']);
    let lapseTime = this.convertVideoTimeFormat(this.commonData['lapsedPercent']);
    
    if (this.videoJSplayer.paused()) {
      this.playVideoItem();

      if(this.previousURL == '/'){
        // Amplitude Code
        this.apiService.getAmplitudeInstance('cws_play', {'ARTIST_ID': this.commonData['_id'], 'VIDEO_ID': this.commonData['hlsSourceLink'], 'VIDEO_DURATION': duration, 'VIDEO_CONSUMED': lapseTime});
      }
    } else {
      this.pauseVideoItem();
      if(this.previousURL == '/'){
        // Amplitude Code
        this.apiService.getAmplitudeInstance('cws_pause', {'ARTIST_ID': this.commonData['_id'], 'VIDEO_ID': this.commonData['hlsSourceLink'], 'VIDEO_DURATION': duration, 'VIDEO_CONSUMED': lapseTime});
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
    if(this.commonDetail.screenType=='collection' || this.commonDetail.screenType=='show')
    {
      let currentLapseTime= this.calculateLapseTime(this.activeArtistIndex);
     
      if(currentLapseTime+10 < this.videoJSplayer.currentTime())
      {
        this.listDetails.episodeList[this.activeArtistIndex]['lapsedPercent'] = this.listDetails.episodeList[this.activeArtistIndex]['duration']/this.videoJSplayer.currentTime()*100 ;
  
        let localObj={
          'lapseTime': this.videoJSplayer.currentTime()
        }
        this.apiService.setWatchTimeInLocal(this.listDetails.episodeList[this.activeArtistIndex]['_id'], localObj, this.commonDetail.screenType)
      }
    }
  }

  // on click of replay icon start the current video from the starting
  replayVideoItem() {
    this.videoJSplayer.currentTime(0);
    this.playVideoItem();
    this.isReplay=false;
  }

  // play the next video on next button and nextIn5 button (also pause the timer which is runnig)
  nextVideoItem() {
    this.pauseTimer();
    // update lapse time of current video
    this.exitContentConsumption(this.activeArtistIndex);

    this.videoJSplayer.playlist.next();
    this.isPlay=true;
    this.activeArtistIndex=this.videoJSplayer.playlist.currentItem();

    // update view count of next video
    this.updateViewCount(this.activeArtistIndex);

    // Amplitude Code
    this.amplitudeNextObj['NEXT_VIDEO_DURATION'] =  this.convertVideoTimeFormat(this.commonData['duration']);
    this.amplitudeNextObj['NEXT_VIDEO_ID'] = this.commonData['hlsSourceLink'];
    this.commonData = {};
    this.commonData = this.listDetails.episodeList[this.activeArtistIndex];
    let duration = this.convertVideoTimeFormat(this.commonData['duration']);
    let lapseTime = this.convertVideoTimeFormat(this.commonData['lapsedPercent']);
    if(this.previousURL == '/'){
      // Amplitude Code
      this.amplitudeNextObj['ARTIST_ID'] = this.commonData['_id'];
      this.amplitudeNextObj['VIDEO_ID'] = this.commonData['hlsSourceLink'];
      this.amplitudeNextObj['VIDEO_DURATION'] =  duration;
      this.amplitudeNextObj['VIDEO_CONSUMED'] = lapseTime;
      this.apiService.getAmplitudeInstance('cws_next', this.amplitudeNextObj);
    }
  }
  
  previousVideoItem() {
    // update lapse time of current video
    this.exitContentConsumption(this.activeArtistIndex);
    this.videoJSplayer.playlist.previous();
    this.activeArtistIndex=this.videoJSplayer.playlist.currentItem();

    // update view count of next video
    this.updateViewCount(this.activeArtistIndex);
    this.amplitudePrevObj['PREV_VIDEO_DURATION'] =  this.convertVideoTimeFormat(this.commonData['duration']);
    this.amplitudePrevObj['PREV_VIDEO_ID'] = this.commonData['hlsSourceLink'];
    // Amplitude Code
    this.commonData = {};
    this.commonData = this.listDetails.episodeList[this.activeArtistIndex];
    let duration = this.convertVideoTimeFormat(this.commonData['duration']);
    let lapseTime = this.convertVideoTimeFormat(this.commonData['lapsedPercent']);
    if(this.previousURL == '/'){ 
      // Amplitude Code
      this.amplitudePrevObj['ARTIST_ID'] = this.commonData['_id'];
      this.amplitudePrevObj['VIDEO_ID'] = this.commonData['hlsSourceLink'];
      this.amplitudePrevObj['VIDEO_DURATION'] =  duration;
      this.amplitudePrevObj['VIDEO_CONSUMED'] = lapseTime;
      this.apiService.getAmplitudeInstance('cws_previous', this.amplitudePrevObj);
    }
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
    this.isPlay=true;
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

  // api calling
  // get episode List
  getEpisodeList(){
    let url = Constants.url.getShowEpisodeList+'?seasonSlug='+this.commonDetail.seasonSlug+'&showSlug='+this.commonDetail.slug;
    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200 || response['responseCode'] == 204) {
        this.listDetails.s3Url = response['data']['s3Url'];
        this.listDetails.episodeList = response['data']['episodeList'];

         // find the index of the selected collection
         if(this.commonDetail.episodeSlug)
         {
           this.activeArtistIndex=this.listDetails.episodeList.findIndex(x => x['slug'].toString()=== this.commonDetail.episodeSlug);
         }
 
         // collection index is minus 1 (means above condition are not present) then set it to 0
         if(this.activeArtistIndex === -1 || !this.activeArtistIndex)
         {
           this.activeArtistIndex = 0;
         }

         // amplitude code
        this.commonData = this.listDetails.episodeList[this.activeArtistIndex];
        // this.commonData['index']=this.activeArtistIndex

        this.initVideoJs();
      } else {
        this.listDetails.episodeList = [];
      }
    })
  }

   // get collection List
   getCollectionList(){
    let url = Constants.url.getCollectionMediaList+'?collectionSlug='+this.commonDetail.slug+'&limit='+this.commonDetail.count+'&offset=0';
    
    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200 || response['responseCode'] == 204) {
        this.listDetails.s3Url = response['data']['s3Url'];
        this.listDetails.episodeList = response['data']['episodeList'];

        // find the index of the selected collection
        if(this.commonDetail.detailSlug)
        {
          this.activeArtistIndex=this.listDetails.episodeList.findIndex(x => x['slug'].toString()=== this.commonDetail.detailSlug);
        }

        // show index is minus 1 (means above condition are not present) then set it to 0
        if(this.activeArtistIndex === -1 || !this.activeArtistIndex)
        {
          this.activeArtistIndex = 0;
        }

        // amplitude code
        this.commonData = this.listDetails.episodeList[this.activeArtistIndex];
        this.commonData['index']=this.activeArtistIndex

        this.initVideoJs();
      } else {
        this.listDetails.episodeList = [];
      }
    })
  }

  amplituteBackEvent() {
    let obj = {'ARTIST_ID' : this.commonData['artistList'][0]['id'], 'VIDEO_ID' : this.commonData['hlsSourceLink'],
        'VIDEO_DURATION' :  this.commonData['duration'], 'VIDEO_CONSUMED' : this.commonData['lapsedPercent']};
      this.apiService.getAmplitudeInstance('cws_back', obj);
  }
  
  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.amplituteBackEvent();
  }


  @HostListener('window:unload', ['$event'])
  callApiOnPageUnload(event) {
    this.exitContentConsumption(this.activeArtistIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  callApiOnPageBeforeUnload(event) {
    this.exitContentConsumption(this.activeArtistIndex);
  }

  // call API on exit content consumption
  exitContentConsumption(index){
    let url = Constants.url.exitContentConsumption;
    let data={};

    if(this.commonDetail.screenType=='collection')
    {
      data = {
        "collectionId": this.listDetails.episodeList[index]['collectionId'],
        "episodeId": this.listDetails.episodeList[index]['_id'],
        "lapsedTime": this.videoJSplayer.currentTime(),
        "totalMediaDuration": this.videoJSplayer.duration()
      }
    }
    else if(this.commonDetail.screenType=='show')
    {
      data = {
        "showId": this.listDetails.episodeList[index]['showId'],
        "showSlug": this.listDetails.episodeList[index]['showSlug'],
        "seasonId": this.listDetails.episodeList[index]['seasonId'],
        "episodeId": this.listDetails.episodeList[index]['_id'],
        "lapsedTime": this.videoJSplayer.currentTime(),
        "totalMediaDuration": this.videoJSplayer.duration()
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
    if(this.commonDetail.screenType=='collection' || this.commonDetail.screenType=='show')
    {
      let url = Constants.url.countUpdatEpisode;
      let data={
        "episodeId": this.listDetails.episodeList[index]['_id'],
        "viewCount": this.listDetails.episodeList[index]['viewCount']
      };

      this.apiService.getPostData(url, data).subscribe();
    }
  }

}
