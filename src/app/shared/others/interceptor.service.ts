import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { throwError, from } from 'rxjs';
import { catchError, retry } from 'rxjs/internal/operators';
import { environment } from './../../../environments/environment';
import { Constants } from './constants';

import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private cookieService: CookieService, private apiService: ApiService) { }

  intercept(req, next){
    let langParam = this.getLangFromCookies();
    let userId = this.apiService.getUserId();
    if (req.method == 'GET') {
        if(!req.url.match('.json'))
        {
          if(userId==null)
          {
            req = req.clone({
                url: environment.baseUrl+req.url,
                setParams: {"lang":langParam}
            });
          }
          else if(req.url.match(Constants.url.getFeaturedArtistList) || req.url.match(Constants.url.getShowDetails) || req.url.match(Constants.url.getContinueWatchingList) || req.url.match(Constants.url.getUserDetail))
          {
            req = req.clone({
                url: environment.baseUrl+req.url,
                setParams: {"lang":langParam, "id":userId}
            });
          }
          else
          {
            req = req.clone({
                url: environment.baseUrl+req.url,
                setParams: {"lang":langParam, "userId":userId}
            });
          }
        }
        else
        {
            req = req.clone({
                url: Constants.url.languageJSON+langParam+req.url
            })
        }        
   }
   else if (req.method == 'POST') {
      // adding the language params in the requested data
      req.body['lang'] = langParam;
      req.body['type'] = 'web';
      req.body['deviceId'] = 'N/A';
      if(userId!=null)
      {
        if(req.url.match(Constants.url.verifyOTP))
          req.body['id']= userId;
        else
          req.body['userId']= userId;
      }
      req = req.clone({
        url: environment.baseUrl+req.url,
          // headers: req.headers.set('Authorisation', 'Bearer AAAAA'),
          // body: req.body
      });
   }
    
    return next.handle(req).pipe(
      retry(2),
      catchError((error: HttpErrorResponse) => {
        if (error.status == 401) {
          // 401 handled in auth.interceptor
          console.log('Token expired');      
        }
        else if(error.status == 400){
          console.log('Page not found'); 
        }
        else if (error.status == 403)
        {
          console.log('invalid request');
        }
        return throwError(error);
      })
    );
  }

  getLangFromCookies(){
    //let lang = "en";
    let lang = "hin";
    if ((this.cookieService.get('lang') !== '' && this.cookieService.get('lang') !== undefined)) {
      lang = this.cookieService.get('lang');
    }

    this.cookieService.set('isMuted', 'true', 1);
    return lang;
  }

}
