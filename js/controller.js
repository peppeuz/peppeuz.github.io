'use strict';

console.log("Controller incluso");

var peppeuzController = angular.module('peppeuzController', []);

peppeuzController.controller('HomeCtrl', ['$scope','$log',
	function($scope, $log) 
	{
		$log.log("Controller home");
	}]);

peppeuzController.controller('IndexCtrl',['$scope', '$rootScope','$log','$location','$timeout',
	function($scope, $rootScope,$log, $location,$timeout)
	{

		$scope.arrayPagine = ["homepage","development","blogging","info"];
		$scope.indexArray = 0;
		$scope.change = function (bool) 	
		{
			if(bool)
			{
				if($scope.indexArray>0){
					$scope.indexArray--;
					$location.path($scope.arrayPagine[$scope.indexArray]);
				}
			}
			else
			{
				if($scope.indexArray<3)
				{
					$scope.indexArray++;
					$location.path($scope.arrayPagine[$scope.indexArray]);
				}
			}
		}
		$rootScope.deviceWidth = window.width ;
		$rootScope.larghezzaInfo = {width:$rootScope.deviceWidth +"px"};
		$log.log($rootScope.deviceWidth);

		window.onresize = function(){
			$rootScope.deviceWidth = window.width ;
		$rootScope.larghezzaInfo = {width:$rootScope.deviceWidth +"px"};
			$log.log($rootScope.deviceWidth);

		}
		$rootScope.$on('$locationChangeSuccess', function() {


			$scope.homeActive =false;
			$scope.devActive = false;
			$scope.blogActive=false;
			$scope.infoActive=false;

			if($location.$$path.indexOf("homepage")!=-1)
			{
				$log.log("home");
				$scope.bgcolor="#bdc3c7";
				$scope.homeActive =true;
			}
			else if($location.$$path.indexOf("deve")!=-1)
			{
				$log.log("dev");
				$scope.bgcolor="#27ae60";
				$scope.devActive =true;

			}	
			else if($location.$$path.indexOf("blog")!=-1)
			{
				$log.log("blog");
				$scope.bgcolor="#2980b9";
				$scope.blogActive =true;

			}	
			else if($location.$$path.indexOf("info")!=-1)
			{
				$log.log("info");
				$scope.bgcolor="#c0392b";
				$scope.infoActive =true;

			}	
		});

	}]);

peppeuzController.controller('DevCtrl', ['$scope','$log',
	function($scope, $log) 
	{
		$log.log("Controller dev");
	}]);

peppeuzController.controller('BlogCtrl',['$scope', '$log',
	function($scope, $log){
		$log.log("Controller blog");
	}]);


peppeuzController.controller('InfoCtrl',['$scope', '$log',
	function($scope, $log){
		$log.log("Controller Info");
		
	}]);