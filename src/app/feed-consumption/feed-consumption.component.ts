import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  Renderer
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

import '../../assets/js/consumption.js';
import { Constants } from 'src/app/shared/others/constants.js';
import { ApiService } from 'src/app/shared/others/api.service.js';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { LazyLoadScriptService } from './../shared/others/lazy-load-script.service';
import { map, filter, take, switchMap } from 'rxjs/operators';

declare var $;
declare var videojs: any;

@Component({
  selector: 'app-feed-consumption',
  templateUrl: './feed-consumption.component.html',
  styleUrls: ['../consumption/consumption-card/consumption-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedConsumptionComponent implements OnInit, AfterViewInit, OnDestroy {

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
  screen_type = 'feed-cunsumption';
  
  private videoJSplayer: any;
  showOverlay = false;
  nextOverlayVisible = false;
  controlOverlayVisible = false;
  showVideoContainer: boolean = true;

  activeArtistIndex: number = null;
  actionBottomVisible:boolean = false;
  isFirstTimeDataFetch = true;

  currentPlayingVideoId:string=null;
  currentItemId:number=null;
  isHLSPlayed: boolean = true;
  videoBitRate: number = 240
  playerObj = [];
  isQuickviewVisible: boolean = false;
  sharedUrl:string=null;
  currentItemIndex: number;
  public constantImg: any;
  lang;

  commonDetail = {
    screenType: null,
    episodeSlug: null,
    keyword: null,
    slug : null,
  }

  collectionPheripheralDetails = {
    s3Url: null,
    detail: [],
    isDataLoaded: false,
    limit: 10,
    offset: 0,
    language: "en",
    noMoreData: true
  }

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }  

  constructor(public router: Router, private route: ActivatedRoute, private elementRef: ElementRef, private apiService: ApiService, private lazyLoadService: LazyLoadScriptService,  renderer: Renderer) {
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.isHLSPlayed = environment.isHLSPlayed;
    this.videoBitRate = environment.videoBitRate;

    this.getMediumAmplitude(this.apiService.getPreviousUrl());
  }

  getMediumAmplitude(url) {
    if(url.includes('show-details')){
      this.apiService.getAmplitudeInstance('feed_landing', {'MEDIUM' : 'show-details'});
    }else if(url === '/') {
      this.apiService.getAmplitudeInstance('feed_landing', {'MEDIUM' : 'home'});
    }else if(url.includes('collection-details')){
      this.apiService.getAmplitudeInstance('feed_landing', {'MEDIUM' : 'collection-details'});
    } else if(url.includes('artist-landscape')) {
      this.apiService.getAmplitudeInstance('feed_landing', {'MEDIUM' : 'artist-landscape'});
    }
  }
  
  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      this.contentInitOnUrlChange(params)
    }); 
  }

  contentInitOnUrlChange(params){
    // destroy previous elements
    this.playerObj.forEach(item => {
      item.dispose();
    });

    // reintialise the varialbes
    this.showOverlay = false;
    this.nextOverlayVisible = false;
    this.controlOverlayVisible = false;
    this.showVideoContainer = true;

    this.activeArtistIndex = null;
    this.actionBottomVisible= false;
    this.isFirstTimeDataFetch = true;

    this.currentPlayingVideoId=null;
    this.currentItemId=null;
    this.playerObj = [];
    this.isQuickviewVisible= false;

    this.commonDetail = {
      screenType: null,
      episodeSlug: null,
      slug : null,
      keyword: null
    }
  
    this.collectionPheripheralDetails = {
      s3Url: null,
      detail: [],
      isDataLoaded: false,
      limit: 10,
      offset: 0,
      language: "en",
      noMoreData: true
    }

    this.commonDetail.screenType = params['type'];
    this.commonDetail.slug = params['slug'];
    this.commonDetail.episodeSlug = params['episodeSlug'];
    this.commonDetail.keyword = params['keyword'];
    if (this.commonDetail.screenType == 'artist') {
      this.getArtistEpisodeList();
    } 
    else if(!(this.commonDetail.keyword==null || this.commonDetail.keyword == '' || this.commonDetail.keyword == undefined))
    {
      this.getSearchEpisodeList();
    }
    else {
      this.getEpisodeList();
    }
  }

  // Api call to get the artist episode list for feed
  getArtistEpisodeList(){    
    let url = Constants.url.artistEpisodesList + '?artistSlug=' + this.commonDetail.slug + '&limit=' + this.collectionPheripheralDetails.limit + '&offset=' + this.collectionPheripheralDetails.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        
        this.collectionPheripheralDetails.isDataLoaded  = true;
        this.collectionPheripheralDetails.detail        = this.collectionPheripheralDetails.detail.concat(response['data']['artistEpisodeList']);
        this.collectionPheripheralDetails.s3Url         = response['data']['s3Url'];

        if (response['data']['artistEpisodeList'].length == this.collectionPheripheralDetails.limit) {
          this.collectionPheripheralDetails.noMoreData  = false;
          this.collectionPheripheralDetails.offset      = this.collectionPheripheralDetails.limit + this.collectionPheripheralDetails.offset;
        } else {
          this.collectionPheripheralDetails.noMoreData  = true;
        }
        this.activeArtistIndex = 0;
        this.formPlayList(response['data']['artistEpisodeList']);
      } else {
        this.collectionPheripheralDetails.noMoreData = true;
      }
    })
  }

  // Api call to get the episode content list 
  getEpisodeList(){    
    let reqData = {
      "subGenreList": "",
      "limit": this.collectionPheripheralDetails.limit,
      "offset": this.collectionPheripheralDetails.offset,
      "lang": this.collectionPheripheralDetails.language,
      "episodeSlug": this.commonDetail.episodeSlug,
      "artistSlug": this.commonDetail.slug,
    }
    
    this.apiService.getPostData(Constants.url.episodeFeedContent, reqData).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.collectionPheripheralDetails.isDataLoaded = true;
        this.collectionPheripheralDetails.detail = this.collectionPheripheralDetails.detail.concat(response['data']['feedContent']);
        this.collectionPheripheralDetails.s3Url = response['data']['s3Url'];
        if (response['data']['feedContent'].length == this.collectionPheripheralDetails.limit) {
          this.collectionPheripheralDetails.noMoreData = false;
          this.collectionPheripheralDetails.offset = this.collectionPheripheralDetails.limit + this.collectionPheripheralDetails.offset;
        } else {
          this.collectionPheripheralDetails.noMoreData = true;
        }
        this.activeArtistIndex = 0;
        this.formPlayList(response['data']['feedContent']);
      } else {
        this.collectionPheripheralDetails.noMoreData = true;
      }
    });
  }

  // Api call to get the search episode content list on
  getSearchEpisodeList(){        
    let url = Constants.url.getFeedSearchEpisodeList + '?keyword=' + this.commonDetail.keyword;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.collectionPheripheralDetails.isDataLoaded = true;
        this.collectionPheripheralDetails.detail = this.collectionPheripheralDetails.detail.concat(response['data']['feedContent']);
        this.collectionPheripheralDetails.s3Url = response['data']['s3Url'];
        if (response['data']['feedContent'].length == this.collectionPheripheralDetails.limit) {
          this.collectionPheripheralDetails.noMoreData = false;
          this.collectionPheripheralDetails.offset = this.collectionPheripheralDetails.limit + this.collectionPheripheralDetails.offset;
        } else {
          this.collectionPheripheralDetails.noMoreData = true;
        }
        this.activeArtistIndex = 0;
        this.formPlayList(response['data']['feedContent']);
      } else {
        this.collectionPheripheralDetails.noMoreData = true;
      }
    });
  }

  formPlayList(data) {
    var first_element = true;
    var renderData = setTimeout(() => {
      data.forEach((item, index) => {
        item.isPlay = false;
        item.controlOverlayVisible = false;
        var posterPath = this.collectionPheripheralDetails.s3Url.basePath + this.collectionPheripheralDetails.s3Url.episodePath + this.constantImg.horizontalSmall + item['thumbnail']['horizontal']['ratio1']['sourceLink'];
        var videoObj = videojs('feed_consumption_player_' + item['_id'], { "poster": posterPath });
        this.playerObj.push(videoObj);
        if (first_element && this.isFirstTimeDataFetch) {
          //let muteState = this.apiService.getMuteState();
          videoObj.muted(true);
          this.setAmplitudeEvent(videoObj)
          var playFirstVideo = setTimeout(() => {
            videoObj.play();
            clearInterval(playFirstVideo);
          }, environment.autoPlayVideoDuration); 
          first_element = false;
          item.isPlay = true;
          this.currentItemId = item['_id'];

          videoObj.on('volumechange', (data) => {
            this.apiService.setMuteState(videoObj.muted());
          });
          this.activeArtistIndex = index;

          // on end event on video js
          videoObj.on('ended', () => {
            this.scrollToNextVideo(this.activeArtistIndex);
          });
          
          setTimeout(() => {
            if (this.commonDetail.keyword != undefined && this.commonDetail.keyword != null && this.commonDetail.keyword != ''){
              videoObj.pause();
              var $container = $("html,body");
              var $scrollTo = $(".episode_slug_" + this.commonDetail.episodeSlug);
              $container.animate({ scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop(), scrollLeft: 0 }, 300);
            }
          }, 2000);

        } else {
          videoObj.pause();
        }
      });
      this.isFirstTimeDataFetch = false;
      clearInterval(renderData);
    }, 1000);
  }

  //set vide muted
  setVideoMute(obj)
  { 
    obj.on('volumechange', (data) => {
      this.apiService.setMuteState(obj.muted());
    });

    let muteState = this.apiService.getMuteState();
    obj.muted(muteState);
  }

  setAmplitudeEvent(obj) {
    obj.on('volumechange', () => {
        var fcsObj = {'ARTIST_ID' : this.collectionPheripheralDetails.detail[this.activeArtistIndex]['_id'], 'VIDEO_ID' : this.collectionPheripheralDetails.detail[this.activeArtistIndex]['hlsSourceLink'], 'VIDEO_DURATION' :  this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.activeArtistIndex]['duration']), 'VIDEO_CONSUMED' : this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.activeArtistIndex]['lapseTime']), 'VIDEO_FULLSCREEN' : 0};
        this.apiService.getAmplitudeInstance(obj.muted() == true? 'fcs_mute': 'fcs_unmute', fcsObj);
    });

    obj.on("seeking", (e) => {
      this.apiService.getAmplitudeInstance('fcs_progress', {'ARTIST_ID' : this.collectionPheripheralDetails.detail[this.activeArtistIndex]['_id'], 'VIDEO_ID' : this.collectionPheripheralDetails.detail[this.activeArtistIndex]['hlsSourceLink'], 'VIDEO_DURATION' :  this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.activeArtistIndex]['duration']), 'VIDEO_CONSUMED' : this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.activeArtistIndex]['lapseTime']), 'VIDEO_FULLSCREEN' : 0});
    });
  }
  
  // on tap of video show the control for a specific time
  showControls(item, event) {
    item.controlOverlayVisible = true;
    setTimeout(() => {
      item.controlOverlayVisible = false;
    }, 3000);
  }

  // take action on click of the ellipses icon
  actionBottomShift(value:boolean){
    this.actionBottomVisible = value;
    $('body').addClass('noscroll');
    // console.log('hello');
    this.sharedUrl= this.generateSharedUrl;
    this.pauseCurrentPlayingVideo(value);
    if (value){
      $('body').addClass('noscroll');
    }else{
      $('body').removeClass('noscroll');
    }
    
    // if (!!this.currentItemId)
    // {
    //   var id = 'feed_consumption_player_' + this.currentItemId + "_html5_api";
    //   var videoObj = videojs(id);
    //   if (!value) {
    //     videoObj.play();
    //   } else {
    //     videoObj.pause();
    //   }
    // }
  }

  pauseCurrentPlayingVideo(value: boolean){
    if (!!this.currentItemId) {
      var id = 'feed_consumption_player_' + this.currentItemId + "_html5_api";
      var videoObj = videojs(id);
      if (!value) {
        videoObj.play();
      } else {
        videoObj.pause();
      }
    }
  }

  playPauseVideoItem(item_id, item) {
    var videoObj = videojs('feed_consumption_player_' + item_id);
    if (videoObj.paused()) {
      videoObj.play();
      item.isPlay = true;
      // Amplitude Code
      this.amplitudeObj['ARTIST_ID'] = item_id;
      this.amplitudeObj['VIDEO_ID'] = item['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] = item['duration'];
      this.amplitudeObj['VIDEO_CONSUMED'] = item['lapseTime'];
      this.amplitudeObj['VIDEO_FULLSCREEN'] = 0;
      this.apiService.getAmplitudeInstance('fcs_play', this.amplitudeObj);
    } else {
      videoObj.pause();
      item.isPlay = false;

      // Amplitude Code
      this.amplitudeObj['ARTIST_ID'] = item_id;
      this.amplitudeObj['VIDEO_ID'] = item['hlsSourceLink'];
      this.amplitudeObj['VIDEO_DURATION'] = item['duration'];
      this.amplitudeObj['VIDEO_CONSUMED'] = item['lapseTime'];
      this.amplitudeObj['VIDEO_FULLSCREEN'] = 0;
      this.apiService.getAmplitudeInstance('fcs_pause', this.amplitudeObj);
    }
  }

  // event to play or pause the video item
  playPauseVideoInBack(item_id, isPause) {
    var videoObj = videojs('feed_consumption_player_' + item_id);
    if (!isPause) {
      videoObj.play();
    } else {
      videoObj.pause();
    }
  }

  // redirect the url on click of the chip
  redirectURL(path, aug1){
    var url = path + '/' + aug1;
    this.router.navigate([url]);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    var i = 0
    this.collectionPheripheralDetails.detail.forEach((item, index) => {
      var id                = 'feed_consumption_player_' + item['_id'] +"_html5_api";

      // code to check element is in viewport - start
      var top_of_element    = $("#" + id).offset().top;
      var bottom_of_element = $("#" + id).offset().top + $("#" + id).outerHeight();
      var bottom_of_screen  = $(window).scrollTop() + $(window).innerHeight();
      var top_of_screen     = $(window).scrollTop();
      // code to check element is in viewport - end

      // calculate height of video section and top position - start
      var videoTagHeight    = $("#" + id).height();
      var top               =  document.getElementById(id).getBoundingClientRect().top
      // calculate height of video section and top position - end

      var videoObj               = videojs(id);
      this.playerObj.push(videoObj);
      item.isPlay                = false;
      item.controlOverlayVisible = false;
      if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element) && top < videoTagHeight && top > -((videoTagHeight/2) - 30)) {
        this.setVideoMute(videoObj);
        this.currentPlayingVideoId        = id;
        this.currentItemId                = item['_id'];
        this.activeArtistIndex            = index;
        item.isPlay              = true;

        // on end event on video js
        videoObj.on('ended', () => {
          this.scrollToNextVideo(this.activeArtistIndex);
        });

        videoObj.play();
        if(i !== this.currentItemIndex){
          this.setAmplitudeEvent(videoObj)
        }
        this.currentItemIndex = i;
        videoObj.on('volumechange', (data) => {
          this.apiService.setMuteState(videoObj.muted());
        });
      } else {
        videoObj.pause();
      }
      i++;
    });

    let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let totalHeight = document.body.scrollHeight - height;
    let bottom = window.scrollY > (totalHeight - 300)

    if (!this.collectionPheripheralDetails.noMoreData && bottom) {   
      this.collectionPheripheralDetails.noMoreData = true;   
      if (this.commonDetail.screenType == 'artist') {
        this.getArtistEpisodeList()
      } else {
        this.getEpisodeList();
      }
    }
  }

  scrollToNextVideo(index){
    if(this.collectionPheripheralDetails.detail.length-1 > index )
    {
      let nextElementIndex=index+1;
      const elementList = document.querySelectorAll('#feed_consumption_card_'+nextElementIndex);
      const element = elementList[0] as HTMLElement;
      element.scrollIntoView({ behavior: 'smooth'});
    }
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.playerObj.forEach(item => {
        item.dispose();
      });
    }, 2000);
  }

  // clear interval on timer pause
  pauseTimer() {
    clearInterval(this.interval);
  }

  // close the overlay
  closeOverlay() {
    this.nextOverlayVisible = !this.nextOverlayVisible;
    this.controlOverlayVisible = true;
    this.isReplay = true;
  }

  // action to open/close the info window on which episode detail will be displayed and scrolled to the specific element
  toggleInfoWindow(show: boolean, id: string) {
    this.isQuickviewVisible = show;
    this.pauseCurrentPlayingVideo(show);
    if (show){
      $('body').addClass('noscroll');
      var scroller = setTimeout(() => {
        var p = $(".episodelist_quickview #episode_" + id);
        var position = p.position();
        $(".episodelist_quickview").animate({ scrollLeft: (position.left - 30) }, 1000);
        clearTimeout(scroller);
        setTimeout(() => {
          $(".episodelist_quickview").removeClass('invisible');
        }, 1000);
      }, 500);
    }
    else{
      $('body').removeClass('noscroll');
      $(".episodelist_quickview").addClass('invisible');
    }
  }

  // generate the shared url as per the screen type
  get generateSharedUrl(){    
    if(this.commonDetail.screenType == 'artist')
      return 'feed-consumption?type='+this.commonDetail.screenType+'&slug='+this.collectionPheripheralDetails.detail[this.activeArtistIndex]['slug'];
    
    return 'feed-consumption?type='+this.commonDetail.screenType+'&episodeSlug='+this.collectionPheripheralDetails.detail[this.activeArtistIndex]['slug'];
  }

  // emit event on click of back button
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.amplituteBackEvent();
  }
  
  // trigger the amplitude event
  amplituteBackEvent() {
    let obj ={'ARTIST_ID' : this.collectionPheripheralDetails.detail[this.currentItemIndex].artistList[0]['id'],
      'VIDEO_ID' :  this.collectionPheripheralDetails.detail[this.currentItemIndex]['hlsSourceLink'],
      'VIDEO_DURATION' : this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.currentItemIndex]['duration']),
      'VIDEO_CONSUMED' :  this.apiService.convertVideoTimeFormat(this.collectionPheripheralDetails.detail[this.currentItemIndex]['lapseTime']),
      'VIDEO_FULLSCREEN' : 0};
      this.apiService.getAmplitudeInstance('fcs_back', obj);
  }

}
