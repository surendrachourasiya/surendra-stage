import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit, ComponentFactoryResolver, ViewEncapsulation, HostListener } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';

@Component({
  selector: 'app-shows',
  templateUrl: './shows.component.html',
  styleUrls: ['./shows.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShowsComponent implements OnInit, AfterViewInit {

  @ViewChild('showStageOriginalScroll', { static: false }) showStageOriginalScroll: CdkVirtualScrollViewport; 

  constructor(private cd: ChangeDetectorRef, private apiService: ApiService, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) { }

  lang;
  amplitudeArr = [];
  amplitudeShowName = [];

  showStageOriginalList = {
    offset: 0, //first record of the page number
    limit: 10,
    s3Url: null,
    data: [],
    noMoreData: false
  }

  ngOnInit(): void {
    this.lang = this.route.snapshot.data.lang;
    this.getShowOrginalList();
  }

  // get show original listing with details 
  getShowOrginalList() {
    this.apiService.manageLoader(true);
    let url = Constants.url.getShowOriginalList + '?limit=' + this.showStageOriginalList.limit + '&offset=' + this.showStageOriginalList.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.showStageOriginalList.s3Url = response['data']['s3Url'];
        this.showStageOriginalList.data = this.showStageOriginalList.data.concat(this.processData(response['data']['showStageOriginalList']));

        this.cd.detectChanges();
        if (response['data']['showStageOriginalList'].length == this.showStageOriginalList.limit) {
          this.showStageOriginalList.noMoreData = false;
          this.showStageOriginalList.offset = this.showStageOriginalList.limit + this.showStageOriginalList.offset;
        } else {
          this.showStageOriginalList.noMoreData = true;
        }

        this.getMediumAmplitude();
      } else {
        this.showStageOriginalList.noMoreData = true;
      }
      this.apiService.manageLoader(false);
    })
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName, $event) {
    if(objInitName === 'showStageOriginal') {
      this.showsBackEvent();
      var obj = { "SHOW_IDs": this.amplitudeArr, "SHOW_NAME":  this.amplitudeShowName};
      this.apiService.getAmplitudeInstance('slp_show_scroll', obj);
    }
    if (!this[objInitName + 'List']['noMoreData']) {
      const end = this[objInitName + 'Scroll'].getRenderedRange().end;
      const total = this[objInitName + 'Scroll'].getDataLength();
      if (end === total) {
        this.showStageOriginalList.noMoreData = true;
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

  // after init code
  ngAfterViewInit(): void { }

  showsBackEvent() {
    this.amplitudeArr = [];
    this.amplitudeShowName = [];
    this.showStageOriginalList.data.forEach(item => {
      var jsonstr = JSON.stringify(item);
      var arr = JSON.parse(jsonstr);

      arr.forEach(itemInner => {
        var id = 'show_' + itemInner._id;
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
            this.amplitudeShowName.push(itemInner.title);
          }
        }
      });
    });
  }

  getMediumAmplitude() {
    let url = this.apiService.getPreviousUrl();
    if(url == '/') {
      this.apiService.getAmplitudeInstance('slp_landing', {'MEDIUM': 'Home'});
    }
  }

  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.showsBackEvent();
    this.apiService.getAmplitudeInstance('slp_show_back', { "SHOW_IDs": this.amplitudeArr });
  }

}

