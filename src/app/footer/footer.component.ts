import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faHome, faSearch, faEllipsisH, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './../shared/others/api.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
  faHome = faHome;
  faSearch = faSearch;
  faEllipsisH = faEllipsisH;
  faUserCog = faUserCog;

  lang;
  userId: null;
  TIMESTAMP: any;
  deviceType: string = 'mobile'

  footer = {
    search: '',
    home: '',
    more: ''
  }

  constructor(public router: Router,private route: ActivatedRoute, private cookieService: CookieService, private apiService: ApiService) { }
  ngOnInit() {
    this.userId=this.apiService.getUserId();
    this.deviceType = environment.deviceType;
    this.getFooter();
  }

  // set the text as per the active lang
  getFooter() {
    this.lang = 'hin';
    if ((this.cookieService.get('lang') !== '' && this.cookieService.get('lang') !== undefined)) {
      this.lang = this.cookieService.get('lang');
    } 

    if(this.lang == 'en') {
      this.footer={
        'search' : 'Search',
        'home' : 'Home',
        'more' : 'More'
      }
    }
    else {
      this.footer={
        'search' : 'खोजें',
        'home' : 'होम',
        'more' : 'मोर'
      }
    }
    return this.lang;
  }

  // footer click redirection and triggerd amplitude event
  onFooterClick(eventName, redirectionUrl) {
    this.apiService.getAmplitudeInstance(eventName, {});
    this.router.navigate([redirectionUrl]);
  }

}
