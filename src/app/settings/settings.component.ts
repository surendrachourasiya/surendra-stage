import { Component, OnInit, HostListener } from '@angular/core';
import { faAngleRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "angularx-social-login";
import { Router } from '@angular/router';
import { Constants } from '../shared/others/constants';
import { ApiService } from './../shared/others/api.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { environment } from './../../environments/environment';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  faAngleRight = faAngleRight;
  faUser = faUser;
  showLanguagePopup: boolean = false;
  showPrivacyPopup: boolean = false;
  showtermsPopup: boolean = false;
  contactUsPopup: boolean = false;
  showaboutPopup: boolean = false;

  showAnyPopup: boolean = true;
  settingSlug: string = null;
  loggedDiv: boolean = false;
  loggedIn: string = 'false';
  loggedInChk: boolean = false;
  userDetail: any = null;
  lang: any = 'en';
  langSetting = '';
  previousUrl: string;
  url = Constants.url.settings
  privacyContent: string = '';
  termsContent: string = '';
  aboutContent: string = '';
  contactUs: string = '';

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }
  previousURL = '';
  
  private ngNavigatorShareService: NgNavigatorShareService;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private apiService: ApiService, ngNavigatorShareService: NgNavigatorShareService, private cookieService: CookieService) {
    this.ngNavigatorShareService = ngNavigatorShareService;
  }

  ngOnInit() {
    this.apiService.getApiData(this.url).subscribe((response) => {
      this.privacyContent = response['data']['staticPages']['privacyPolicyContent'];
      this.termsContent = response['data']['staticPages']['termsConditionContent'];
      this.contactUs = response['data']['staticPages']['contactUs'];
    });

    this.langSetting = this.route.snapshot.data.lang;
    this.lang = this.cookieService.get('lang');
    this.previousURL = this.apiService.getPreviousUrl();

    if (localStorage.getItem('loggedIn') == 'true') {
      this.userDetail = localStorage.getItem('userDetail');
      this.userDetail = JSON.parse(this.userDetail)
      this.loggedDiv = true;

      if (this.userDetail != null)
        this.loggedInChk = true;
    }

    this.route.params.subscribe(params => {
      this.settingSlug = params['slug'];
      if (this.settingSlug != undefined) {
        this.showAnyPopup = false;
      }
    });
  }

  getEmailPhone() {
    return ((this.userDetail.email != undefined) ? this.userDetail.email : this.userDetail.primaryMobileNumber);
  }

  onLanguageChanged(param) {
    this.cookieService.set('lang', param)  
    $('body').attr('id', param) 
    this.lang = param;
    location.reload();
  }

  openLanguagePopup() {
    this.showLanguagePopup = true;
    this.showAnyPopup = false;
  }

  openPrivacyPopup() {
    // Amplitude code 
    this.apiService.getAmplitudeInstance('more_privacy_click', this.amplitudeObj);

    this.showPrivacyPopup = true;
    this.showAnyPopup = false;
    this.settingSlug = 'privacy';
    window.history.pushState("", "", "/settings/privacy");
  }

  openTermsPopup() {
    // Amplitude code
    this.apiService.getAmplitudeInstance('more_t&c_click', this.amplitudeObj);

    this.showtermsPopup = true;
    this.showAnyPopup = false;
    this.settingSlug = 'terms';
    window.history.pushState("", "", "/settings/terms");
  }

  openAboutPopup() {
    this.showaboutPopup = true;
    this.showAnyPopup = false;
    this.settingSlug = 'about';
    window.history.pushState("", "", "/settings/about");
  }

  openContactPopup() {
    // Amplitude code 
    this.apiService.getAmplitudeInstance('more_contact_click', this.amplitudeObj);

    this.contactUsPopup = true;
    this.showAnyPopup = false;
    this.settingSlug = 'contactUs';
    window.history.pushState("", "", "/settings/contactUs");

  }

  closePopup(lang) {
    // Amplitude Code
    if(this.showPrivacyPopup == true) {
      this.apiService.getAmplitudeInstance('more_privacy_back', this.amplitudeObj);
    }
    if(this.showtermsPopup == true) {
      this.apiService.getAmplitudeInstance('more_t&c_back', this.amplitudeObj);
    }
    if(this.contactUsPopup == true) {
      this.apiService.getAmplitudeInstance('more_contact_back', this.amplitudeObj);
    }
    if (lang != 'lang') {
      window.history.back()
    }
    this.settingSlug = ''
    this.showAnyPopup = true;
    this.showLanguagePopup = false;
    this.showPrivacyPopup = false;
    this.showtermsPopup = false;
    this.showaboutPopup = false;
    this.contactUsPopup = false;
  }

  //LOGOUT USER
  signOut(): void {
    this.authService.signOut();
    this.loggedInChk = false;
    this.loggedDiv = false;
    this.userDetail = {};
    localStorage.setItem('loggedIn', 'false')
    localStorage.removeItem('userDetail');
    
    this.apiService.showHideSnackbar({'status': true, 'type':'lgToast', 'msg':'logoutSuccessfull', 'actionText': null, 'autoHide': true})
  }

  login() {
    // Amplitude code
    this.apiService.getAmplitudeInstance('weblogin_viamoreclick', this.amplitudeObj);

    this.router.navigate(['/auth']);
  }

  async nativeShare() {
    // Amplitude code
    this.apiService.getAmplitudeInstance('more_share_click', this.amplitudeObj);
    try {
      var mess = "क्या आपने स्टेज ऐप देखा? इस ऐप पर अनेक भारतीय कलाकार है जो कॉमेडी, पोएट्री, और स्टोरीटेलिंग के मनोरंजक एवं दिलजस्प वीडिओज़ बनाते है। जाने माने और उभरते सितारों की कला का आनंद उठाये, स्टेज ऐप पर। " + "\n\n" + environment.appUrl;
      if (this.lang == 'en') {
        var mess = "Have you seen Stage? They have quality Indian content in comedy, poetry, and storytelling.\nFrom superstar artists to upcoming ones, you can discover them all on Stage. Get the App now!" + "\n\n" + environment.appUrl;
      } 

      await this.ngNavigatorShareService.share({
        title: '', text: mess
      });
    } catch (error) {
      console.log('You app is not shared, reason: ', error);
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    if ($('#terms_conditions').length > 0) {
      console.log("terms_conditions")
      this.apiService.getAmplitudeInstance('more_t&c_scroll', {});
    }
    if($('#privacy_policy').length > 0) {
      console.log("privacy_policy")
      this.apiService.getAmplitudeInstance('more_privacy_scroll', {});
    }
    
  }

}
