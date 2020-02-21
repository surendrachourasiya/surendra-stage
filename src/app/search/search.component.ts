import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit, ComponentFactoryResolver } from '@angular/core';
import { faChevronDown, faArrowLeft, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import * as $ from 'jquery';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  title = 'Search';
  faChevronDown = faChevronDown;
  faArrowLeft = faArrowLeft;
  faSearch = faSearch;
  faTimes = faTimes;
  @ViewChild('artistScroll', { static: false }) artistScroll: CdkVirtualScrollViewport;
  @ViewChild('showStageOriginalScroll', { static: false }) showStageOriginalScroll: CdkVirtualScrollViewport;
  @ViewChild('stageCollectionScroll', { static: false }) stageCollectionScroll: CdkVirtualScrollViewport;
  @ViewChild('continueWatchingScroll', { static: false }) continueWatchingScroll: CdkVirtualScrollViewport;

  public searchTextChanged = new Subject<KeyboardEvent>();
  private subscription: Subscription;
  showBackArrow = false;

  constructor(private cd: ChangeDetectorRef, private apiService: ApiService, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) { }

  lang;
  amplitudeArtistArr = [];
  amplitudeShowArr = [];
  amplitudeCollectionArr = [];

  searchNoResult = false;
  isQuickviewVisible: boolean = false;
  actionBottomVisible: boolean = false;
  searchText = '';
  isEmptyData = true;

  artistList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

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

  showDetails = {
    s3Url: null,
    showDescription: [],
    episodeList: [],
    episodeList1: [],
    episodeCount: 0,
    episodeLimit: 5,
    showMoreBtn: false,
    lastSeenDetail: {},
    seasonList: [],
    activeSeason: 0
  }

  amplitudeObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  amplitudeSearchTypeObj = {
    User_ID: 'null',
    TIMESTAMP: ''
  }

  url = '';

  ngOnInit(): void {
    this.lang = this.route.snapshot.data.lang;

    this.subscription = this.searchTextChanged.pipe(debounceTime(500), mergeMap(search => this.apiService.getApiData(this.url))).subscribe((response) => {
      // this.searchNoResult = false;
      if (response['responseCode'] == 200 && !this.isEmptyData) {
        // this.spinner.hide();
        this.showDetails.showMoreBtn = false;

        if (response['data']['artistList'].length === 0 && response['data']['showList'].length === 0 && response['data']['collectionList'].length === 0 && response['data']['episodeList'].length === 0) {
          this.searchNoResult = true;
          this.setSearchData({});
        } else {
          this.searchNoResult = false;
          this.setSearchData(response);
        }
        // }
      } else {
        this.searchNoResult = true;
        this.showDetails.showMoreBtn = false;
        this.setSearchData({});
      }
    });
  }

  onSearch(event) {
    if (event.length === 0) {
      this.isEmptyData = true;
      this.setSearchData({});
      this.searchNoResult = false;
      this.showDetails.showMoreBtn = false;

    } else {
      var search = event.trim();
      if (search.length === 0) {
        return false;
      }
      this.apiService.manageLoader(true);
      // Amplitude code
      this.amplitudeSearchTypeObj['TYPED_CONTENT'] = search;
      this.apiService.getAmplitudeInstance('search_field_type', this.amplitudeSearchTypeObj);

      this.isEmptyData = false;
      this.url = Constants.url.getSearchList + '?keyword=' + search + '&limit=' + this.artistList.limit + '&offset=' + this.artistList.offset;
      this.searchTextChanged.next(event);
    }
  }

  fixedToggle() {
    // Amplitude code
    this.apiService.getAmplitudeInstance('search_field_click', this.amplitudeObj);

    $('#hide_this').slideUp();
    this.showBackArrow = true;
  }

  // event on clear search 
  clearSearch() {
    // Amplitude code
    this.apiService.getAmplitudeInstance('search_filed_cancel', this.amplitudeSearchTypeObj);

    this.searchText = '';
    this.setSearchData({});
    this.searchNoResult = false;
    this.showDetails.showMoreBtn = false;
    $('#hide_this').slideDown();
  }

  // quick view toggle event
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
    }else{
      $(".episodelist_quickview").addClass('invisible');
      $('body').removeClass('noscroll');
    }
  }

  actionView(show: boolean) {
    this.actionBottomVisible = show;
  }

  // set the search data
  setSearchData(response) {
    if (Object.entries(response).length === 0 && response.constructor === Object) {
      this.artistList.s3Url = null;
      this.artistList.data = [];

      this.showStageOriginalList.s3Url = null;
      this.showStageOriginalList.data = [];

      this.stageCollectionList.s3Url = null;
      this.stageCollectionList.data = [];

      this.showDetails.s3Url = null;
      this.showDetails.episodeList = [];
      this.apiService.manageLoader(false);
    } else {
      this.artistList.s3Url = response['data']['s3Url'];
      this.artistList.data = response['data']['artistList'];

      this.showStageOriginalList.s3Url = response['data']['s3Url'];
      this.showStageOriginalList.data = response['data']['showList'];

      this.stageCollectionList.s3Url = response['data']['s3Url'];
      this.stageCollectionList.data = response['data']['collectionList'];

      this.showDetails.s3Url = response['data']['s3Url'];
      this.showDetails.episodeCount = response['data']['episodeList'].length

      if (this.showDetails.episodeCount > this.showDetails.episodeLimit) {
        this.showDetails.showMoreBtn = true;
        this.showDetails.episodeList = response['data']['episodeList'].slice(0, this.showDetails.episodeLimit)
        this.showDetails.episodeList1 = response['data']['episodeList']
      } else {
        this.showDetails.episodeList = response['data']['episodeList'];
        this.showDetails.showMoreBtn = false;
      }
      this.apiService.manageLoader(false);

      if (this.showStageOriginalList.data.length > 0) {
        setTimeout(() => {
          this.setDivHeight('stage_original_card', 'stageOrig_hScroll');
        }, 1000);
      }

      if (this.stageCollectionList.data.length > 0) {
        setTimeout(() => {
          this.setDivHeight('collection_original_card', 'collectionOrig_hScroll')
        }, 1000);
      }

      if (this.artistList.data.length > 0) {
        setTimeout(() => {
          this.setDivHeight('artist_original_card', 'artistOrig_hScroll');
        }, 1000);
      }
    }
  }

  searchShowMore() {
    this.showDetails.episodeList = this.showDetails.episodeList1;
    this.showDetails.showMoreBtn = false;
  }

  setDivHeight(sub_div_id, main_div_id) {
    var boxes = document.getElementById(sub_div_id).offsetHeight + 5;
    document.getElementById(main_div_id).style.minHeight = boxes + "px";
  }

  getViewPort(item_id, data) {
    this.amplitudeArtistArr = [];
    this.amplitudeShowArr = [];
    this.amplitudeCollectionArr = [];
    data.forEach(item => {
      var id = item_id + item._id;
      // code to check element is in viewport - start
      if ($("." + id).offset() != undefined) {
        if ((!!id)) {
          var element_offets = this.checkIfElementIsWithinViewport($("." + id));
          if (
            (element_offets.top >= 0) &&
            (element_offets.left >= 0) &&
            (element_offets.bottom <= window.innerHeight) &&
            (element_offets.right <= window.innerWidth)
          ) {
            if (item_id == 'searchArtist_item_') {
              this.amplitudeArtistArr.push(item.firstName);
            }
            if (item_id == 'searchShow_item_') {
              this.amplitudeShowArr.push(item.title);
            }
            if (item_id == 'searchCollection_item_') {
              this.amplitudeCollectionArr.push(item.title);
            }
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

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName) {
    if (objInitName === 'artistSearch') {
      this.getViewPort('searchArtist_item_', this.artistList.data);
      this.apiService.getAmplitudeInstance('search_artistscroll', { 'ARTIST_NAMES': this.amplitudeArtistArr });
    } else if (objInitName === 'showSearch') {
      this.getViewPort('searchShow_item_', this.showStageOriginalList.data);
      this.apiService.getAmplitudeInstance('search_showscroll', { 'SHOW_NAMES': this.amplitudeShowArr });
    } else if (objInitName === 'collectionSearch') {
      this.getViewPort('searchCollection_item_', this.stageCollectionList.data);
      this.apiService.getAmplitudeInstance('search_collectionscroll', { 'COLLECTION_NAMES': this.amplitudeCollectionArr });
    }
  }
}