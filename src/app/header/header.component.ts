import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '../shared/others/api.service';
declare var require: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() showBackArrow;
  @Input() type;
  authSlug : string = '';
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;
  lang;

  header = {
    shows: '',
    collections: '',
    artists: ''
  }

  constructor(public router: Router, private activeRoute: ActivatedRoute, private cookieService: CookieService, private apiService: ApiService) { 
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
 }

  ngOnInit() {
    this.getHeader();
  }

  // set the header text as per the selected lang
  getHeader() {
    this.lang = 'hin';
    if ((this.cookieService.get('lang') !== '' && this.cookieService.get('lang') !== undefined)) {
      this.lang = this.cookieService.get('lang');
    } 

    if(this.lang == 'en') {
      this.header = {
        shows: 'Shows',
        collections: 'Collections',
        artists: 'Artists'
      }
    }
    else if(this.lang == 'hin') {
      this.header = {
        shows: 'शो',
        collections: 'कलेक्शन',
        artists: 'कलाकार'
      }
    }
  }

  // redirect to previous element
  redirectPrevious() {
    $('body').removeClass('noscroll');
    
    var url = history.back();
    console.log(url);
    console.log(document.referrer);
    
    this.router.navigate([url]);  
  }

  // redirect to home
  redirectHome() {
    this.router.navigate(['/']);
  }

  // open share popup
  showSharePopup(){
    this.apiService.openPopup(true);
    $('body').addClass('noscroll');
  }

}
