import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event, NavigationStart } from '@angular/router';
import * as WebFont from 'webfontloader';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import amplitude, { AmplitudeClient } from 'amplitude-js';
declare let ga: Function;
import { v4 as uuid } from 'uuid';

import { asyncScheduler, forkJoin, Observable } from 'rxjs';
import { filter, observeOn, scan } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from './shared/others/api.service';
import { CookieService } from 'ngx-cookie-service';
import { ConnectionService } from 'ng-connection-service';
import { Constants } from './shared/others/constants';


interface ScrollPositionRestore {
  event: Event;
  // positions: { [K: number]: number };
  positions: { };
  trigger: any;
  idToRestore: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('contentArea', {read: ElementRef, static: false}) private contentArea: ElementRef;

  constructor(private connectionService: ConnectionService, private apiService:ApiService ,private spinner: NgxSpinnerService, updates: SwUpdate, public router: Router, private viewportScroller: ViewportScroller,private cookieService: CookieService  ) {
    updates.available.subscribe(event => {
      updates.activateUpdate().then(() => document.location.reload());
    });

    apiService.loadingEvent.subscribe(value => {
      if(value)
        this.spinner.show()
      else
      {
        setTimeout(() => {
          this.spinner.hide();
        },2000);
      }      
    })

    // event subscibtion for show and hide the snackbar
    apiService.snackbarEvent.subscribe(value => {
      if(!!value.status)
      {
        this.showSnackbar=value.status;
        this.snackbarData=value;
      }
      else
        this.showSnackbar=false;     
    })

    this.checkInternetConnection();

  }
  title = 'Stage';
  authSlug: string = ''
  deviceType: string = 'mobile'
  imagePath: string = '';
  showSnackbar: boolean=false;
  snackbarData:{};

  ngOnInit() {
    amplitude.getInstance().init(environment.amplitudeKey);
    this.deviceType = environment.deviceType;
    if (this.deviceType !== 'desktop') {
      WebFont.load({
        google: {
          families: ['Noto Sans:400,700']
        }
      });
      this.deviceType = 'mobile';
    } else {
      WebFont.load({
        google: {
          families: ['Noto Sans:400,700']
        }
      });
    }
    this.authSlug = window.location.pathname;

    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        ga('set', 'page', e.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });

    // GOOGLE TAG MANAGER
    if (environment.production) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
          'gtm.start':
            new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
          j = <HTMLScriptElement>d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-P6MDNNQ');
      //GOOGLE TAG MANAGER
    }

    if (document.URL.indexOf('settings/privacy') > -1) {
      this.deviceType = 'mobile';
    }

    let lang = "hin";
    if ((this.cookieService.get('lang') !== '' && this.cookieService.get('lang') !== undefined)) {
      lang = this.cookieService.get('lang');
    }

    $('body').attr('id', lang)
  }

  // app redirection url
  redirectToApp() {
    window.open(environment.appUrl);
  }

  // check the internet connection and show the internet connection message accordingly
  checkInternetConnection(){
    this.connectionService.monitor().subscribe(isConnected => {
      if (isConnected) {
        this.showSnackbar=false;
        if(this.router.url.indexOf('consumption')>-1 || this.router.url.indexOf('full-consumption')>-1 || this.router.url.indexOf('feed-consumption')>-1)
        { 
          this.snackbarData= {'status': true, 'type':'internetConnection', 'msg': 'backToOnline', 'actionText': null, 'autoHide': true};
          this.showSnackbar=true;
        }
      }
      else {
        this.showSnackbar=true;
        if(this.router.url.indexOf('consumption')>-1 || this.router.url.indexOf('full-consumption')>-1 || this.router.url.indexOf('feed-consumption')>-1)
          this.snackbarData= {'status': true, 'type':'internetConnection', 'msg': 'backToOffline','actionText': null, 'autoHide': false};
        else
          this.snackbarData= {'status': true, 'type':'lgToast', 'msg': 'internetConnectionLost', 'actionText': 'retryText', 'autoHide': false};
      }
    })
  }

  // creating the object for scroll state
  objScrollState(){
    var obj={
      'vertical':  $(window).scrollTop(),
      'horizontal': {}
    }
    if(document.querySelectorAll('[id*="hScroll"]').length > 0)
    {
      document.querySelectorAll('[id*="hScroll"]').forEach(element => {
        obj['horizontal'][element.id] = element.scrollLeft
      });
    }
    return obj;
  }

  // function to maintain the scroll state
  stateMaintain(){
    this.router.events
    .pipe(
      filter(
        event =>
          event instanceof NavigationStart || event instanceof NavigationEnd,
      ),
      scan<Event, ScrollPositionRestore>((acc, event) => ({
        event,
        positions: {
          ...acc.positions,
          ...(event instanceof NavigationStart
            ? {
                [event.id]: this.objScrollState()
              }
            : {}),
        },
        trigger:
          event instanceof NavigationStart
            ? event.navigationTrigger
            : acc.trigger,
        idToRestore:
          (event instanceof NavigationStart &&
            event.restoredState &&
            event.restoredState.navigationId + 1) ||
          acc.idToRestore,
      })),
      filter(
        ({ event, trigger }) => event instanceof NavigationEnd && !!trigger,
      ),
      observeOn(asyncScheduler),
    )
    .subscribe(({ trigger, positions, idToRestore }) => {
      this.scrollStateBehaviour(trigger, positions, idToRestore);
    });

   }

  // scroll behaviour as per move backward and forward
   scrollStateBehaviour(trigger, positions, idToRestore){
    if (trigger === 'imperative') {
      this.contentArea.nativeElement.scrollTop = 0;
    }

    if (trigger === 'popstate') {
      // this.contentArea.nativeElement.scrollTop = positions[idToRestore];

      setTimeout(() => {
        // scroll window to top
        $(window).scrollTop(positions[idToRestore]['vertical']);

        // loop for scroll left as per the available id in the DOM
        Object.keys(positions[idToRestore]['horizontal']).forEach((key) => {
          document.getElementById(key).scrollLeft = positions[idToRestore]['horizontal'][key];
        });
      }, 1500);

    }

   }

}