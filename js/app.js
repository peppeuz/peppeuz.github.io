'use strict';

var peppeuzApp = angular.module('peppeuzApp', [
 'ngRoute','peppeuzController', 'ngAnimate','ngTouch',
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
