// Ionic Starter App

var curDate = new Date();
var dd = curDate.getDate();
var wd = curDate.getDay();
var mm = curDate.getMonth();
var yy = curDate.getFullYear();
var today = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);

gv_Bookings = [
  {
    id: "0",
    res: "1",
    user: "Philip",
    begDate: getNextDate(today, 0),
    begTime: "0100",
    endDate: getNextDate(today, 0),
    endTime: "0200"
  },
  {
    id: "1",
    res: "1",
    user: "Philip",
    begDate: getNextDate(today, 0),
    begTime: "1000",
    endDate: getNextDate(today, 0),
    endTime: "1130"
  },
  {
    id: "2",
    res: "2",
    user: "David",
    begDate: getNextDate(today, 1),
    begTime: "1500",
    endDate: getNextDate(today, 2),
    endTime: "1000"
  },
  {
    id: "3",
    res: "3",
    user: "Benny",
    begDate: getNextDate(today, 2),
    begTime: "1100",
    endDate: getNextDate(today, 2),
    endTime: "1500"
  },
  {
    id: "4",
    res: "4",
    user: "Francis",
    begDate: getNextDate(today, 3),
    begTime: "0900",
    endDate: getNextDate(today, 3),
    endTime: "1600"
  },
  {
    id: "5",
    res: "5",
    user: "Ratheesh",
    begDate: getNextDate(today, 4),
    begTime: "0830",
    endDate: getNextDate(today, 4),
    endTime: "1200"
  }
];

gv_ResourceCtrlScope = null;
gv_beaconObj = null;

function intervalLooper() {
  var n = (new Date()).getTime();
  gv_beaconObj && gv_beaconObj.setNumber(n);

  var p = prompt("Enter new author name", "Philip");
  if (p === false || p === "") p = "nobody";
  gv_beaconObj && gv_beaconObj.setAuthor(p);

  //alert ("current beacon num " + gv_beaconObj.getModel().number);

  gv_ResourceCtrlScope && gv_ResourceCtrlScope.update();

  if (!confirm("new beacon n " + n)) return;
  setTimeout(intervalLooper, 2000);
}

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mert', ['ionic', 'controllers', 'services'])

  .run(function ($ionicPlatform) {

    if (!confirm("App.run()")) return;

    $ionicPlatform.ready(function () {

      alert("ionicPlatform ready!");
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

      //setTimeout (intervalLooper,2000);
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        //abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.home', {
        url: '/home',  // locn bar /#/tab/resources
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeCtrl'
          }
        }
      })

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
        url: '/resources/addbooking',
        views: {
          'tab-resources': {
            templateUrl: 'templates/res-addbooking.html',
            controller: 'ResourceAddbookingCtrl'
          }
        }
      })
      .state('tab.res-info', {
        url: '/resources/info/1',
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
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

  });
