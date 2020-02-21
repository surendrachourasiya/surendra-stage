import { Component, OnInit, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/others/api.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Constants } from '../shared/others/constants';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})

export class CollectionDetailsComponent implements OnInit {
  faChevronDown = faChevronDown;
  previousURL = '';
  amplitudeArr = [];
  amplitudeCollectionArr = [];

  constructor(private cd: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private apiService: ApiService) { }

  @ViewChild('stageCollectionScroll', { static: false }) stageCollectionScroll: CdkVirtualScrollViewport;
  @ViewChild('stageSimilarContentScroll', { static: false }) stageSimilarContentScroll: CdkVirtualScrollViewport;

  collectionDetails={
    s3Url:null,
    detail:[],
    episodeList:[],
    collectionLastSeen:[],
    limit:5,
    offset:0,
    allRecords: false,
    id: null,
    isDataLoaded: false,
    slug: ''
  }

  stageCollectionList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  stageSimilarContentList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    episodeId: 1,
    flag: true,
    noMoreData: true
  }

  amplitudeObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  episodeIdArr = {
    id: []
  }

  isQuickviewVisible: boolean = false;
  isQuickviewVisibleSimilarContent: boolean = false;
  actionBottomVisible: boolean = false;
  pageType = 'collection';
  lang;
  timer = null;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.previousURL = this.apiService.getPreviousUrl();
    this.route.params.subscribe(params => {
      this.collectionDetails.slug = params['slug'];
      this.resetScope(this.collectionDetails.slug);   
    });

    this.apiService.openSharedPopup.subscribe(show => {
      this.actionBottomVisible = show;
    });
  }

  // reset the variable on change of the url
  resetScope(collectionSlug) {
    this.collectionDetails = {
      s3Url: null,
      detail: [],
      episodeList: [],
      collectionLastSeen:[],
      limit: 5,
      offset: 0,
      allRecords: false,
      id: null,
      isDataLoaded: false,
      slug: ''
    }

    this.stageCollectionList = {
      offset: 0,
      limit: 10,
      s3Url: null,
      data: [],
      noMoreData: false
    }

    this.isQuickviewVisible = false;
    this.isQuickviewVisibleSimilarContent = false;
    this.actionBottomVisible = false;
    this.pageType = 'collection';

    if (!!collectionSlug) {
      this.getCollecitonDetails(collectionSlug);
    }
  }

  // show/hide the quick view panel of collection episodes
  quickViewToggle(detail) {
    this.isQuickviewVisible = detail.show;

    if (detail.show) {
      var scroller = setTimeout(() => {
        var p = $(".episodelist_quickview #episode_" + detail.id);
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

  // show/hide the quick view panel of similar content
  quickViewSimilarContentToggle(detail) {
    this.isQuickviewVisibleSimilarContent = detail.show;

    if (detail.show) {
      var scroller = setTimeout(() => {
        var p = $(".episodelist_quickviewnew #episode_" + detail.id);
        var position = p.position();
        $(".episodelist_quickviewnew").animate({ scrollLeft: (position.left - 30) }, 1000);
        clearTimeout(scroller);
        setTimeout(() => {
          $(".episodelist_quickviewnew").removeClass('invisible');
        }, 1000);
      }, 500);
    } else {
      $(".episodelist_quickviewnew").addClass('invisible');
    }
  }

  actionViewToggle(show: boolean) {
    this.actionBottomVisible = show;
  }

  // redirection on feed consumption 
  redirectSimilarContent(event:number){
    this.router.navigate(['feed-consumption'], { queryParams: {type: 'episode', episodeSlug: this.stageSimilarContentList.data[event]['slug']} });
  }

  // get collection details api call
  getCollecitonDetails(collectionSlug){
    this.apiService.manageLoader(true);
    let url = Constants.url.getCollectionDetailDesc + '?limit=' + this.collectionDetails.limit + '&offset=' + this.collectionDetails.offset + '&slug=' + collectionSlug;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.collectionDetails.detail = response['data']['collectionDetail'];
        this.collectionDetails.episodeList =response['data']['episodeList'];
        this.collectionDetails.collectionLastSeen =response['data']['collectionLastSeen'];
        this.collectionDetails.s3Url = response['data']['s3Url'];

        if (this.collectionDetails.detail['episodeCount'] > this.collectionDetails.limit) {
          this.collectionDetails.allRecords = true;
        }

        this.getMediumAmplitude(this.previousURL)

        this.collectionDetails.isDataLoaded = true;
        this.collectionDetails.offset = this.collectionDetails.limit;
        this.collectionDetails.limit = this.collectionDetails.detail['episodeCount'];

        this.getStageCollectionList();
        setTimeout(() => {
          this.getstageSimilarContentList();
        }, 2000);
      }
      this.apiService.manageLoader(false);
    })
  }

  // get the collection remaining list API call
  getCollectionRemainingList(){
    if(this.collectionDetails.allRecords)
    {
      this.collectionDetails.allRecords = false;
      let url = Constants.url.getCollectionMediaList + '?collectionSlug=' + this.collectionDetails.detail['slug'] + '&limit=' + this.collectionDetails.limit + '&offset=' + this.collectionDetails.offset;
      this.apiService.getApiData(url).subscribe(response => {
        if (response['responseCode'] == 200) {
          this.collectionDetails.episodeList = this.collectionDetails.episodeList.concat(response['data']['episodeList']);
          this.collectionDetails.s3Url = response['data']['s3Url'];
        }
      })
    }

    // Amplitude Code For Load remaining episode
    this.apiService.getAmplitudeInstance('cdp_showmore_epi', { 'COLLECTION_ID': this.collectionDetails.detail['_id'], 'COLLECTION_NAME': this.collectionDetails.detail['title'] });
  }

  // get Stage collection list data api call
  getStageCollectionList(){
    let url = Constants.url.getCollectionList + '?limit=' + this.stageCollectionList.limit + '&offset=' + this.stageCollectionList.offset + '&collectionId=' + this.collectionDetails.detail['_id'];

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
          this.setDivHeight('collectionListing_item', 'collectionListing_hScroll')
        }, 1000);
      }
      else {
        this.stageCollectionList.noMoreData = true;
      }
    })
  }

  // get similar content list api call
  getstageSimilarContentList() {
    let url = Constants.url.getSimilarContent + '?limit=' + this.stageSimilarContentList.limit + '&offset=' + this.stageSimilarContentList.offset + '&collectionId=' + this.collectionDetails.detail['_id'];

    let reqData = {
      "subGenreList": this.collectionDetails.detail['subGenreList'],
      "limit": this.stageSimilarContentList.limit,
      "offset": this.stageSimilarContentList.offset,
      "episodeId": this.stageSimilarContentList.episodeId,
      "flag": this.stageSimilarContentList.flag
    }

    this.apiService.getPostData(url, reqData).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.stageSimilarContentList.s3Url = response['data']['s3Url'];
        this.stageSimilarContentList.data = this.stageSimilarContentList.data.concat(response['data']['similarContent']);

        this.cd.detectChanges();
        if (response['data']['similarContent'].length == this.stageSimilarContentList.limit) {
          this.stageSimilarContentList.noMoreData = false;
          this.stageSimilarContentList.offset = this.stageSimilarContentList.limit + this.stageSimilarContentList.offset;
        } else {
          this.stageSimilarContentList.noMoreData = true;
        }

        setTimeout(() => {
          this.setDivHeight('similarContentListing_item', 'similarContentListing_hScroll')
        }, 1000);
      }
      else {
        this.stageSimilarContentList.noMoreData = true;
      }
    })
  }

  // identify the element in the view port and emit the amplitude
  getViewPort(item_id, data) {
    this.amplitudeArr = [];
    this.amplitudeCollectionArr = [];
    data.forEach(item => {
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
            if (item_id == 'similarContent_item_') {
              this.amplitudeArr.push(item._id);
            }
            if (item_id == 'similarCollection_item_') {
              this.amplitudeCollectionArr.push(item._id);
            }
          }
        }
          return false;
      }
    })
  }

  // check the element is available in the view port
  checkIfElementIsWithinViewport(element) {
    return element[0].getBoundingClientRect();
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName, event) {
    if (objInitName == 'stageSimilarContent') {
      this.getViewPort('similarContent_item_', this.stageSimilarContentList.data);
      let obj = { "CONTENT_IDS": this.amplitudeArr };
      this.apiService.getAmplitudeInstance('cdp_scroll_similar_horizontal', obj);
    }
    if (objInitName == 'stageCollection') {
      this.getViewPort('similarCollection_item_', this.stageCollectionList.data);
      this.apiService.getAmplitudeInstance('cdp_similarcol_scroll', { "COLLECTIO_IDs": this.amplitudeCollectionArr });
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

  // set the div height dynamically
  setDivHeight(sub_div_id, main_div_id) {
    var boxes = document.getElementById(sub_div_id).offsetHeight + 5;
    document.getElementById(main_div_id).style.minHeight = boxes + "px";
  }

  switchTab(tab) {
    // if(tab == 'episodes') {
    //   this.apiService.getAmplitudeInstance('sdp_episodebtn_click', this.amplitudeObj);
    // }
    if (tab == 'trailersMore') {
      this.apiService.getAmplitudeInstance('cdp_trailer_click', {});
    }
  }

  getMediumAmplitude(url) {
    let artist_ids = this.collectionDetails.detail['artistList'].map(artistId => artistId.id);
    let artist_names = this.collectionDetails.detail['artistList'].map(artistName => artistName.name);
    if (url == '/') {
      this.apiService.getAmplitudeInstance('collectionlist_click', { 'COLLECTION_ID': this.collectionDetails.detail['_id'], 'COLLECTION_NAME': this.collectionDetails.detail['title'], 'ARTIST_IDs': artist_ids, 'ARTIST_NAMEs': artist_names });
      this.apiService.getAmplitudeInstance('cdp_similarcol_click', { 'COLLECTION_ID': this.collectionDetails.detail['_id'], 'COLLECTION_NAME': this.collectionDetails.detail['title']});
      this.apiService.getAmplitudeInstance('cdp_landing', { 'ARTIST_ID': this.collectionDetails.detail['_id'], 'MEDIUM': 'Home' });
    } else if (url.includes("artist-landscape")) {
      this.apiService.getAmplitudeInstance('aldp_collection_click', { 'ARTIST_ID': artist_ids, 'COLLECTION_ID': this.collectionDetails.detail['_id'] });
      this.apiService.getAmplitudeInstance('cdp_landing', { 'ARTIST_ID': this.collectionDetails.detail['_id'], 'MEDIUM': 'Artist Landscape' });
    } else if (url == '/collection-list') {
      this.apiService.getAmplitudeInstance('clp_collection_click', { 'ARTIST_IDs': artist_ids, 'COLLECTION_ID': this.collectionDetails.detail['_id'], 'COLLECTION_NAME': this.collectionDetails.detail['title'] });
      this.apiService.getAmplitudeInstance('cdp_landing', { 'ARTIST_ID': this.collectionDetails.detail['_id'], 'MEDIUM': 'Collection List' });
    } else if (this.previousURL.includes("search")) {
      this.apiService.getAmplitudeInstance('search_collectionclick', { 'COLLECTION_ID': this.collectionDetails.detail['_id'], 'COLLECTION_NAME': this.collectionDetails.detail['title'] });
      this.apiService.getAmplitudeInstance('cdp_landing', { 'ARTIST_ID': this.collectionDetails.detail['_id'], 'MEDIUM': 'Search' });
    }
  }

  // amplitude event on back click of the page
  amplituteBackEvent() {
    let artist_ids = this.collectionDetails.detail['artistList'].map(artist_id => artist_id.id);
    let artist_names = this.collectionDetails.detail['artistList'].map(artist_name => artist_name.name);

    this.apiService.getAmplitudeInstance('cdp_back_click',
      { 'ARTIST_IDs': artist_ids, 'ARTIST_NAMEs': artist_names, 'COLLECTION_ID': this.collectionDetails.detail['_id'] }
    );
  }

  // Emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.amplituteBackEvent();
  }

  // Emit amplitude episode event when vertical scroll
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.episodeIdArr.id = [];
    this.collectionDetails.episodeList.forEach(item => {
      var id = 'episode_card_' + item._id;

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
                if (this.timer !== null) {
                  clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                  this.episodeIdArr.id.push(item._id);
                  var episodeIdObj = { 'EPISODE_IDs': this.episodeIdArr.id};
                  this.apiService.getAmplitudeInstance('cdp_scroll_episode', episodeIdObj);
                }, 150);
              }
            }
          }
    });
  }
}
