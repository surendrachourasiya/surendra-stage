import { FacebookLoginProvider, GoogleLoginProvider, SocialUser, AuthService } from "angularx-social-login";
import { Component, OnInit, ViewChild , HostListener} from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { ApiService } from './../shared/others/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from './../shared/others/constants';
import { CookieService } from 'ngx-cookie-service';
declare var require: any;


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit {

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  title = 'social-login';
  islangTrue = false;
  isloginTrue = false;
  isdetailsTrue = false;
  isloginOtpTrue = false;
  nextBtnDisabled = true;
  checked1 = false;
  checked2 = false;
  getOtpBtnDisabled = true;
  name = '';
  phone = '';
  userId = '';
  lang = '';
  langType = '';
  langLogin = {};
  mobileNumber = '';
  notify: string;
  _showGetOtpFormMessage: string;
  _showVerifyOtpFormMessage: string;
  timeLeft = 100;
  userDetail: any = {}
  signUpForm: FormGroup;
  verifyotp: FormGroup;

  user = {
    id: '',
    provider: '',
    email: '',
    firstName: '',
    lastName: ''
  };
  loggedIn: any = false;
  nextString : string = 'आगे बढ़ें';
  
  
  constructor(private authService: AuthService, private apiService: ApiService, private router: Router, private route: ActivatedRoute,private cookieService: CookieService) {

    this.signUpForm = new FormGroup({
      name: new FormControl(),
      phone: new FormControl('', Validators.minLength(10))
    });

    this.verifyotp = new FormGroup({
      otp1: new FormControl(null),
      otp2: new FormControl(null),
      otp3: new FormControl(null),
      otp4: new FormControl(null)
    });
  }

  ngOnInit() {
    //FOR BACKTRACK WHEN USER GOES TO SETTING FROM LOGIN TERM AND CONDITION START
    this.langLogin = this.route.snapshot.data.lang;
    this.nextString = 'आगे बढ़ें';
    this.langType = this.langLogin['langauge'];
    if(this.route.snapshot.queryParams.type == 'login') {
      this.isloginTrue = true;
      this.islangTrue = false;
    } else if(this.route.snapshot.queryParams.type == 'lang') {
      this.islangTrue = true;
      this.isloginTrue = false;
    } else {
      this.islangTrue = true;
    }
    //FOR BACKTRACK WHEN USER GOES TO SETTING FROM LOGIN TERM AND CONDITION END

    
    if (localStorage.getItem('loggedIn') != null && localStorage.getItem('userDetail') != null && localStorage.getItem('userDetail') != undefined) {
      // already logged in
      this.userDetail = localStorage.getItem('userDetail') != undefined ? localStorage.getItem('userDetail') : {};
      this.loggedIn = localStorage.getItem('loggedIn');

    } else {
      //not logged in
      this.authService.authState.subscribe((user) => {
        this.user = user;
        if (this.user != null) {
          
          let url = 'user/socialLogin';
          let reqData = {
            "type": "web",
            "provider": this.user.provider,
            "fbId": (this.user.provider == 'FACEBOOK' ? this.user.id : ''),
            "googleId": (this.user.provider == 'GOOGLE' ? this.user.id : ''),
            "lang": (this.lang != undefined) ? this.lang : 'hin',
            "email": (this.user.email != undefined) ? this.user.email : '',
            "userName": (this.user.firstName != undefined && this.user.lastName != undefined) ? (this.user.firstName + ' ' + this.user.lastName) : 'User',
            "deviceId": ""
          }

          this.apiService.getPostData(url, reqData).subscribe(response => {
            if (response['responseCode'] == 200) {
              // this.loggedIn = true;
              // this.userDetail = response['data'].UserDetail != undefined ? response['data'].UserDetail : {};
              
              // localStorage.setItem('userDetail', JSON.stringify(this.userDetail));
              // localStorage.setItem('loggedIn', JSON.stringify(this.loggedIn));
              // this.router.navigate(['/']);

              this.setLoginTrue(response);
            } else {
              this.loggedIn = false;
              this.userDetail = {};
            }
          });

        }
      });
    }
  }

  // set login to true
  setLoginTrue(response){
    this.loggedIn = true;
    this.userDetail = (response['data']['UserDetail'] != undefined ? response['data']['UserDetail'] : {});
    localStorage.setItem('userDetail', JSON.stringify(this.userDetail));
    localStorage.setItem('loggedIn', JSON.stringify(this.loggedIn));
    this.router.navigate(['/']);
    this.apiService.showHideSnackbar({'status': true, 'type':'lgToast', 'msg': 'loginSuccesfull' ,'actionText': null, 'autoHide': true})
  }

  //LANG SELECT SCREEN
  changeClass(selectlang) {
    this.nextBtnDisabled = false;
    if (selectlang == 'en') {
      this.lang = 'en';
      this.checked1 = true;
      this.checked2 = false
      this.nextString = 'NEXT';
    } else {
      this.lang = 'hin';
      this.checked1 = false;
      this.checked2 = true;
      this.nextString = 'आगे बढ़ें';
    }
    this.cookieService.set('lang', this.lang)   
  }

  // GO TO PRELOGIN SCREEN
  goNextToLogin() { 
    this.isloginTrue = true;
    this.islangTrue = false;
    this.lang= this.cookieService.get('lang');
    
    this.langLogin = require('./../../assets/language/'+this.lang+'.json')
    this.router.navigate(['auth'], { queryParams: {type: 'login'} }); 
    $('body').attr('id', this.lang);    
  }

  ShowLang() {
    // this.lang =  (this.lang == "en") ? "English" : "हिंदी" ;
    return (this.cookieService.get('lang') == 'en') ? "English" : "हिंदी";
  }

  //CHANGE LANGAUGE SELECTED BY USER
  changeLang() {
    this.checked1 = this.checked2 = false;
    this.nextBtnDisabled = true;
    this.islangTrue = true;
    this.isloginTrue = false;
    this.router.navigate(['auth'], { queryParams: {type: 'lang'} });
  }

  //LOGIN WITH GOOGLE
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  //LOGIN WITH FACEBOOK
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  //LOGOUT USER
  signOut(): void {
    this.authService.signOut();
    this.loggedIn = false;
    this.userDetail = {};
  }

  //LOGIN FORM
  LoginForm() {
    this.getOtpBtnDisabled = true;
    this.isdetailsTrue = true;
    this.isloginTrue = false;
  }

  onSubmitGetOtpFormSignUp(form) { 
    //TIMER START
    this.countdown.restart();
    //TIMER END

    if (form.invalid) {
      return;
   }

    const formValue = this.signUpForm.value
    if (!formValue.name) {
      this._showGetOtpFormMessage = "Name is requied";
      return false;
    }
    
    if (!formValue.phone) {
      this._showGetOtpFormMessage = "Mobile number is required.";
      return false;
    }
    
    this.apiService.manageLoader(true);
    
    this.isloginOtpTrue = true;
    this.isloginTrue = false;
    this.islangTrue = false;
    this.isdetailsTrue = false;
    this.mobileNumber = formValue.phone;
    this.name = formValue.name;

    let url = Constants.url.userGetOtp;
    let reqData = {
      userName: formValue.name,
      mobileNumber: formValue.phone,
      "type": "web"
    }

    this.apiService.getPostData(url, reqData).subscribe(response => {
      if (response["responseCode"] == 204) {
        this.apiService.manageLoader(false);
        return false;
      } else if(response["responseCode"] == 400 ) {
        this.apiService.manageLoader(false);
        this._showGetOtpFormMessage = "Maximum limit exceed";
        return false;
      } else {
        //successfully
        this.apiService.manageLoader(false);
        this.userId = response['data']['_id'];
      }
    });
  }

  // validate and call the api for validate OTP
  verifyOtp() {
    var lang = this.cookieService.get('lang');
    this._showGetOtpFormMessage = '';
    const formValue = this.verifyotp.value;
    if (formValue.otp1==null || formValue.otp2==null || formValue.otp3==null || formValue.otp4==null) {
      this._showVerifyOtpFormMessage = 'OTP Is required';
      return false;
    }

    var otp = "" + formValue.otp1 + formValue.otp2 + formValue.otp3 + formValue.otp4;
    let url = Constants.url.verifyOTP;
    let reqData = {
      'id': this.userId,
      'otp': otp,
      'isNumChanged': false,
      "type": "web"
    }

    this.apiService.getPostData(url, reqData).subscribe(response => {
      if (response["responseCode"] !== 200) {
        //otp not match
        this._showGetOtpFormMessage = "The OTP entered is incorrect, please try again.";
        if(lang == 'hin') {
          this._showGetOtpFormMessage = "गलत ओ टी पी डाला गया है, पुनः प्रयास करें।";
        }
        return false;
      } else {
        //successfully loggedIn
        // this.loggedIn = true;
        // this.userDetail = (response['data']['UserDetail'] != undefined ? response['data']['UserDetail'] : {});
        // localStorage.setItem('userDetail', JSON.stringify(this.userDetail));
        // localStorage.setItem('loggedIn', JSON.stringify(this.loggedIn));
        // this.router.navigate(['/']);

        this.setLoginTrue(response);
      }
    });

  }

  // resend OTP click action
  resendOtp() {
    $('#otp1').val('');
    $('#otp2').val('');
    $('#otp3').val('');
    $('#otp4').val('');

    this.timeLeft = 100;
    this._showGetOtpFormMessage = '';

    let url = Constants.url.userGetOtp;

    let reqData = {
      userName: this.name,
      mobileNumber: this.phone,
      "type": "web"
    }

    this.apiService.getPostData(url, reqData).subscribe(response => {
      if (response["responseCode"] == 204) {
        //otp not match
        this._showGetOtpFormMessage = "";
        return false;
      } else if(response["responseCode"] == 400 ) {
        this.apiService.manageLoader(false);
        this._showGetOtpFormMessage = "Maximum limit exceed";
        return false;
      } else {
        //successfully
        this.loggedIn = false;
      }
    });
  }


  //NOTIFY EVENT WHEN TIME IS ZERO
  handleEvent2(e: CountdownEvent) {
    
    this.notify = e.action.toUpperCase();
    if (e.action === 'notify') {
      this.notify += ` - ${e.left} ms`;
    }

    if (e.left == 0) {
      this.timeLeft = e.left;
    }
  }

  // show the messages
  showmsg() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
  }

  // moveNext($event, number){ 
  //   // console.log($event);
  //   // console.log(number);
       
  //   if($event != null && $event != ''){
  //     var positionNumber = number + 1;
  //     if(number > 3){
  //       positionNumber = 4;
  //     }
  //   }else{
  //     positionNumber = number - 1;
  //   }

  //   $("#otp"+positionNumber).focus();
  // }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if(this.isloginOtpTrue) {
      var number = parseInt((((<HTMLInputElement>event.target).id).split('otp'))[1])
      if(event.keyCode != 8 && (event.keyCode > 46 && event.keyCode < 58)){
            var positionNumber = number + 1;
            if(number > 3){
              positionNumber = 4;
            }            
            setTimeout(function() {document.getElementById("otp"+positionNumber).focus();},300)
            // setTimeout(function() {
            //   document.getElementById("otp"+positionNumber).value = event.key;
            // },600)
      }
      
    }
    
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent1(event: KeyboardEvent) { 
    if(this.isloginOtpTrue) {
      if(event.keyCode === 8) {
        var number = parseInt((((<HTMLInputElement>event.target).id).split('otp'))[1]);
        var positionNumber = number - 1;
        (<HTMLInputElement>document.getElementById("otp"+number)).value = '';
        setTimeout(function() {document.getElementById("otp"+positionNumber).focus();},300)
      }
      
    }
    
  }
}
