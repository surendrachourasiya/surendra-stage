
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
if (raw !== null && raw[2] > '77') {
  isHLSPlayed = false;
}

export const environment = {
  production: true,
  baseUrl: 'https://api.stage.in/',
  domainUrl: 'https://stage.in/',
  sharedUrl: 'https://stage.in',
  autoPlayVideoDuration: 2000, // in sec
  autoPlayVideoWindow: 0.25,  // in percentage
  showMoreLessLimit: 100, //show more or less character limit
  appUrl: 'https://play.google.com/store/apps/details?id=in.stage',
  deviceType: deviceType,
  isHLSPlayed: isHLSPlayed,
  videoBitRate: 240,
  destroyTimeout: 500,
  cloudFrontPath: "https://d2tlhrnhiaq7gn.cloudfront.net",
  amplitudeKey: '1e4cc6fe419f87ee8e921095e698a8d5',
  defaultLang: 'hin'
};
