import { Component, ViewChild, ChangeDetectorRef, OnInit, ComponentFactoryResolver, ViewEncapsulation, HostListener } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';
declare var $;

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArtistsComponent implements OnInit {

  public constantImg: any;
  amplitudeArr = [];

  @ViewChild('artistScroll', { static: false }) artistScroll: CdkVirtualScrollViewport;

  constructor(private cd: ChangeDetectorRef, private apiService: ApiService, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) {
    this.constantImg = Constants.image;
  }

  lang;

  artistList = {
    offset: 0,
    limit: 10,
    s3Url: null,
    data: [],
    data1: [],
    noMoreData: false
  }

  ngOnInit(): void {
    this.lang = this.route.snapshot.data.lang;
    this.getArtistList();
  }

  // get artist list with details 
  getArtistList() {
    this.apiService.manageLoader(true);
    let url = Constants.url.getArtistDetailList + '?limit=' + this.artistList.limit + '&offset=' + this.artistList.offset;

    this.apiService.getApiData(url).subscribe(response => {
      if (response['responseCode'] == 200) {
        this.artistList.s3Url = response['data']['s3Url'];
        this.artistList.data1 = response['data']['artistList'];
        this.artistList.data = this.artistList.data.concat(this.processData(response['data']['artistList']));
        this.cd.detectChanges();

        if (response['data']['artistList'].length == this.artistList.limit) {
          this.artistList.noMoreData = false;
          this.artistList.offset = this.artistList.limit + this.artistList.offset;
        } else {
          this.artistList.noMoreData = true;
        }
        this.getMediumAmplitude();
      } else {
        this.artistList.noMoreData = true;
      }
      this.apiService.manageLoader(false);
    })
  }

  // call next batch of artist list on scroll
  getNextBatchOnScroll(objInitName, functionName, $event) {
    if(objInitName === 'artist') {
      this.artistsBackEvent();
      var obj = { "ARTIST_IDs": this.amplitudeArr };
      this.apiService.getAmplitudeInstance('alp_artist_scroll', obj);
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

  artistsBackEvent() {
    this.amplitudeArr = [];
    this.artistList.data.forEach(item => {
      var jsonstr = JSON.stringify(item);
      var arr = JSON.parse(jsonstr);

      arr.forEach(itemInner => {
        var id = 'artists_' + itemInner._id;
        // code to check element is in viewport - start
        if ($("#" + id).offset() != 'undefined' && $("#" + id).offset() != undefined) {
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
      this.apiService.getAmplitudeInstance('alp_landing', {'MEDIUM': 'HOME'});
    }
  }

  // emit event when back
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.artistsBackEvent();
    this.apiService.getAmplitudeInstance('alp_artist_back', { "ARTIST_IDs": this.amplitudeArr });
  }

}
