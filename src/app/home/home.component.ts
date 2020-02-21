import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from '../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  constructor(private apiService: ApiService, private route: ActivatedRoute) { }

  @ViewChild('artistScroll', { static: false }) artistScroll: CdkVirtualScrollViewport;
  @ViewChild('showStageOriginalScroll', { static: false }) showStageOriginalScroll: CdkVirtualScrollViewport;
  @ViewChild('stageCollectionScroll', { static: false }) stageCollectionScroll: CdkVirtualScrollViewport;
  @ViewChild('continueWatchingScroll', { static: false }) continueWatchingScroll: CdkVirtualScrollViewport;

  showListArr = {
    showId: [],
    showName: []
  }

  collectionListArr = {
    id: [],
    name: []
  }

  artistListArr = {
    id: [],
    name: [],
    position: []
  }

  continueWatchArr = {
    vid: []
  }

  timer = null;

  activeArtistContent;
  activeFeatureArtist;
  lang;
  isLoggedIn: string = "false";
  homeSections = [];
  s3Url = {};
  offset = 0;
  continueWatchingOffset = 0;
  isApiLoad = false;
  divHeight = {};

  ngOnInit(): void {
    this.lang = this.route.snapshot.data.lang;
    this.apiService.manageLoader(true);
    this.getApiData();
    this.getMediumAmplitude(this.apiService.getPreviousUrl())
  }

  // get home page section data
  getApiData() {
    if (this.offset > 0 && !this.isApiLoad) {
      return false;
    }

    if (this.offset == 0) {
      this.apiService.manageLoader(false);
    }
    let url = Constants.url.homePage + '?offset=' + this.offset + '&continueWatchingOffset=' + this.continueWatchingOffset;
    this.isApiLoad = false;
    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.s3Url = response['data']['s3Url'];
        this.homeSections = this.homeSections.concat(response['data']['listing']);
        this.isApiLoad = response['data']['furtherBlocks'];

        if (this.offset == 0) {
          let continueWatchingExist = this.homeSections.findIndex(x => x['type'] === 'continueWatching');
          
          if(continueWatchingExist != -1)
            this.getContinueWatchingList(continueWatchingExist);
        }

        if (this.isApiLoad) {
          this.offset = this.offset + 1;
        }

        var timer = 0;
        if (this.offset == 0) {
          this.apiService.manageLoader(true);
          timer = 1000;
        }
        setTimeout(() => {
          if ($("#stage_original_card").length != 0) {
            this.setDivHeight('stage_original_card', 'stageOrig_hScroll')
          }
          if ($("#collection_original_card").length != 0) {
            this.setDivHeight('collection_original_card', 'stageCollCard_hScroll')
          }
          if ($("#artist_original_card").length != 0) {
            this.setDivHeight('artist_original_card', 'artistOrig_hScroll')
          }
          if ($("#continuewatching_original_card").length != 0) {
            this.setDivHeight('continuewatching_original_card', 'continuewatching_hScroll')
          }
        }, timer);
      } else {
        this.apiService.manageLoader(true);
      }
    })
  }

  // get continue watching list
  getContinueWatchingList(continueWatchingIndex){
    let url = Constants.url.getContinueWatchingList+'?limit=50&offset=0';
    this.apiService.getApiData(url).subscribe(response =>{
      if(response['responseCode'] == 200)
        this.homeSections[continueWatchingIndex]['resumedList'] = response['data']['resumedList'];
    })
  }

  // dynamic set the height of the div
  setDivHeight(sub_div_id, main_div_id) {
    if (this.divHeight[sub_div_id] == undefined ){
      var boxes = document.getElementById(sub_div_id).offsetHeight + 5;
      $('.' + main_div_id).css('min-height', boxes + "px")
      this.divHeight[sub_div_id] = boxes;
    }else{
      $('.' + main_div_id).css('min-height', this.divHeight[sub_div_id] + "px")
    }
  }

  getNextBatchOnScroll(objInitName) {
    if (objInitName == 'homeShowlist') {
      this.getViewPort('home_showlist_item_', this.homeSections[1]['showStageOriginalList']);
      var showObj = { 'SHOW_ID': this.showListArr.showId };
      this.apiService.getAmplitudeInstance('ss_scroll', showObj);
    }
    if (objInitName == 'homeCollectionlist') {
      this.getViewPort('home_collectionlist_item_', this.homeSections[2]['collectionDetails']);
      var collectionObj = { 'COLLECTION_ID': this.collectionListArr.id, 'COLLECTION_NAME': this.collectionListArr.name };
      if(!!this.collectionListArr.id.length) {
        this.apiService.getAmplitudeInstance('collectionlist_scroll', collectionObj);
      }
    }

    if (objInitName == 'homeArtistlist') {
      this.getViewPort('home_artistlist_item_', this.homeSections[3]['artistList']);
      var artistObj = { 'ARTIST_ID': this.artistListArr.id, 'ARTIST_NAME': this.artistListArr.name }
      this.apiService.getAmplitudeInstance('artistlist_scroll', artistObj);
    }

    if (objInitName == 'homeContinueWatchinglist') {
      this.getViewPort('home_continuewatching_', this.homeSections[6]['resumedList']);
      var continueWatchingObj = { 'VIDEO_IDs': this.continueWatchArr.vid}
      if(!!this.continueWatchArr.vid.length)
      this.apiService.getAmplitudeInstance('cws_scroll', continueWatchingObj);
    }
  }

  // Home Screen Landing Amplitude Event
  getMediumAmplitude(url) {
    if (url == '/') {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Home' });
    } else if (url.includes("consumption")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Consumption' });
    } else if (url.includes("feed-consumption")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Feed Consumption' });
    } else if (url.includes("full-consumption")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Full Consumption' });
    } else if (url.includes("artist-landscape")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Artist Landscape' });
    } else if (url.includes("artist-list")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Artist List' });
    } else if (url.includes("show-details")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Show Details' });
    } else if (url.includes("show-list")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Show List' });
    } else if (url.includes("collection-details")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Collection Details' });
    } else if (url.includes("collection-list")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Collection List' });
    } else if (url.includes("auth")) {
      this.apiService.getAmplitudeInstance('home_landing_web', {'MEDIUM': 'Login' });
    }
  }

  // Get ViewPort Of Element
  getViewPort(item_id, data) {
    this.showListArr.showId = [];

    this.collectionListArr.id = [];
    this.collectionListArr.name = [];

    this.artistListArr.id = [];
    this.artistListArr.name = [];

    this.continueWatchArr.vid = [];

    data.forEach((item, index) => {
      var id = item_id + item._id;
      // code to check element is in viewport - start
      if ($("." + id).offset() != undefined) {
        if ((id != undefined) && (id != null)) {
          var element_offets = this.checkIfElementIsWithinViewport($("." + id));
          if (
            (element_offets.top >= 0) &&
            (element_offets.left >= 0) &&
            (element_offets.bottom <= window.innerHeight) &&
            (element_offets.right <= window.innerWidth)
          ) {
            if (item_id == 'home_showlist_item_') {
              this.showListArr.showId.push(item._id);
            }
            if (item_id == 'home_collectionlist_item_') {
              this.collectionListArr.id.push(item._id);
              this.collectionListArr.name.push(item.title);
            }
            if (item_id == 'home_artistlist_item_') {
              this.artistListArr.id.push(item._id);
              this.artistListArr.name.push(item.firstName);
            }
            if (item_id == 'home_continuewatching_') {
              this.continueWatchArr.vid.push(item._id);
            }
          }
        }
        return false;
      }
    })
  }

  checkIfElementIsWithinViewport(element) {
    return element[0].getBoundingClientRect();
  }

  // Get Active Index of Content Artist for Amplitude Event
  getActiveArtistIndex(event: number) {
    this.activeArtistContent = event;
  }

  // Get Active Index of Feature Artist for Amplitude Event
  getActiveFeatureIndex(event: number) {
    this.activeFeatureArtist = event;
  }

  // get new data from the api on bottom of the vertical scroll  
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let totalHeight = document.body.scrollHeight - height;
    let bottom = window.scrollY > (totalHeight - 300)

    if (this.isApiLoad && bottom) {
      this.getApiData();
    }
    // scorll amplitude event
    this.homeSections.forEach((item, index) => {

      // FEATURE ARTIST scroll
      if (item.type == 'featuredArtistList') {
        var id = 'feature_artist_' + item['artistList'][this.activeFeatureArtist]['_id'];

        if ($("." + id).offset() != undefined) {
          if ((id != undefined) && (id != null)) {
            var element_offets = this.checkIfElementIsWithinViewport($("." + id));
            if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
              if (this.timer !== null) {
                clearTimeout(this.timer);
              }
              this.timer = setTimeout(() => {
                var featureArtistArr = { id: '', name: '' }
                featureArtistArr.id = item['artistList'][this.activeFeatureArtist]._id;
                featureArtistArr.name = item['artistList'][this.activeFeatureArtist].firstName;
                var featureArtistObj = { 'ARTIST_ID': featureArtistArr.id, 'ARTIST_NAME': featureArtistArr.name, 'TOGGLE_POSITION_INDEX': this.activeFeatureArtist, 'WIDGET_POSITION_INDEX': index, 'MUTE_STATE': 0 };
                this.apiService.getAmplitudeInstance('home_artiststory_scroll', featureArtistObj);
              }, 150);
            }
          }
        }
      }

      // SHOWLIST scroll
      if (item.type == 'showList') {
        this.showListArr.showId = [];
        this.showListArr.showName = [];
        item.showStageOriginalList.forEach((innderItem, innerIndex) => {
          var id = 'home_showlist_item_' + innderItem['_id'];

          if ($("." + id).offset() != undefined) {
            if ((id != undefined) && (id != null)) {
              var element_offets = this.checkIfElementIsWithinViewport($("." + id));
              if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
                if (this.timer !== null) {
                  clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                  this.showListArr.showId.push(innderItem._id);
                  this.showListArr.showName.push(innderItem.title);
                  var showListObj = { 'SHOW_ID': this.showListArr.showId, 'SHOW_NAME': this.showListArr.showName, 'POSITION_INDEX': innerIndex, 'WIDGET_POSITION_INDEX': index };
                  this.apiService.getAmplitudeInstance('home_showlisting_scroll', showListObj);
                }, 150);
              }
            }
          }
        })
      }

      // COLLECTIONLIST scroll
      if (item.type == 'collectionList') {
        this.collectionListArr.id = [];
        this.collectionListArr.name = [];
        item.collectionDetails.forEach((innderItem, innerIndex) => {
          var id = 'home_collectionlist_item_' + innderItem['_id'];

          if ($("." + id).offset() != undefined) {
            if ((id != undefined) && (id != null)) {
              var element_offets = this.checkIfElementIsWithinViewport($("." + id));
              if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
                if (this.timer !== null) {
                  clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                  this.collectionListArr.id.push(innderItem._id);
                  this.collectionListArr.name.push(innderItem.title);
                  var collectionListObj = { 'COLLECTION_ID': this.collectionListArr.id, 'COLLECTION_NAME': this.collectionListArr.name, 'POSITION_INDEX': innerIndex, 'WIDGET_POSITION_INDEX': index };
                  this.apiService.getAmplitudeInstance('home_collectionlisting_scroll', collectionListObj);
                }, 150);
              }
            }
          }
        })
      }

      // ARTISTLIST scroll
      if (item.type == 'artistList') {
        this.artistListArr.id = [];
        this.artistListArr.name = [];
        this.artistListArr.position = [];
        item.artistList.forEach((innderItem, innerIndex) => {
          var id = 'home_artistlist_item_' + innderItem['_id'];

          if ($("." + id).offset() != undefined) {
            if ((id != undefined) && (id != null)) {
              var element_offets = this.checkIfElementIsWithinViewport($("." + id));
              if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
                this.artistListArr.id.push(innderItem._id);
                this.artistListArr.name.push(innderItem.firstName);
                this.artistListArr.position.push(innerIndex);
                if (this.timer !== null) {
                  clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                  var artistListObj = { 'ARTIST_ID': this.artistListArr.id, 'ARTIST_NAME': this.artistListArr.name, 'POSITION_INDEX': this.artistListArr.position, 'WIDGET_POSITION_INDEX': index };
                  this.apiService.getAmplitudeInstance('home_artistlisting_scroll', artistListObj);
                }, 150);
              }
            }
          }
        })
      }

      // CONTINUE WATCHING scroll
      if (item.type == 'continueWatching') {
        this.continueWatchArr.vid = [];
        item.resumedList.forEach((innderItem, innerIndex) => {
          var id = 'home_continuewatching_' + innderItem['_id'];

          if ($("." + id).offset() != undefined) {
            if ((id != undefined) && (id != null)) {
              var element_offets = this.checkIfElementIsWithinViewport($("." + id));
              if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
                if (this.timer !== null) {
                  clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                  this.continueWatchArr.vid.push(innderItem.hlsSourceLink);
                  var continueWatchcObj = { 'VIDEO_ID': this.continueWatchArr.vid, 'POSITION_INDEX': innerIndex, 'WIDGET_POSITION_INDEX': index };
                  this.apiService.getAmplitudeInstance('home_continue_scroll', continueWatchcObj);
                }, 150);
              }
            }
          }
        })
      }

      // COLLECTION Showcase scroll
      if (item.type == 'collectionShowcase') {
        var id = 'home_collctionshowcase_' + item.collectionDetail['_id'];

        // code to check element is in viewport - start
        var top_of_element = $("." + id).offset().top;
        var bottom_of_element = $("." + id).offset().top + $("." + id).outerHeight();
        var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
        var top_of_screen = $(window).scrollTop();
        // code to check element is in viewport - end

        if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          if (this.timer !== null) {
            clearTimeout(this.timer);
          }
          this.timer = setTimeout(() => {
            var collectionShowCaseArr = { id: [], name: [] }
            collectionShowCaseArr.id.push(item.collectionDetail['_id']);
            collectionShowCaseArr.name.push(item.collectionDetail['title']);
            var collectionShowcaseObj = { 'COLLECTION_ID': collectionShowCaseArr.id, 'COLLECTION_NAME': collectionShowCaseArr.name, 'WIDGET_POSITION_INDEX': index };
            this.apiService.getAmplitudeInstance('home_collectionshowcase_scroll', collectionShowcaseObj);
          }, 150);
        }
      }

      // SHOW Showcase scroll
      if (item.type == 'showShowcase') {
        var id = 'home_showshowcase_' + item.showList['_id'];

        // code to check element is in viewport - start
        var top_of_element = $("." + id).offset().top;
        var bottom_of_element = $("." + id).offset().top + $("." + id).outerHeight();
        var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
        var top_of_screen = $(window).scrollTop();
        // code to check element is in viewport - end

        if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          if (this.timer !== null) {
            clearTimeout(this.timer);
          }
          this.timer = setTimeout(() => {
            var showShowCaseArr = { id: [], name: [] }
            showShowCaseArr.id.push(item.showList['_id']);
            showShowCaseArr.name.push(item.showList['title']);
            var showShowcaseObj = { 'SHOW_ID': showShowCaseArr.id, 'SHOW_NAME': showShowCaseArr.name, 'WIDGET_POSITION_INDEX': index };
            this.apiService.getAmplitudeInstance('home_showshowcase_scroll', showShowcaseObj);
          }, 150);
        }
      }

      // INDIVISUAL CONTENT scroll
      if (item.type == 'individualContent') {
        var id = 'home_indivisual_' + item.episodeDetail['_id'];

        // code to check element is in viewport - start
        var top_of_element = $("." + id).offset().top;
        var bottom_of_element = $("." + id).offset().top + $("." + id).outerHeight();
        var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
        var top_of_screen = $(window).scrollTop();
        // code to check element is in viewport - end

        if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          if (this.timer !== null) {
            clearTimeout(this.timer);
          }
          this.timer = setTimeout(() => {
            var indivisualContentArr = { id: [], name: [] }
            indivisualContentArr.id.push(item.episodeDetail['artistList'][0]['id']);
            indivisualContentArr.name.push(item.episodeDetail['artistList'][0]['name']);
            var indivisualContentObj = { 'ARTIST_ID': indivisualContentArr.id, 'ARTIST_NAME': indivisualContentArr.name, 'WIDGET_POSITION_INDEX': index };
            this.apiService.getAmplitudeInstance('home_individualcontent_scroll', indivisualContentObj);
          }, 150);
        }
      }

      // ARTIST SHOWCASE scroll
      if (item.type == 'artistShowcase') {
        var id = 'artist_content_' + item['artistList'][this.activeArtistContent]['_id'];

        if ($("." + id).offset() != undefined) {
          if ((id != undefined) && (id != null)) {
            var element_offets = this.checkIfElementIsWithinViewport($("." + id));
            if ((element_offets.top >= 0) && (element_offets.left >= 0) && (element_offets.bottom <= window.innerHeight) && (element_offets.right <= window.innerWidth)) {
              if (this.timer !== null) {
                clearTimeout(this.timer);
              }
              this.timer = setTimeout(() => {
                var artistShowCaseArr = { id: '', name: '' }
                artistShowCaseArr.id = item['artistList'][this.activeArtistContent]._id;
                artistShowCaseArr.name = item['artistList'][this.activeArtistContent].firstName;
                var artistShowcaseObj = { 'ARTIST_ID': artistShowCaseArr.id, 'ARTIST_NAME': artistShowCaseArr.name, 'POSITION_INDEX': this.activeArtistContent, 'WIDGET_POSITION_INDEX': index };
                this.apiService.getAmplitudeInstance('home_artistcontent_scroll', artistShowcaseObj);
              }, 150);
            }
          }
        }
      }
    })
  }

}
