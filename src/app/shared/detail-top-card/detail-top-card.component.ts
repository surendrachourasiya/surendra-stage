import { Component, OnInit, Input, HostListener, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../others/api.service';
import { Constants } from '../others/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { faVolumeMute, faVolumeUp, faPlayCircle } from '@fortawesome/free-solid-svg-icons';

declare var videojs: any;

@Component({
  selector: 'app-detail-top-card',
  templateUrl: './detail-top-card.component.html',
  styleUrls: ['./detail-top-card.component.scss']
})
export class DetailTopCardComponent implements OnInit, OnChanges {

  public constantImg:any;
  passSingleArtistId = '';
  faVolumeMute = faVolumeMute;
  faVolumeUp = faVolumeUp;
  faPlayCircle = faPlayCircle;
  mute = false;
  isHLSPlayed: boolean = true;
  amplitudeArr = [];
  isOpenDirectly: boolean = true;

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { 
    this.constantImg = Constants.image;
  }

  @Input() showDetailObj;
  @Input() showDetailS3Url;
  @Input() showSeasonObj;
  @Input() lastSeenObj;
  @Input() pageType;
  @Input() language;

  videoSrc:string = '';
  private videoJSplayer: any;
  posterPath:string = '';
  showArtistCardView:boolean = false;
  lang;

  isVideoPlay: boolean = true;
  selectedIndex:number=0;
  screen_type = 'detail-top-card';

  amplitudeShowObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  timer = null;

  @ViewChild('detailVideoElement', { static: false }) detailVideoElement: ElementRef;

  toggleDescription={
    text:null,
    status:'less',
    seeBtnText:'see less'
  }
  // call api again if decorators may get changed
  ngOnChanges(){
    this.isHLSPlayed = environment.isHLSPlayed;
    this.resetScope();
  }
  
  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.isHLSPlayed = environment.isHLSPlayed;


    //check reference url 
    var oldURL = this.apiService.getPreviousUrl();
    if ((oldURL.indexOf("/") > -1 || oldURL.indexOf("facebook") > -1 || oldURL.indexOf("whatsApp") > -1 || oldURL.indexOf("whatsapp") > -1)) {
      this.isOpenDirectly = true
    }

    this.apiService.openSharedPopup.subscribe(show => {
      if (show){
        this.videoJSplayer.pause();
      }else{
        this.videoJSplayer.play();
      }
    });
  }

  ngOnDestroy() {
    setTimeout(() => {
      if(!!this.videoJSplayer)
        this.videoJSplayer.dispose();
    }, environment.destroyTimeout)
  }

  resetScope(){
    if(!!this.videoSrc)
      this.videoJSplayer.dispose();

    // default initialise for see less or data is less then limit
    if(this.showDetailObj.description.length <= environment.showMoreLessLimit)
    {
      this.toggleDescription.status = 'no';
      this.toggleDescription.text = this.showDetailObj.description;
    } else {
      this.toggleText();
    }
    
    if (this.showDetailObj.selectedPeripheral !== undefined && this.showDetailObj.selectedPeripheral.hlsSourceLink !== undefined){
      if (this.pageType == 'show') {
        if (this.isHLSPlayed) {
          this.videoSrc = this.showDetailS3Url.basePath + this.showDetailS3Url.showPath + this.constantImg.hls + this.showDetailObj.selectedPeripheral.hlsSourceLink;
        } else {
          this.videoSrc = this.showDetailS3Url.basePath + this.showDetailS3Url.showPath + '/main-video/' + environment.videoBitRate + '/' + this.showDetailObj.selectedPeripheral.sourceLink;
        }
        this.posterPath = this.showDetailS3Url.basePath + this.showDetailS3Url.showPath + this.constantImg.horizontalSmall + this.showDetailObj.selectedPeripheral.thumbnail.horizontal.sourceLink;
      } else if (this.pageType == 'collection') {
        if (this.isHLSPlayed) {
          this.videoSrc = this.showDetailS3Url.basePath + this.showDetailS3Url.collectionPath + this.constantImg.hls + this.showDetailObj.selectedPeripheral.hlsSourceLink;
        } else {
          this.videoSrc = this.showDetailS3Url.basePath + this.showDetailS3Url.collectionPath + '/main-video/' + environment.videoBitRate + '/' + this.showDetailObj.selectedPeripheral.sourceLink;
        }
        this.posterPath = this.showDetailS3Url.basePath + this.showDetailS3Url.collectionPath + this.constantImg.horizontalSmall + this.showDetailObj.selectedPeripheral.thumbnail.horizontal.sourceLink;
      }
      // initialising the video player and start with a default time out interval
      var setTime = setTimeout(() => {
        this.videoJSplayer = videojs('show_player', { "poster": this.posterPath });
        var playFirstVideo = setTimeout(() => {
          this.videoJSplayer.on('volumechange', (data)=>{
            if(this.videoJSplayer.muted() == false){
              let remainingTime = this.showDetailObj.selectedPeripheral['duration'] - this.videoJSplayer.remainingTime();

              let obj = {'SHOW_ID' : this.showDetailObj['_id'], 'VIDEO_ID' : this.showDetailObj.selectedPeripheral['hlsSourceLink'],
                    'VIDEO_DURATION' : this.apiService.convertVideoTimeFormat(this.showDetailObj.selectedPeripheral['duration']),
                    'VIDEO_CONSUMED' : this.apiService.convertVideoTimeFormat(remainingTime)}
              this.apiService.getAmplitudeInstance('sdp_unmute', obj);
            }
          })
          this.videoJSplayer.play();
          setTimeout(() => {
            var isPlaying = !this.videoJSplayer.paused();
            if (isPlaying){
              this.isOpenDirectly = false;
            }
          }, 500);
          this.isVideoPlay = true;
          this.muteUnmuteVideo();
          clearInterval(playFirstVideo);
        }, environment.autoPlayVideoDuration); 
        clearInterval(setTime);
      }, 1000);
    }else{
      if (this.pageType == 'show') {
        this.posterPath = this.showDetailS3Url.basePath + this.showDetailS3Url.showPath + this.constantImg.horizontalSmall + this.showDetailObj.thumbnail.horizontal.ratio1.sourceLink;
      } else if (this.pageType == 'collection') {
        this.posterPath = this.showDetailS3Url.basePath + this.showDetailS3Url.collectionPath + this.constantImg.horizontalSmall + this.showDetailObj.thumbnail.horizontal.ratio1.sourceLink;
      }

      setTimeout(() => {
        this.videoJSplayer = videojs('show_player', { "poster": this.posterPath });
        this.isVideoPlay = true;
      }, environment.autoPlayVideoDuration);
    }

    this.selectedIndex=this.showDetailObj['mediaList'].findIndex(x => x['selectedPeripheralStatus']==='true');
    // show index is minus 1 (means above condition are not present) then set it to 0
    if(this.selectedIndex === -1 || !this.selectedIndex)
    {
      this.selectedIndex = 0;
    }

    this.apiService.saveUserData(this.showDetailObj._id, this.showDetailObj.slug, this.pageType);
  }

  redirectToConsumption(){
    let artist_ids = this.showDetailObj['artistList'].map(artistId => artistId.id);
    if(this.pageType=='show'){
      this.router.navigate(['consumption'], { queryParams: {type: 'showPheripheral', slug: this.showDetailObj['slug'], detailId: this.showDetailObj['mediaList'][this.selectedIndex]['id']} });
      this.apiService.getAmplitudeInstance('sdp_peripheral_click', {'VIDEO_ID': this.showDetailObj.selectedPeripheral['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.showDetailObj.selectedPeripheral['duration']), 'ARTIST_IDs': artist_ids});
    }else {
      this.router.navigate(['consumption'], { queryParams: {type: 'collectionPheripheral', slug: this.showDetailObj['slug'], detailId: this.showDetailObj['mediaList'][this.selectedIndex]['id']} });
    }
  }

  redirectToFullConsumption(){
    if(this.pageType=='show'){
      this.router.navigate(['full-consumption'], { queryParams: {type: 'show', slug: this.showDetailObj['slug'], seasonSlug: this.showSeasonObj[0]['slug']} });
    } else {
      this.router.navigate(['full-consumption'], { queryParams: {type: 'collection', slug: this.showDetailObj['slug']} });
    }
    let artist_ids = this.showDetailObj['artistList'].map(artistId => artistId.id);
    // // Amplitude code
    if(this.pageType == 'show') {
      this.amplitudeShowObj['SHOW_ID'] = this.showDetailObj['_id'];
      this.amplitudeShowObj['VIDEO_ID'] = this.showDetailObj.selectedPeripheral['hlsSourceLink'];
      this.amplitudeShowObj['VIDEO_DURATION'] = this.showDetailObj.selectedPeripheral['duration'];
      this.amplitudeShowObj['ARTIST_IDs'] = artist_ids;
      this.apiService.getAmplitudeInstance('sdp_play', this.amplitudeShowObj);
    }
    if(this.pageType == 'collection') {
      this.apiService.getAmplitudeInstance('cdp_play_click', {'COLLECTION_ID': this.showDetailObj['_id'], 'ARTIST_IDs': artist_ids, 'COLLECTION_NAME': this.showDetailObj['title']});
    }
  }

  muteUnmuteVideo() {
    let muteState = this.apiService.getMuteState();
    this.videoJSplayer.muted(muteState);
  }
  
  playPeripheralVideo(){
    this.videoJSplayer.play();
    this.isOpenDirectly = false;
  }

  // scroll event and check the video is in the viewport or not
  @HostListener("window:scroll", ['detailVideoElement'])
  elementInViewport(elName) {
    var el = elName.nativeElement;

    // play or pause the video according to the viewport
    if (this.apiService.identifyPlayPauseEvent(el)){
      if (!this.isVideoPlay) {
        this.videoJSplayer.play();
        this.isVideoPlay = true;
        this.isOpenDirectly = false;
      }
    } else{
      if (this.isVideoPlay) {
        this.videoJSplayer.pause();
        this.isVideoPlay = false;
      }
    }
  }
  
  // toggle text for see more and less
  toggleText() {
    let artist_ids = this.showDetailObj['artistList'].map(artistId => artistId.id);
    if (this.toggleDescription.status === "less") {
      this.toggleDescription.text = this.showDetailObj.description.slice(0, environment.showMoreLessLimit)+ '...';
      this.toggleDescription.status = 'more';
      this.toggleDescription.seeBtnText = this.language.details.seeMore;

      // Amplitude Show More Less Code
      if(this.pageType == 'collection') {
        this.apiService.getAmplitudeInstance('cdp_seeless', {'COLLECTION_ID': this.showDetailObj['_id'], 'ARTIST_IDs': artist_ids, 'COLLECTION_NAME': this.showDetailObj['title']});
      }
      if(this.pageType == 'show') { 
        this.apiService.getAmplitudeInstance('sdp_seelessdesc', {'VIDEO_ID': this.showDetailObj.selectedPeripheral['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.showDetailObj.selectedPeripheral['duration']), 'ARTIST_IDs': artist_ids});
      }

      return false;
    }
    else if (this.toggleDescription.status === 'more') {
      this.toggleDescription.text= this.showDetailObj.description;
      this.toggleDescription.status = 'less';
      this.toggleDescription.seeBtnText = this.language.details.seeLess;

      // Amplitude Show More Less Code
      if(this.pageType == 'collection') {
        this.apiService.getAmplitudeInstance('cdp_seemore', {'COLLECTION_ID': this.showDetailObj['_id'], 'ARTIST_IDs': artist_ids, 'COLLECTION_NAME': this.showDetailObj['title']});
      }
      if(this.pageType == 'show') {
        this.apiService.getAmplitudeInstance('sdp_showmoredesc', {'VIDEO_ID': this.showDetailObj.selectedPeripheral['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.showDetailObj.selectedPeripheral['duration']), 'ARTIST_IDs': artist_ids});
      }
    }
  }

  showArtistCard(artistData)
  {
    this.passSingleArtistId = artistData.id;
    this.showArtistCardView = !this.showArtistCardView;
    this.videoJSplayer.pause();
    $('body').addClass('noscroll');
  }

  quickViewToggle(){
    this.showArtistCardView = false;
    $('body').removeClass('noscroll');
    this.videoJSplayer.play();
  }

  artistChipEvent() {
    this.amplitudeArr = [];
      this.showDetailObj.artistList.forEach(item => {
        var id = 'artist_chip_' + item.id;
        // code to check element is in viewport - start
        if ($("#" + id).offset() != undefined) {
          var top_of_element = $("#" + id).offset().top;
          var left_of_element = $("#" + id).offset().left;
          var bottom_of_element = $("#" + id).offset().top + $("#" + id).outerHeight();
          var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
          var top_of_screen = $(window).scrollTop();
          // code to check element is in viewport - end

          if (top_of_element >=0 && left_of_element >= 0 && (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
            // the element is visible, do something
            this.amplitudeArr.push(item.id);
          }
        }
      });
  }

  onScroll(e){
    if(this.pageType == 'show') {
        this.artistChipEvent()
        var showObj = {'VIDEO_ID' : this.showDetailObj.selectedPeripheral['hlsSourceLink'],
              'VIDEO-DURATION' : this.apiService.convertVideoTimeFormat(this.showDetailObj.selectedPeripheral['duration']),
              'SHOW_ID' : this.showDetailObj['_id'],
              'ARTIST_IDs' : this.amplitudeArr}
              if (this.timer !== null) {
                clearTimeout(this.timer);
              }
              this.timer = setTimeout(() => {
                this.apiService.getAmplitudeInstance('sdp_artist_scroll', showObj);
              }, 150);
    }

    if(this.pageType == 'collection') {
      this.artistChipEvent()
      var collectionObj = {'ARTIST_IDs' : this.amplitudeArr}
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.apiService.getAmplitudeInstance('cdp_scroll_horizontal_artist', collectionObj);
      }, 150);
    }
  }

  muteToggle() {
    this.mute = !this.mute;
  }
}
