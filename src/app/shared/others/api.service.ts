
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 
import { environment } from 'src/environments/environment';
import { ConsumptionComponent } from 'src/app/consumption/consumption.component';
import amplitude, { AmplitudeClient } from 'amplitude-js';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { Constants } from 'src/app/shared/others/constants.js';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private previousUrl: string = undefined;
  private currentUrl: string = undefined;

  // dummy watch time object to be pushed in localstorage
  watchTime={
    'featuredArtist':{},
    'showPheripheral':{},
    'collectionPheripheral':{},
    'show':{},
    'collection':{}
  }

  // share popup event
  @Output() openSharedPopup = new EventEmitter<{ status: boolean }>();
  private loadingEventSource = new Subject<boolean>();
  // Observable string streams
  loadingEvent = this.loadingEventSource.asObservable();

  // snackbar event
  @Output() actionSnackbar = new EventEmitter<{ status: boolean, msg: string, actionTxt:string }>();
  
  private snackbarEventSource = new Subject<any>();
  // Observable string streams
  snackbarEvent = this.snackbarEventSource.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
   }
   
   public getPreviousUrl() {
    return this.previousUrl;
  }

  getLanguageText(): Observable<any> {
    let url = ".json";
    return this.http.get(url);
  }

  getApiData(url:string) {
    return this.http.get(url); 
  }

  getPostData(url:string, data:object) {
    return this.http.post(url, data); 
  }

  identifyPlayPauseEvent(el:any) {
    var viewportHeight = window.innerHeight,
    elementOffsetTop = el.getBoundingClientRect().top,
    elementHeight = el.getBoundingClientRect().height,
    elementOffsetBottom = el.getBoundingClientRect().bottom;
    if(elementOffsetTop < 0 &&  elementOffsetBottom < 0) // element is outside the viewport from the bottom
    {
        return false;
    }
    else if (elementOffsetTop < 0 &&  elementOffsetBottom > 0) // element is inside the viewport
    {
      if ((elementOffsetBottom - (elementHeight * environment.autoPlayVideoWindow)) > 0)
        return true;
      
      return false;
    }
    else if (viewportHeight > (elementOffsetTop + (elementHeight * environment.autoPlayVideoWindow))) // element is inside the viewport of 25% from the top
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  getCurrentLanguage(){
    let lang = this.cookieService.get('lang');
    if(!lang)
      return environment.defaultLang;
    return lang;
  }

  getLocalStorageData(key){
    localStorage.getItem(key)
  }

  setWatchTimeInLocal(id, value, type){
    if(localStorage.getItem('watchTime'))
    {
      let tempWatchData= JSON.parse(localStorage.getItem('watchTime'));
      let tempIdString = id.toString();
      tempWatchData[type][tempIdString]=value;
      localStorage.setItem('watchTime', JSON.stringify(tempWatchData));
    }
    else
    {
      this.watchTime[type][id.toString()]=value;
      localStorage.setItem('watchTime', JSON.stringify(this.watchTime));
    }
    
  }

  getWatchTimeInLocal(){
    if(localStorage.getItem('watchTime'))
      return JSON.parse(localStorage.getItem('watchTime'));
    else
      return false; 
  }
  
  // get mute state in local storage
  getMuteState(){
    if(localStorage.getItem('muted'))
      return localStorage.getItem('muted')=='true'? true :false;
    else
      return false;
  }

  // set mute state in local storage
  setMuteState(value){
    localStorage.setItem('muted', value);
  }

  // get userId if not present then return null
  getUserId(){
    let userDetail = localStorage.getItem('userDetail');
    if(!!userDetail)
    {
      userDetail = JSON.parse(userDetail);
      return !!userDetail['_id']==true?userDetail['_id']:null;
    }
    return null;
  }

  // get fingerPrint if not present then return null
  getFingerPrint(){
    let userDetail = localStorage.getItem('userDetail');
    if(!!userDetail)
    {
      userDetail = JSON.parse(userDetail);
      return !!userDetail['_id']==true?userDetail['_id']:null;
    }
    return null;
  }

  getAmplitudeInstance(eventName, obj) {
    if(this.getUserId() != null) {
      obj.User_ID = this.getUserId();
      obj.FINGERPRINT = this.getFingerPrint();
    } else {
      obj.User_ID = 'null';
      obj.FINGERPRINT = 'null';
    }
    obj.TIMESTAMP = this.getTimestamp();
    amplitude.getInstance().logEvent(eventName, obj);
  }

  convertVideoTimeFormat(totalSeconds){
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    if(hours > 0)
      return hours+':'+minutes+':'+seconds;

    return minutes+':'+seconds;
  }

  consumedPercent(duration, consumed_duration) {
    return ((consumed_duration/duration)*100).toFixed(2);
  }

  getTimestamp() {
    var TIMESTAMP = new Date();
    var split_date = TIMESTAMP.toString().split(" ");
    var arr_date = split_date[0] +' '+ split_date[1] +' '+ split_date[2] +' '+ split_date[4] +' '+ split_date[5] +' '+ split_date[3];
    return arr_date;
  }

  openPopup(shoW){
    this.openSharedPopup.emit(shoW)
  }

  closePopup(shoW){
    this.openSharedPopup.emit(shoW)
  }

  manageLoader(value:boolean){
    this.loadingEventSource.next(value);
  }

  saveUserData(id, slug, pageType){
    let userDetail = localStorage.getItem('userDetail');
    if (!!userDetail) {
      let reqData = {
        "entityType": pageType,
        "entityId": id,
        "entitySlug": slug
      }

      this.getPostData(Constants.url.saveEntity, reqData).subscribe(response => {
        if (response['responseCode'] == 200) {
        } else {
        }
      });
    }
  }

  // show/hide the snackbar function
  showHideSnackbar(show){
    this.snackbarEventSource.next(show);
  }
}

// reference url
// https://blog.fullstacktraining.com/loading-data-before-components-in-angular/
