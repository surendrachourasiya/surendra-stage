import { Component, ViewChild, OnInit, ViewEncapsulation, ChangeDetectorRef, HostListener } from '@angular/core';
import { faPlayCircle, faChevronDown, faChevronCircleDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from '../shared/others/api.service';
import { Constants } from '../shared/others/constants';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-artist-landscape',
  templateUrl: './artist-landscape.component.html',
  styleUrls: ['./artist-landscape.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ArtistLandscapeComponent implements OnInit {
  faPlayCircle = faPlayCircle;
  faChevronDown = faChevronDown;
  faChevronCircleDown = faChevronCircleDown;
  faArrowLeft = faArrowLeft;
  isSeeMoreOn = false;
  lastScrollTop = 0;
  imageWidth = 100;
  imageHeight = 100;
  artistId = null;
  artistSlug = null;
  isQuickviewVisible: boolean = false;
  actionBottomVisible: boolean = false;
  lang;
  artistUrl : {} = {};
  previousURL = '';

  artistListArr = {
    id: [],
    name: []
  }

  amplitudeObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  @ViewChild('artistScroll', { static: false }) artistScroll: CdkVirtualScrollViewport;
  @ViewChild('showStageOriginalScroll', { static: false }) showStageOriginalScroll: CdkVirtualScrollViewport;
  @ViewChild('stageCollectionScroll', { static: false }) stageCollectionScroll: CdkVirtualScrollViewport;

  showStageOriginalList = {
    offset: 0, //first record of the page number
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  stageCollectionList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  artistList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  artistDetail={
    s3Url:null,
    data:null
  }

  showDetails = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    totalData: [],
    dataCount: 0,
    dataLimit: 5,
    showMoreButton: false,
    noMoreData: false
  }

  public constantImg: any;

  constructor(private cd: ChangeDetectorRef, public router: Router, private route: ActivatedRoute, private apiService: ApiService, ) {
    this.constantImg = Constants.image;
  }

  ngOnInit() {
    this.previousURL = this.apiService.getPreviousUrl();

    this.lang = this.route.snapshot.data.lang;
    this.route.params.subscribe(params => {
      this.artistUrl = { 'title': '/artist-landscape/' + params };
      this.artistDetail = {
        s3Url: null,
        data: null
      }
      this.artistSlug = params['slug'];
      this.resetState();
    });

    this.apiService.openSharedPopup.subscribe(show => {
      this.actionBottomVisible = show;
    });
  }

  getMediumAmplitude(url) {
    if (url.includes('show-details')) {
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Show Details' });
    } else if (url === '/') { 
      this.apiService.getAmplitudeInstance('artsitlist_artistclick', { 'ARTIST_ID': this.artistDetail.data['_id'], 'ARTIST_NAME': this.artistDetail.data['firstName'] });
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Home' });
      this.apiService.getAmplitudeInstance('aldp_similar_artistclick', { 'ARTIST_ID': this.artistDetail.data['_id'], 'ARTIST_NAME': this.artistDetail.data['firstName'] });
    } else if (url.includes('collection-details')) {
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Collection Details' });
    } else if (url.includes('artist-list')) {
      this.apiService.getAmplitudeInstance('alp_artist_click', { 'ARTIST_ID': this.artistDetail.data['_id'], 'ARTIST_NAME': this.artistDetail.data['firstName'] });
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Artist List' });
    } else if (url.includes('feed-consumption')) {
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Feed Consumption' });
    } else if (url.includes('search')) {
      this.apiService.getAmplitudeInstance('search_artistclick', { 'ARTIST_ID': this.artistDetail.data['_id'], 'ARTIST_NAME': this.artistDetail.data['firstName'], 'MEDIUM': 'Feed Consumption' });
      this.apiService.getAmplitudeInstance('aldp_landing', { 'ARTIST_ID': this.artistDetail.data['_id'], 'MEDIUM': 'Search' });
    }
  }

  resetState() {
    this.showStageOriginalList = {
      offset: 0, //first record of the page number
      limit: 10,
      s3Url: null,
      data: [],
      noMoreData: false
    }

    this.stageCollectionList = {
      offset: 0,
      limit: 10,
      s3Url: null,
      data: [],
      noMoreData: false
    }

    this.artistList = {
      offset: 0,
      limit: 10,
      s3Url: null,
      data: [],
      noMoreData: false
    }

    this.artistDetail = {
      s3Url: null,
      data: null
    }

    this.showDetails = {
      offset: 0,
      limit: 10,
      s3Url: null,
      data: [],
      totalData: [],
      dataCount: 0,
      dataLimit: 5,
      showMoreButton: false,
      noMoreData: false
    }
    // call an api for get the artist detail again
    this.getArtistDetail();
  }

  // API call for get the artist detail
  getArtistDetail(){
    this.apiService.manageLoader(true);
    let url = Constants.url.getArtistDetail + '?artistSlug=' + this.artistSlug;
    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.artistId = response['data']['artistDetail']['_id'];
        this.artistDetail.s3Url = response['data']['s3Url'];
        this.artistDetail.data = response['data']['artistDetail'];

        this.getMediumAmplitude(this.previousURL)

        this.apiService.manageLoader(false);
        this.getArtistShowList();
        this.getArtistCollectionList();
        this.getEpisodeCardList();
        this.getArtistList();
        this.apiService.saveUserData(this.artistId, this.artistSlug, 'artist');
      } else {
        this.getArtistList();
      }
    })
  }

  // Amplitude code
  onPlayArtist(artist_id) {
    this.amplitudeObj['Artist_ID'] = artist_id;
    this.apiService.getAmplitudeInstance('aldp_playartist', this.amplitudeObj);
  }

  // Amplitude code
  onExpandDesc(artist_id) {
    this.amplitudeObj['Artist_ID'] = artist_id;
    this.apiService.getAmplitudeInstance('aldp_expanddesc', this.amplitudeObj);
  }

  // show/hide the quick view toggle list
  quickViewToggle(show) {
    this.isQuickviewVisible = show.show;
    if (show.show) {
      var scroller = setTimeout(() => {
        var p = $(".episodelist_quickview #episode_" + show.id);
        var position = p.position();
        $(".episodelist_quickview").animate({ scrollLeft: (position.left - 30) }, 1000);
        clearTimeout(scroller);
        setTimeout(() => {
          $(".episodelist_quickview").removeClass('invisible');
        }, 1000);
      }, 500);
    } else {
      $(".episodelist_quickview").addClass('invisible');
    }

    $('body').removeClass('noscroll');
  }

  actionView(show: boolean) {
    this.actionBottomVisible = show;
  }

  // get show original listing with details 
  getArtistShowList() {
    let url = Constants.url.getShowOriginalList + '?artistId=' + this.artistId + '&limit=' + this.showStageOriginalList.limit + '&offset=' + this.showStageOriginalList.offset;

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
          this.setDivHeight('stage_original_card', 'stageOrig_hScroll')
        }, 1000);
      }
      else {
        this.showStageOriginalList.noMoreData = true;
      }
    })
  }

  // get Stage collection list data
  getArtistCollectionList() {
    let url = Constants.url.getCollectionList + '?artistId=' + this.artistId + '&limit=' + this.stageCollectionList.limit + '&offset=' + this.stageCollectionList.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.stageCollectionList.s3Url = response['data']['s3Url'];
        this.stageCollectionList.data = this.stageCollectionList.data.concat(response['data']['collectionDetails']);

        this.cd.detectChanges();
        if (response['data']['collectionDetails'].length == this.stageCollectionList.limit) {
          this.stageCollectionList.noMoreData = false;
          this.stageCollectionList.offset = this.stageCollectionList.limit + this.stageCollectionList.offset;
        } else {
          this.stageCollectionList.noMoreData = true;
        }

        setTimeout(() => {
          this.setDivHeight('collection_original_card', 'collectionOrig_hScroll')
        }, 1000);
      }
      else {
        this.stageCollectionList.noMoreData = true;
      }
    })
  }

  // get artist list with details 
  getArtistList(){
    let reqData = {
      "subGenreList": this.artistDetail.data.subGenreList,
      "limit": this.artistList.limit,
      "offset": this.artistList.offset,
      "artistId": this.artistId
    }

    this.apiService.getPostData(Constants.url.similarArtistList, reqData).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.artistList.s3Url = response['data']['s3Url'];
        this.artistList.data = this.artistList.data.concat(response['data']['similarArtistList']);

        this.cd.detectChanges();
        if (response['data']['similarArtistList'].length == this.artistList.limit) {
          this.artistList.noMoreData = false;
          this.artistList.offset = this.artistList.limit + this.artistList.offset;
        } else {
          this.artistList.noMoreData = true;
        }

        setTimeout(() => {
          this.setDivHeight('artist_card', 'artistOrig_hScroll')
        }, 1000);
      } else {
        this.artistList.noMoreData = true;
      }
    });
  }

  // get artist list with details 
  getEpisodeCardList() {
    let url = Constants.url.getArtistEpisodeList + '?artistId=' + this.artistId + '&limit=' + this.showDetails.limit + '&offset=' + this.showDetails.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.showDetails.s3Url = response['data']['s3Url'];
        this.showDetails.data = response['data']['artistEpisodeList'];
        this.showDetails.totalData = response['data']['artistEpisodeList'];
        this.showDetails.dataCount = this.showDetails.data.length;
        if (this.showDetails.dataCount > this.showDetails.dataLimit) {
          this.showDetails.data = response['data']['artistEpisodeList'].slice(0, this.showDetails.dataLimit);
          this.showDetails.showMoreButton = true;
        } else {
          this.showDetails.showMoreButton = false;
        }

        this.cd.detectChanges();
        if (response['data']['artistEpisodeList'].length == this.showDetails.limit) {
          this.showDetails.noMoreData = false;
          this.showDetails.offset = this.showDetails.limit + this.showDetails.offset;
        } else {
          this.showDetails.noMoreData = true;
        }
      }
      else {
        this.showDetails.noMoreData = true;
      }
    })
  }

  // click event on show more episode button
  showMoreEpisode() {
    this.showDetails.showMoreButton = false;
    this.showDetails.data = [];
    this.showDetails.data = this.showDetails.totalData;
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName, $event) {
    if (objInitName == 'artist') {
      this.getViewPort('artist_item_', this.artistList.data);
      var artistObj = { 'ARTIST_ID': this.artistListArr.id, 'ARTIST_NAME': this.artistListArr.name };
      if(!!this.artistListArr.id.length) {
        this.apiService.getAmplitudeInstance('aldp_similar_scroll', artistObj);
      }
    }

    if (!this[objInitName + 'List']['noMoreData']) {
      const end = this[objInitName + 'Scroll'].getRenderedRange().end;
      const total = this[objInitName + 'Scroll'].getDataLength();
      if (end === total) {
        this[objInitName + 'List']['noMoreData'] = true;
        this[functionName]();
      }
    }
  }

  setDivHeight(sub_div_id, main_div_id) {
    var boxes = document.getElementById(sub_div_id).offsetHeight + 5;
    document.getElementById(main_div_id).style.minHeight = boxes + "px";
  }

  getViewPort(item_id, data) {

    this.artistListArr.id = [];
    this.artistListArr.name = [];

    data.forEach((item, index) => {
      var id = item_id + item._id;
      // code to check element is in viewport - start
      if ($("." + id).offset() != undefined) {
        // this.checkIfElementIsWithinViewport($("." + id));
        if ((id != undefined) && (id != null)) {
          var element_offets = this.checkIfElementIsWithinViewport($("." + id));
          if (
            (element_offets.top >= 0) &&
            (element_offets.left >= 0) &&
            (element_offets.bottom <= window.innerHeight) &&
            (element_offets.right <= window.innerWidth)
          ) {
            if (item_id == 'artist_item_') {
              this.artistListArr.id.push(item._id);
              this.artistListArr.name.push(item.firstName);
            }
            // console.log(this.amplitudeArr)
          }
        } else {
          return false;
        }
      }
    })
  }

  checkIfElementIsWithinViewport(element) {
    return element[0].getBoundingClientRect();
  }

  // after init code
  ngAfterViewInit(): void { }
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    const tempScrollTop = $(window).scrollTop();
    if (tempScrollTop >= 445 ) {
      $('#stickcy_header').slideDown();
    } else {
      $('#stickcy_header').slideUp();
    }
  }

  // redirect to previous url on click of back button
  redirectPrevious(artist_id) {
    this.amplitudeObj['Artist_ID'] = artist_id;
    this.apiService.getAmplitudeInstance('aldp_back', this.amplitudeObj);
    var url = history.back();
    this.router.navigate([url]);
  }

  // amplitude code on story watch
  onWatchStory(data) {
    var artistObj = { 'ARTIST_ID': data._id, 'VIDEO_ID': data.story.hlsSourceLink }
    this.apiService.getAmplitudeInstance('aldp_playstory', artistObj);
  }

  // open share popup
  showSharePopup() {
    this.apiService.openPopup(true);
    $('body').addClass('noscroll');
  }
}
