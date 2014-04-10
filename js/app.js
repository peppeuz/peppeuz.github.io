'use strict';
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());
var peppeuzApp = angular.module('peppeuzApp', [
 'ngRoute','peppeuzController', 'ngAnimate','ngTouch','angular-carousel'
 ]);

peppeuzApp.config(['$routeProvider', 
  function($routeProvider) 
  {
    $routeProvider.
    when('/homepage', 
    {
     templateUrl: 'angularviews/homepage.html', 
     controller: 'HomeCtrl'
   }).
    when('/development',
    {
      templateUrl: 'angularviews/development.html',
      controller: 'DevCtrl'
      }).
     when('/blogging',
    {
      templateUrl: 'angularviews/blogging.html',
      controller: 'BlogCtrl'
      }).
      when('/info',
    {
      templateUrl: 'angularviews/info.html',
      controller: 'InfoCtrl'
      }).
    otherwise({
      redirectTo: '/homepage'
    });
  }]);

console.log("App inclusa")
