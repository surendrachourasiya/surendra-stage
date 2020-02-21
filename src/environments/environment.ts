// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var deviceType = '';
var isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
if (isMobile) {
  deviceType = "ios";
  var isIOSMobile = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);
  if (!isIOSMobile) {
    deviceType = "android";
  }
} else {
  deviceType = "desktop";
}

var isHLSPlayed = true;
var raw = window.navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
if (raw !== null && raw[2] > '77'){
  isHLSPlayed = false;
}

export const environment = {
  production: false,
  //baseUrl: 'https://devapi.stage.in/',
  baseUrl: 'https://testapi.stage.in/',
  appUrl : 'https://play.google.com/store/apps/details?id=in.stage',
  domainUrl: 'https://dev.stage.in/',
  sharedUrl: 'https://dev.stage.in',
  autoPlayVideoDuration: 2000, // in sec
  autoPlayVideoWindow: 0.25,  // in percentage
  showMoreLessLimit: 100, //show more or less character limit
  deviceType: deviceType,
  isHLSPlayed: isHLSPlayed,
  videoBitRate: 240,
  destroyTimeout: 500,
  cloudFrontPath: "https://d2tlhrnhiaq7gn.cloudfront.net",
  amplitudeKey: '0ff376ce2adc95a1d5698fd38e2ce91c',
  defaultLang: 'hin'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
