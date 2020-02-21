var elem = document.documentElement;

function toggleFullScreen() {
   var doc = window.document;
   var docEl = doc.documentElement;

   var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
   var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

   if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
   }
   else {
      cancelFullScreen.call(doc);
   }
}
function openFullscreen() {
   if (elem.requestFullscreen) {
      elem.requestFullscreen();
   } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
   } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
   } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem = window.top.document.body; //To break out of frame in IE
      elem.msRequestFullscreen();
   }
}

/* Function to close fullscreen mode */
function closeFullscreen() {
   if (document.exitFullscreen) {
      document.exitFullscreen();
   } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
   } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
   } else if (document.msExitFullscreen) {
      window.top.document.msExitFullscreen();
   }
}

window.onload = function () {setTimeout(() => {
      // $('.multiple-items').slick({
         //    infinite: true,
         //    slidesToShow: 2,
         //    slidesToScroll: 1,
         //    vertical: true,
         //    verticalSwiping: true,
         //    touchThreshold: 10,
         //    mobileFirst: true
         // }); 
         // toggleFullScreen();
      //   openFullscreen();
   }, 5000);
   setTimeout(() => {
         // toggleFullScreen();
        openFullscreen();
   }, 2000);
   
}
setTimeout(() => {
      // $('.multiple-items').slick({
         //    infinite: true,
         //    slidesToShow: 2,
         //    slidesToScroll: 1,
         //    vertical: true,
         //    verticalSwiping: true,
         //    touchThreshold: 10,
         //    mobileFirst: true
         // }); 
         // toggleFullScreen();
      //   openFullscreen();
   }, 5000);
window.addEventListener("orientationchange", function () {
   if (screen.orientation.angle == 90){
      openFullscreen();
   }
   else{
      closeFullscreen();
      // openFullscreen();
   }
});
// var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// if (!iOS || false){
//    window.screen.orientation.onchange = function () {
//       if (this.type.startsWith('landscape')) {
//          // document.body.requestFullscreen();
//          toggleFullScreen();
//          // document.querySelector('.video-js').webkitRequestFullscreen();
//       } else if (this.type.startsWith('portrait')) {
//          //   document.body.exitFullscreen();
//          toggleFullScreen();
//          // document.querySelector('.video-js').webkitExitFullscreen();
//       }
//    };
// }

// window.onorientationchange = function () {
// };
// window.addEventListener("orientationchange", function () {
// });

// var container = document.querySelector('#container');
// var video = document.querySelector('video');
// var controls = document.querySelector('#controls');
// var play = document.querySelector('#play');
// var fullscreen = document.querySelector('#fullscreen');

//     play.onclick = function() {
//       if (video.paused) {
//       video.play();
//    play.innerHTML = 'pause';
//       } else {
//       video.pause();
//    play.innerHTML = 'play_arrow';
//  }
// };
//     fullscreen.onclick = function() {
//       if (document.webkitFullscreenElement != container) {
//       container.webkitRequestFullScreen();
//    window.screen.orientation.lock('landscape');
//    fullscreen.innerHTML = 'fullscreen_exit';
//       } else {
//       document.webkitExitFullscreen();
//    fullscreen.innerHTML = 'fullscreen';
//  }
// };

//     document.onwebkitfullscreenchange = function() {
//       if (document.webkitFullscreenElement != container) {
//       fullscreen.innerHTML = 'fullscreen';
//  }
// };
