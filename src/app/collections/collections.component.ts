import { Component, ViewChild, ChangeDetectorRef, OnInit, ComponentFactoryResolver, ViewEncapsulation, HostListener } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionsComponent implements OnInit {

  @ViewChild('stageCollectionScroll', { static: false }) stageCollectionScroll: CdkVirtualScrollViewport; 

  constructor(private cd: ChangeDetectorRef, private apiService: ApiService, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) { }

  lang;
  amplitudeArr = [];

  stageCollectionList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  ngOnInit(): void {
    this.lang = this.route.snapshot.data.lang;
    this.getStageCollectionList();
  }


  // get Stage collection list data API call
  getStageCollectionList() {
    this.apiService.manageLoader(true);
    let url = Constants.url.getCollectionList + '?limit=' + this.stageCollectionList.limit + '&offset=' + this.stageCollectionList.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.stageCollectionList.s3Url = response['data']['s3Url'];
        this.stageCollectionList.data = this.stageCollectionList.data.concat(this.processData(response['data']['collectionDetails']));

        this.cd.detectChanges();
        if (response['data']['collectionDetails'].length == this.stageCollectionList.limit) {
          this.stageCollectionList.noMoreData = false;
          this.stageCollectionList.offset = this.stageCollectionList.limit + this.stageCollectionList.offset;
        } else {
          this.stageCollectionList.noMoreData = true;
        }

        this.getMediumAmplitude();
      }
      else {
        this.stageCollectionList.noMoreData = true;
      }
      this.apiService.manageLoader(false);
    })
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName, $event) {
    if (!this[objInitName + 'List']['noMoreData']) {
      const end = this[objInitName + 'Scroll'].getRenderedRange().end;
      const total = this[objInitName + 'Scroll'].getDataLength();
      if (end === total) {
        this[objInitName + 'List']['noMoreData'] = true;
        this[functionName]();
      }
    }
  }

  processData(data) {
    var result = [];
    if (data.length > 0) {
      var arrayIndex = 0
      data.forEach((item, index) => {
        if (index % 2 == 0) {
          result[arrayIndex] = [];
          result[arrayIndex].push(item);
        } else {
          result[arrayIndex].push(item);
          arrayIndex++;
        }
      });
    }
    return result;
  }

  // amplitude back event on the collection
  collectionBackEvent() {
    this.amplitudeArr = [];
    this.stageCollectionList.data.forEach(item => {
      var jsonstr = JSON.stringify(item);
      var arr = JSON.parse(jsonstr);

      arr.forEach(itemInner => {
        var id = 'collections_' + itemInner._id;
        // code to check element is in viewport - start
        if ($("#" + id).offset() != undefined) {
          var top_of_element = $("#" + id).offset().top;
          var bottom_of_element = $("#" + id).offset().top + $("#" + id).outerHeight();
          var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
          var top_of_screen = $(window).scrollTop();
          // code to check element is in viewport - end

          if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
            // the element is visible, do something
            this.amplitudeArr.push(itemInner._id);
          }
        }

      });
    });
  }

  getMediumAmplitude() {
    let url = this.apiService.getPreviousUrl();
    if(url == '/') {
      this.apiService.getAmplitudeInstance('clp_landing', {'MEDIUM': 'Home'});
    }
  }

  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.collectionBackEvent();
    this.apiService.getAmplitudeInstance('clp_collection_back', { "COLLECTION_IDs": this.amplitudeArr });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.collectionBackEvent();
    var obj = { "COLLECTION_IDs": this.amplitudeArr };
    this.apiService.getAmplitudeInstance('clp_collection_scroll', obj);
  }

}
