import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation, HostListener } from '@angular/core';
import { Constants } from '../shared/others/constants';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import * as $ from 'jquery';

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrls: ['./show-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShowDetailsComponent implements OnInit {
  faCaretDown = faCaretDown;
  constructor(private cd: ChangeDetectorRef, private route: ActivatedRoute, private apiService: ApiService) { }

  @ViewChild('showStageOriginalScroll', {static: false}) showStageOriginalScroll: CdkVirtualScrollViewport; 
  previousURL = '';
  amplitudeArr = [];
  userDetail={
    userId: null,
    slug: null,
    showId: null
  }
  
  showDetails={
    s3Url:null,
    showDescription:[],
    episodeList:[],
    lastSeenDetail:{},
    seasonList:[],
    activeSeason:0,
    isDataLoaded: false
  }

  showStageOriginalList={
    offset:0, //first record of the page number
    limit:10,
    s3Url:null,
    data:[],
    noMoreData: true
  }

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudeSeasonObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  screen_type = 'show-details';

  pageType = 'show';
  seasonBottomVisible:boolean= false; 
  actionBottomVisible: boolean =false;
  isQuickviewVisible:boolean = false;
  lang;
  

  ngOnInit() {
    this.userDetail.userId=this.apiService.getUserId();
    this.previousURL = this.apiService.getPreviousUrl();
    this.lang = this.route.snapshot.data.lang;

    this.route.params.subscribe(params => {      
      this.userDetail.slug = params['slug'];
      this.resetScope();
    });

    this.apiService.openSharedPopup.subscribe(show => {
      this.actionBottomVisible = show;
    });
  }

  resetScope(){

    this.showDetails = {
      s3Url: null,
      showDescription: [],
      episodeList: [],
      lastSeenDetail: {},
      seasonList: [],
      activeSeason: 0,
      isDataLoaded: false
    }

    this.showStageOriginalList = {
      offset: 0, //first record of the page number
      limit: 10,
      s3Url: null,
      data: [],
      noMoreData: true
    }

    this.pageType = 'show';
    this.seasonBottomVisible = false;
    this.actionBottomVisible = false;
    this.isQuickviewVisible = false;
    
    setTimeout(() => {
      this.getShowDetails();
    }, 1000)
  }

  // get show details
  getShowDetails() {
    this.apiService.manageLoader(true);
    let url = Constants.url.getShowDetails + '?slug=' + this.userDetail.slug;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.showDetails.isDataLoaded = true;
        
        this.showDetails.showDescription = response['data']['showDetail'];
        this.showDetails.episodeList = response['data']['episodeList'];
        this.showDetails.seasonList = response['data']['seasonList'];
        this.showDetails.lastSeenDetail = response['data']['lastSeenDetail'];

        this.getMediumAmplitude(this.previousURL)

        this.showDetails.s3Url = response['data']['s3Url'];
        if (!!this.userDetail.userId && this.showDetails.lastSeenDetail['seasonId'] !== undefined){
          this.showDetails.seasonList.forEach((item, index) => {
            if (this.showDetails.lastSeenDetail['seasonId'] == item['_id']){
              this.showDetails.activeSeason = index;
            }
          });
        }    
        
        this.getShowOrginalList();
      } else {
        this.showDetails.isDataLoaded = false;
      }
      this.apiService.manageLoader(false);
    })
  }

  // get show original listing with details 
  getShowOrginalList() {
    let url = Constants.url.getShowOriginalList + '?limit=' + this.showStageOriginalList.limit + '&offset=' + this.showStageOriginalList.offset + '&showId=' + this.showDetails.showDescription['_id'];

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.showStageOriginalList.s3Url = response['data']['s3Url'];
        this.showStageOriginalList.data = this.showStageOriginalList.data.concat(response['data']['showStageOriginalList']);

        this.cd.detectChanges();
        if (response['data']['showStageOriginalList'].length == this.showStageOriginalList.limit) {
          this.showStageOriginalList.noMoreData = false;
          this.showStageOriginalList.offset = this.showStageOriginalList.limit + this.showStageOriginalList.offset;
        } else {
          this.showStageOriginalList.noMoreData = true;
        }

        setTimeout(() => {
          this.setDivHeight('showStageOriginal_item', 'showStageOriginal_hScroll')
        }, 1000);
      } else {
        console.log('Something went wrong');
      }
    })
  }

  // quick view toggle on info icon
  quickViewToggle(detail) {
    this.isQuickviewVisible = detail.show;

    if (detail.show){
      var scroller = setTimeout(() => {
        var p = $(".episodelist_quickview #episode_" + detail.id);
        var position = p.position();
        $(".episodelist_quickview").animate({ scrollLeft: (position.left - 30) }, 1000);
        clearTimeout(scroller);
        setTimeout(() => {
          $(".episodelist_quickview").removeClass('invisible');
        }, 1000);
      }, 500);
    }else{
      $(".episodelist_quickview").addClass('invisible');
    }
    $('body').removeClass('noscroll');
  }

  actionViewToggle(show: boolean) {
    this.actionBottomVisible = show;
  }

  // change season functionality
  changeSeason(seasonId: number) {
    this.showDetails.activeSeason = seasonId;
    this.getNextEpisodeList()
  }

  // get episode list on selecting the season from the dropdown
  getNextEpisodeList(){
    let url = Constants.url.getShowEpisodeList+'?&seasonId='+this.showDetails.seasonList[this.showDetails.activeSeason]['_id']+'&showSlug='+this.userDetail.slug;
    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200 || response['responseCode'] == 204) {
        this.showDetails.episodeList = response['data']['episodeList'];
      } else {
        this.showDetails.episodeList = [];
      }
    })
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName){
    if(objInitName === 'showStageOriginal') {
      this.getViewPort();
      var obj = { "SHOW_IDs": this.amplitudeArr };
      this.apiService.getAmplitudeInstance('sdp_similarscroll', obj);
    }
    if(!this[objInitName+'List']['noMoreData'])
    {
      const end = this[objInitName+'Scroll'].getRenderedRange().end;
      const total = this[objInitName+'Scroll'].getDataLength();
      if (end === total) {
        this[objInitName + 'List']['noMoreData'] = true;
        this[functionName]();
      }
    }
  }

  // identify the view port and trigger the amplitude
  getViewPort() {
    this.amplitudeArr = [];
    this.showStageOriginalList.data.forEach(item => {
      var id = 'showStageOriginal_item_' + item._id;
      // code to check element is in viewport - start
      if ($("." + id).offset() != undefined) {
        
        var top_of_element = $("." + id).offset().top;
        var left_of_element = $("." + id).offset().left;
        var bottom_of_element = $("." + id).offset().top + $("." + id).outerHeight();
        var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
        var top_of_screen = $(window).scrollTop();
        // code to check element is in viewport - end

        if (top_of_element >=0 && left_of_element >= 0 && (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          // the element is visible, do something
          if(this.amplitudeArr.includes(item._id) == false) { 
            this.amplitudeArr.push(item._id);
          } 
        }
      }
    })
  }

  // set the dynamic div height
  setDivHeight(sub_div_id, main_div_id) {
    var boxes = document.getElementById(sub_div_id).offsetHeight + 5;
    document.getElementById(main_div_id).style.minHeight = boxes + "px";
  }

  // trigger amplitude on swith tab
  switchTab(tabEventName) {
      this.apiService.getAmplitudeInstance(tabEventName, this.amplitudeObj);
  }

  // back amplitude event
  amplituteBackEvent() {
    var artist_ids = this.showDetails.showDescription['artistList'].map(artist_id => artist_id.id)
    let obj ={'ARTIST_IDs' : artist_ids,
      'SHOW_ID' : this.showDetails.showDescription['_id'],
      'VIDEO_ID' :  this.showDetails.showDescription['selectedPeripheral']['hlsSourceLink'],
      'VIDEO_DURATION' : this.apiService.convertVideoTimeFormat(this.showDetails.showDescription['selectedPeripheral']['duration']),
      'VIDEO_FULLSCREEN' : 0};
      this.apiService.getAmplitudeInstance('sdp_back', obj);
  }
  
  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.amplituteBackEvent();
  }

  // Amplitude Code for Season
  onSeasonClick(obj) {
    var amplitude_obj = {"ARTIST_IDs": obj._id, "SHOW_ID": obj.showId};
    this.apiService.getAmplitudeInstance('sdp_seasons_click', amplitude_obj);
  }

  getMediumAmplitude(url) {
    if(url == '/') { 
      var sdp_landing = {'SHOW_ID': this.showDetails.showDescription['_id'], 'MEDIUM': 'Home'}
      this.apiService.getAmplitudeInstance('sdp_landing', sdp_landing);
      this.apiService.getAmplitudeInstance('ss_show_click', {'SHOW_ID': this.showDetails.showDescription['_id'], 'SHOW_NAME': this.showDetails.showDescription['title']});
    }

    if(url.includes("search")) {
      this.apiService.getAmplitudeInstance('sdp_landing', {'SHOW_ID': this.showDetails.showDescription['_id'], 'MEDIUM': 'Search'});
      this.apiService.getAmplitudeInstance('search_showclick', {'SHOW_ID': this.showDetails.showDescription['_id'], 'SHOW_NAME': this.showDetails.showDescription['title']});
    }

    if(url.includes("show-list")) {
      let artist_id = this.showDetails.showDescription['artistList'].map(artist_id => artist_id.id);
      this.apiService.getAmplitudeInstance('slp_show_click', {'SHOW_ID': this.showDetails.showDescription['_id'], 'SHOW_NAME': this.showDetails.showDescription['title'], 'ARTIST_IDs': artist_id});
      this.apiService.getAmplitudeInstance('sdp_landing', {'SHOW_ID': this.showDetails.showDescription['_id'], 'MEDIUM': 'Show List'});
    }

    if(url.includes("artist-landscape")) {
      let artist_id = this.showDetails.showDescription['artistList'].map(artist_id => artist_id.id);
      this.apiService.getAmplitudeInstance('aldp_show_click', {'SHOW_ID': this.showDetails.showDescription['_id'], 'ARTIST_IDs': artist_id});
      this.apiService.getAmplitudeInstance('sdp_landing', {'SHOW_ID': this.showDetails.showDescription['_id'], 'MEDIUM': 'Artist Landscape'});
    }
  }
}
