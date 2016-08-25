// MERT App based on IONIC Framework

/*
controllers.js
(c) Philip Pang, July 2016

Initial codebase written by Philip Pang with enhancements
by:
- David Prasad
- Ratheesh Kumar
*/

angular.module('controllers', [])

  // Tabs controller controls tabs and side menu
  .controller('TabsCtrl', function ($scope, User, MertVersion, Analytics) {

    $scope.user = User.getName();

    $scope.showAbout = function () {
      var ht = MertVersion + "\n(c)Aug 2016\n\nPhilip Pang\nDavid Prasad\nRatheesh Kumar";
      popAlert(ht, "About");
    };

    $scope.showAnalytics = function () {
      popAlert(Analytics.getReport(), "Analytics");
    };

    $scope.showTutorial = function () {
      changeView(null, "setTutorialMode");
      changeView("init");
    };

  })

  // controller for "Init" view (for App Registration only)
  .controller('InitCtrl', function ($scope, $ionicHistory, $timeout, User,
    MertVersion, $ionicPlatform, $cordovaNetwork, $ionicSlideBoxDelegate,
    $ionicNavBarDelegate, $window, Analytics, $rootScope) {

    db("InitCtrl", 2);

    $scope.mertVersion = MertVersion;

    $scope.$on('$ionicView.beforeLeave', function (e) {
      $rootScope.outerNavBarShow = false;
    });

    $scope.$on('$ionicView.enter', function (e) {

      $ionicPlatform.ready(function () {

        db("ionicPlatform ready in InitCtrl", 3);

        // Network Avail Check - philip
        //if (!checkNetworkHelper ()) return;
        //if (!checkNetworkStatus()) {
        //  db("No network on startup!", 5);
        //  changeView("nonetwork");
        //  return;
        //}

        // for start button in tutorial sub-view
        $scope.start = function () {
          db("InitCtrl Start clicked", 2);
          changeView(null, "clearTutorialMode");
          $ionicHistory.clearHistory();
          $ionicNavBarDelegate.showBackButton(true);
          $scope.subview = {
            splash: false,
            register: false,
            tutorial: false,
            title: ""
          };
          db("InitCtrl b4 changeView to Resources", 2);
          changeView("tab.resources");
        };

        // show tutorial if already registered
        if (changeView(null, "getTutorialMode") == true) {
          db("InitCtrl show Tutorial subview next", 2);
          changeView(null, "clearTutorialMode");
          $scope.subview = {
            splash: false,
            register: false,
            tutorial: true,
            title: "Tutorial"
          };
          $timeout();
          return;
        }

        // log app launch time
        Analytics.log("time");

        fileHelper("read", "analytics.txt").then(
          function (data) {
            var analyticsObjSaved = JSON.parse(data);
            Analytics.merge(analyticsObjSaved);
            db("Analytics: merged saved data", 70);
          },
          function (error) {
            db (error, 70);
            // do nothing if no analytics file
          }
        );

        var userObj = vault("get");

        if (userObj != null) {
          db("Found user! user/token is " + userObj.name + " / " + userObj.token, 2);
          User.setModel(userObj);
          $scope.start();
          return;
        }

        db("There is no userObj in the vault", 2);

        //var wh = $window.innerHeight;
        //$scope.imgHeight = wh - 180;

        // switch to splash sub-view
        $scope.subview = {
          splash: true,
          register: false,
          tutorial: false,
          title: "Welcome"
        };

        $timeout(function () {

          // switch to user registration sub-view
          $scope.subview = {
            splash: false,
            register: true,
            tutorial: false,
            title: "Registration"
          };

        }, 4000);

        User.reset();
        $scope.user = User.getModel();

        $scope.registerUser = function () {

          // this is actually a ticket
          var tkt = User.getToken();
          showWait("visible", "Registering User: " + $scope.user.name);

          getUserToken(User.getName().toLowerCase(), tkt).then(
            function (token) {

              showWait("hide");
              $scope.subview.register = false;

              db("Token is " + token, 2);

              // update User svc
              User.setToken(token);

              // store token in persistent storage
              vault("put", $scope.user);

              $scope.subview = {
                splash: false,
                register: false,
                tutorial: true,
                title: "Tutorial"
              };
              $timeout();
            },

            function (error) {
              showWait("hide");
              popAlert(error, "Message");
            }
          );
        }; // end of $scope.registerUser()

        // for next slide in tutorial sub-view (david)
        $scope.nextSlide = function () {
          $ionicSlideBoxDelegate.next();
        };

      }); // end of $ionicPlatform.ready()

    }); // end of $scope.$on ()
  })  // end of .controller - Init


  // controller for "no network" message (transient)
  .controller('NoNetworkCtrl', function ($scope, $timeout, $ionicNavBarDelegate, $ionicHistory) {
    db("NoNetworkCtrl", 2);

    $scope.$on('$ionicView.enter', function (e) {
      $ionicNavBarDelegate.showBackButton(false);
    });

    $scope.restart = function () {
      db("restart!", 4);
      if (!checkNetworkStatus()) {
        popAlert("Sorry, Internet is still not available", "Message");
        return;
      }

      //changeView("tab.resources");
      db("restart b4 changeView to init", 4);
      $ionicHistory.clearHistory();
      changeView("init");
    };
  }) // end of .controller() - "NoNetwork"


  // controller for "Resources tab" view
  .controller('ResourceCtrl', function ($scope, $timeout, Resources,
    MertServer, Analytics) {

    db("ResourceCtrl", 2);

    $scope.MertServer = MertServer;

    $scope.$on('$ionicView.enter', function (e) {

      db("ResourceCtrl Logging analytics", 2)
      Analytics.log("resources");

      db("ResourceCtrl getting resourcex next", 2)
      Resources.getModel().then(
        function (data) {
          db("Resource controller: resource count = " + data.length, 2);
          $scope.resources = data;
          $timeout(); // update view
        },
        function (error) {
          db("Resource controller: get res model error: " + error, 2);
          popAlert(error);
        }
      );
    });

    $scope.doRefresh = function () {
      db("Refresh Resources Tab!", 2);
      Resources.refresh().then(
        function (data) {
          $scope.bookings = data;
          $scope.$broadcast("scroll.refreshComplete");
        },
        function (error) {
          popAlert(error);
        }
      );
    };
  }) // end of .controller - Resource


  // controller for "Resources tab > Bookings" view
  .controller('ResourceBookingCtrl', function ($scope, $stateParams, $timeout,
    Resources, AvailDates, MertServer, Bookings, Analytics) {

    db("ResourceBookingCtrl resID " + $stateParams.resID, 2);

    $scope.$on('$ionicView.enter', function (e) {
      Analytics.log("calendar");
    });

    $scope.res = Resources.get($stateParams.resID);

    $scope.dates = AvailDates.getModel();

    $scope.MertServer = MertServer;

    // load Bookings array as necessary
    Bookings.getModel();

    $scope.isNonZero = function (n) {
      if (n != 0) return true;
      return false;
    };

    $scope.getbookingcount = function (rid, dt) {
      db("Get booking count for res " + rid + " on " + dt, 2);
      var cnt = Bookings.getBookingSlotCount(rid, dt);
      return cnt;
    };

    $scope.getbookingpercent = function (rid, dt) {
      db("Get booking percentage for res " + rid + " on " + dt, 2);
      var pcArr = [];
      pcArr[0] = Bookings.getBookingPercent(rid, dt);
      pcArr[1] = 100 - pcArr[0];
      return pcArr;
    };

  }) // end of .controller - ResourceBooking


  // controller for "Resources tab > Bookings > Selected Date" view
  .controller('ResourceTimeslotCtrl', function ($scope, $stateParams, $timeout,
    Resources, Bookings, User, Analytics) {

    db("ResourceTimeslotCtrl", 2);

    $scope.$on('$ionicView.enter', function (e) {
      Analytics.log("timeslots");
    });

    // load Bookings array as necessary
    Bookings.getModel();

    // logged in user object
    $scope.user = User.getModel();

    // generate array for daily timeslots 
    $scope.hours = makeHoursArray();

    $scope.itemcolor = function (rid, dt, tm) {
      if (Bookings.isBooking(rid, dt, tm)) return "item-energized";
      return "item-light";
    };

    $scope.isbooking = function (rid, dt, tm) {
      return Bookings.isBooking(rid, dt, tm);
    };

    $scope.bookingID = function (rid, dt, tm) {
      return Bookings.getBookingID(rid, dt, tm);
    };

    $scope.bookingUser = function (rid, dt, tm) {
      var booking = Bookings.getBooking(rid, dt, tm);
      if (booking == null) return " ";
      return booking.user;
    };

    $scope.delbooking = function (id) {
      db("Delete booking ID " + id, 2);

      // get booking object before deleting it
      var bookObj = Bookings.getBookingById(id);

      Bookings.delBooking(id).then(
        function (status) {

          Bookings.refresh().then(
            function (data) {
              //$scope.bookings = data;
              $timeout();
            }
          );

          var d1Obj = explodeDateTime(bookObj.begDate + " " + bookObj.begTime);
          var d2Obj = explodeDateTime(bookObj.endDate + " " + bookObj.endTime);

          var delOpts = {
            startDate: new Date(d1Obj.yy, d1Obj.mo - 1, d1Obj.dd, d1Obj.hh, d1Obj.mm, 0, 0),
            endDate: new Date(d2Obj.yy, d2Obj.mo - 1, d2Obj.dd, d2Obj.hh, d2Obj.mm, 0, 0)
          };

          calHelper("delete", delOpts).then(
            function (success) {
              popAlert("Calendar event deleted", "Message");
            },
            function (error) {
              if (Object.keys(error).length == 0) return;
              popAlert(error, "Error");
            }
          );
        }
      );
    };

    $scope.doRefresh = function () {
      Bookings.refresh().then(function () {
        $scope.$broadcast("scroll.refreshComplete");
      });
    };

    $scope.date = $stateParams.date;
    $scope.dow = $stateParams.dow;
    $scope.res = Resources.get($stateParams.resid);
  }) // end of .controller - ResourceTimeSlot


  // controller for "Resources tab > Bookings > Selected Date > Add" view
  .controller('ResourceAddbookingCtrl', function ($scope, $stateParams, $timeout, $ionicHistory,
    Resources, Bookings, User, Analytics, MertServer) {

    db("ResourceAddBookingCtrl", 2);

    $scope.MertServer = MertServer;

    $scope.$on('$ionicView.enter', function (e) {
      Analytics.log("add");
    });

    // load Bookings array as necessary
    Bookings.getModel();

    // generate array for daily timeslots 
    $scope.hours = makeHoursArray();

    $scope.res = Resources.get($stateParams.resid);

    $scope.user = User.getModel();

    //$scope.date = $stateParams.date;
    //$scope.hour = $stateParams.hour;
    $scope.begin = {
      date: $stateParams.date,
      time: $stateParams.hour
    };

    $scope.end = {};

    $scope.getNextDate = getNextDate;
    $scope.getNextTime = getNextTime;

    $scope.addbooking = function () {

      Bookings.addBooking($scope.res.id, $scope.user.name, $scope.begin.date, $scope.begin.time,
        $scope.end.date, $scope.end.time).then(
        function (data) {

          Bookings.refresh().then(
            function (status) {
              db("Go back to prev view", 2);
              $ionicHistory.goBack(-1);
            }
          );

          var d1Obj = explodeDateTime($scope.begin.date + " " + $scope.begin.time);
          var d2Obj = explodeDateTime($scope.end.date + " " + $scope.end.time);

          var addOpts = {
            title: $scope.res.name + " booking",
            location: "MERT",
            notes: "",
            startDate: new Date(d1Obj.yy, d1Obj.mo - 1, d1Obj.dd, d1Obj.hh, d1Obj.mm, 0, 0),
            endDate: new Date(d2Obj.yy, d2Obj.mo - 1, d2Obj.dd, d2Obj.hh, d2Obj.mm, 0, 0)
          };

          calHelper("add", addOpts).then(
            function (success) {
              popAlert("Calendar event added", "Message");
            },
            function (error) {
              if (Object.keys(error).length == 0) return;
              popAlert(error, "Error");
            }
          );

        },
        function (reason) {
          popAlert(reason, "Error");
        }
        );
    };
  }) // end of .controller - ResourceAddBooking


  // controller for "Resources tab > Bookings > Info" view
  .controller('ResourceInfoCtrl', function ($scope, $stateParams, $timeout,
    Resources, MertServer, Analytics) {

    db("ResourceInfoCtrl resID " + $stateParams.resID, 2);

    $scope.$on('$ionicView.enter', function (e) {
      Analytics.log("info");
    });

    var resObj = Resources.get($stateParams.resID);
    $scope.res = resObj;

    $scope.MertServer = MertServer;

    var specsArr = resObj.specs.split(",");
    $scope.specsArr = specsArr;
  }) // end of .controller - ResourceInfo


  // controller for "Bookings tab" view
  .controller('BookingsCtrl', function ($scope, $timeout,
    Bookings, Resources, User, Analytics) {

    db("BookingsCtrl", 2);

    $scope.$on('$ionicView.enter', function (e) {

      Analytics.log("bookings");

      // get Bookings Data and make available to the view
      Bookings.getModel().then(
        function (data) {
          db("Bookings controller: bookings count = " + data.length, 2);
          $scope.bookings = data;
          $timeout(); // update view
        },
        function (error) {
          popAlert(error);
        }
      );

      $scope.user = User.getName();

      $scope.filterHashSpec = {
        user: $scope.user
      };

    });

    // get Resources data required to support methods in Resources
    Resources.getModel();

    $scope.resObj = function (id) {
      var res = Resources.get(id);
      return res;
    };

    $scope.delbookingByID = function (id) {
      db("Delete booking ID " + id, 2);

      // get booking object before deleting it
      var bookObj = Bookings.getBookingById(id);

      Bookings.delBooking(id).then(
        function (status) {

          Bookings.refresh().then(
            function (data) {
              $scope.bookings = data;
              $timeout();
            }
          );

          var d1Obj = explodeDateTime(bookObj.begDate + " " + bookObj.begTime);
          var d2Obj = explodeDateTime(bookObj.endDate + " " + bookObj.endTime);

          var delOpts = {
            startDate: new Date(d1Obj.yy, d1Obj.mo - 1, d1Obj.dd, d1Obj.hh, d1Obj.mm, 0, 0),
            endDate: new Date(d2Obj.yy, d2Obj.mo - 1, d2Obj.dd, d2Obj.hh, d2Obj.mm, 0, 0)
          };

          calHelper("delete", delOpts).then(
            function (success) {
              popAlert("Calendar event deleted", "Message");
            },
            function (error) {
              if (Object.keys(error).length == 0) return;
              popAlert(error, "Error");
            }
          );

        }
      );
    };

    $scope.doRefresh = function () {
      db("Refresh Bookings Tab!", 2);
      Bookings.refresh().then(
        function (data) {
          $scope.bookings = data;
          $scope.$broadcast("scroll.refreshComplete");
        },
        function (error) {
          popAlert(error);
        }
      );
    };

  }) // end of .controller() - Bookings


  // controller for "Request tab" view"
  .controller('RequestCtrl', function ($scope, $timeout, $window, User,
    MertVersion, Analytics) {

    db("RequestCtrl", 2);

    angular.element($window).bind("resize", function () {
      var wh = $window.innerHeight;
      $scope.taHeight = wh - 360; // -60
      $timeout();
    });

    $scope.$on('$ionicView.enter', function (e) {
      Analytics.log("request");

      var wh = $window.innerHeight;
      $scope.taHeight = wh - 360; // - 60;

      $scope.mertVersion = MertVersion;

      // Asset_Request__c Object Name
      // .Name__c, .Message__c Field Names
      $scope.assetRequest = {
        Name__c: User.getName(),
        Message__c: ""
      };
    }); // end of $scope.$on

    $scope.sendRequest = function () {

      db("sendRequest", 2);

      var n = $scope.assetRequest.Name__c;
      var m = $scope.assetRequest.Message__c;

      if (n == "") {
        popAlert("Name cannot be empty");
        return;
      }

      // #reset = 83a7aa3ead77b4b6d99e0f5312890afa
      // remove above comment for production release
      if (hex_md5(n) == "83a7aa3ead77b4b6d99e0f5312890afa") {
        $scope.assetRequest.Name__c = User.getName();
        $timeout(function () {
          if (!confirm("Reset User. Are you sure?")) {
            return;
          }
          resetDevice();
        }, 0);
        return;
      }

      // #showme = 18c45baed7c84ea7e2a05d093b458c1b
      // remove above comment for production release
      if (hex_md5(n) == "18c45baed7c84ea7e2a05d093b458c1b") {
        $scope.assetRequest.Name__c = User.getName();
        popAlert("user is " + User.getName() + " tkn " + User.getToken(), "Info");
        return;
      }

      // #version = 0b3533808c01a105c5c36c32b4c80ce7
      // remove above comment for production release
      if (hex_md5(n) == "0b3533808c01a105c5c36c32b4c80ce7") {
        $scope.assetRequest.Name__c = User.getName();
        popAlert(MertVersion, "Info");
        return;
      }

      // #show = 7b55b9fa3e10a94166e75a8585945059
      // remove above comment for production release
      if (hex_md5(n) == "7b55b9fa3e10a94166e75a8585945059") {
        $scope.assetRequest.Name__c = User.getName();
        var s = Analytics.getReport();
        popAlert(s, "Analytics");
        return;
      }

      // #debug = 7945e00c84b3ad69cc956a370130783a
      // remove above comment for production release
      if (hex_md5(n) == "7945e00c84b3ad69cc956a370130783a") {
        $scope.assetRequest.Name__c = User.getName();
        $timeout(function () {
          if (!dbIsActive("0")) {
            var s = "0";
            if (gv_Debug.tagList != "") s += ",";
            gv_Debug.tagList = s + gv_Debug.tagList;
          }
          db("Debug enabled", 0);
        }, 0);
        return;
      }

      if (m == "") {
        popAlert("Request Details are required");
        return;
      }

      db("Name " + n + "\nMsg " + m, 11);

      var tkn = User.getToken();
      sfSetUauthUser("mert_" + tkn);

      showWait("visible", "Sending Asset Request");

      // create Asset Request record on SF
      // (request for connection token as necessary)
      sfCreate('Asset_Request__c', $scope.assetRequest).then(
        function (data) {
          showWait("hide");
          popAlert("Request sent. Thank you.", "Confirmation");
        },
        function (error) {
          showWait("hide");
          popAlert(error, "Error");
        }
      ); // end of sfCreate()

      // disconnect from SF by discarding token
      sfDisconnect();

    }; //end of $scope.sendRequest()


    $scope.doTest = function () {

      db("doTest", 11);
      popAlert(checkNetworkStatus("info"));

    }; // end of $scope.doTest()

  }); // end of .controller() - Request

// check whether loaded
db("controllers.js loaded", 0);
