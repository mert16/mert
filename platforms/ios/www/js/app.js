// MERT App based on IONIC Framework

/*
app.js
(c) Philip Pang, July 2016

Initial codebase written by Philip Pang with enhancements
by:
- David Prasad
- Ratheesh Kumar
*/


var curDate = new Date();
var dd = curDate.getDate();
var wd = curDate.getDay();
var mm = curDate.getMonth();
var yy = curDate.getFullYear();
var today = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mert', ['ionic', 'controllers', 'services',
  'ngStorage', 'forceng', 'ngCordova'])

  .constant("MertServer", "edu.ipg.4u.sg")

  .constant("MertVersion", "Mert version 3.0")

  .run(function ($ionicPlatform, $http, $state, $localStorage, $ionicLoading, force,
    $timeout, Analytics, $cordovaFile, $cordovaCalendar, $rootScope) {

    db("App.run()", 1);

    $rootScope.outerNavBarShow = true;

    // init doJSONP2
    doJSONP2($http, true);

    // init vault
    vault("init", $localStorage);

    // init changeView
    changeView (null, "initialise", $state, $rootScope);

    // initi showWait
    showWait("init", $ionicLoading);

    // ionic and cordova are ready
    $ionicPlatform.ready(function () {

      db("ionicPlatform ready in .run!", 3);

      // init sfHelper library
      sfInitUauth(force);

      // init fileHelper
      fileHelper("init", $cordovaFile);

      // init calendar
      calHelper ("init",$cordovaCalendar);

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

    }); // end $ionicPlatform ready


    // check for network on resuming app
    $ionicPlatform.on('resume', function (ev) {
      db("Resumed!", 1);
      Analytics.log("time");
    }); // end ionicPlatform on resume


    // save analytics data on App suspending
    $ionicPlatform.on('pause', function (ev) {
      var analyticsObj = Analytics.getModel ();
      fileHelper("write", "analytics.txt", JSON.stringify(analyticsObj));
    }); // end ionicPlatform on pause

  }) // end .run()

  .config(function ($stateProvider, $urlRouterProvider) {

    db("App.config()", 1);

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // initialisation state for the app
      .state('init', {
        url: '/init',
        templateUrl: 'templates/init.html',
        controller: 'InitCtrl'
      })

      // initialisation state for the app
      .state('nonetwork', {
        url: '/nonetwork',
        templateUrl: 'templates/nonetwork.html',
        controller: 'NoNetworkCtrl'
      })

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'TabsCtrl'      
      })

      // Each tab has its own nav history stack:

      .state('tab.resources', {
        url: '/resources',
        views: {
          'tab-resources': {
            templateUrl: 'templates/tab-resources.html',
            controller: 'ResourceCtrl'
          }
        }
      })
      .state('tab.res-bookings', {
        url: '/resources/bookings/:resID',
        views: {
          'tab-resources': {
            templateUrl: 'templates/res-bookings.html',
            controller: 'ResourceBookingCtrl'
          }
        }
      })
      .state('tab.res-timeslots', {
        url: '/resources/timeslots/:date/:dow/:resid',
        views: {
          'tab-resources': {
            templateUrl: 'templates/res-timeslots.html',
            controller: 'ResourceTimeslotCtrl'
          }
        }
      })
      .state('tab.res-addbooking', {
        url: '/resources/addbooking/:date/:hour/:resid',
        views: {
          'tab-resources': {
            templateUrl: 'templates/res-addbooking.html',
            controller: 'ResourceAddbookingCtrl'
          }
        }
      })
      .state('tab.res-info', {
        url: '/resources/info/:resID',
        views: {
          'tab-resources': {
            templateUrl: 'templates/res-info.html',
            controller: 'ResourceInfoCtrl'
          }
        }
      })

      .state('tab.bookings', {
        url: '/bookings',
        views: {
          'tab-bookings': {
            templateUrl: 'templates/tab-bookings.html',
            controller: 'BookingsCtrl'
          }
        }
      })
      .state('tab.bookings-info', {
        url: '/bookings/info/:resID',
        views: {
          'tab-bookings': {
            templateUrl: 'templates/res-info.html',
            controller: 'ResourceInfoCtrl'
          }
        }
      })

      .state('tab.request', {
        url: '/request',  // locn bar /#/tab/request
        views: {
          'tab-request': {
            templateUrl: 'templates/tab-request.html',
            controller: 'RequestCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/init');

  });

// check whether loaded
db ("app.js loaded",0);
