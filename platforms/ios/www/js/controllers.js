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

  // controller for "Home tab" view"
  .controller('InitCtrl', function ($scope, $timeout, User,
    MertVersion, $ionicPlatform, $cordovaNetwork) {

    db("InitCtrl", 2);

    $scope.mertVersion = MertVersion;

    $scope.$on('$ionicView.enter', function (e) {

      $ionicPlatform.ready(function () {

        db("ionicPlatform ready in InitCtrl",3);

        if (!checkNetworkStatus()) {
          db ("No network on startup!",5);
          changeView ("nonetwork");
          return;
        }

        var userObj = vault("get");

        if (userObj != null) {
          db("Found user! user/token is " + userObj.name + " / " +
            userObj.token);
          User.setModel(userObj);
          changeView("tab.resources");
          return;
        }

        db("There is no userObj in the vault", 1);

        // switch to user registration sub-view
        $scope.subview = {
          register: true,
          tutorial: false,
          title: "Registration"
        };

        $scope.user = User.getModel();

        $scope.showuser = function () {
          popAlert("user is " + User.getName() + " tkn " + User.getToken(), "Alert");
        };

        $scope.registerUser = function () {

          var tkt = prompt("Enter ticket for this user", "one");

          showWait("visible", "Registering");

          getUserToken(User.getName(), tkt).then(
            function (token) {

              showWait("hide");

              db("Token is " + token);

              // update User svc
              User.setToken(token);

              // store token in persistent storage
              vault("put", $scope.user);

              $scope.subview = {
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

        // for start button in tutorial sub-view
        $scope.start = function () {
          changeView("tab.resources");
        };

      }); // end of $ionicPlatform.ready()

    }); // end of $scope.$on ()
  })  // end of .controller - Init


  // controller for "no network" message (transient)
  .controller('NoNetworkCtrl', function ($scope, $timeout, $ionicNavBarDelegate) {
    db("NoNetworkCtrl", 2);

    $scope.$on('$ionicView.enter', function (e) {
      $ionicNavBarDelegate.showBackButton(false);
    });

    $scope.restart = function () {
      db("restart!",4);
      if (!checkNetworkStatus()) {
        popAlert("Sorry, Internet is still not available", "Message");
        return;
      }

      //changeView("tab.resources");
      changeView("init");
      $ionicNavBarDelegate.showBackButton(true);
    };
  }) // end of .controller() - "NoNetwork"


  // controller for "Resources tab" view
  .controller('ResourceCtrl', function ($scope, $timeout, Resources) {
    db("ResourceCtrl",2);

    Resources.getModel().then(
      function (data) {
        db("Resource controller: resource count = " + data.length);
        $scope.resources = data;
        $timeout(); // update view
      },
      function (error) {
        popAlert(error);
      }
    );

    $scope.doRefresh = function () {
      db("Refresh Resources Tab!",2);
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
    Resources, AvailDates, MertServer) {

    db("ResourceBookingCtrl resID " + $stateParams.resID,2);

    $scope.res = Resources.get($stateParams.resID);

    $scope.dates = AvailDates.getModel();

    $scope.MertServer = MertServer;
  }) // end of .controller - ResourceBooking


  // controller for "Resources tab > Bookings > Selected Date" view
  .controller('ResourceTimeslotCtrl', function ($scope, $stateParams, $timeout,
    Resources, Bookings, User) {

    db("ResourceTimeslotCtrl",2);

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
      db("Delete booking ID " + id,2);
      Bookings.delBooking(id).then(
        function (status) {
          Bookings.refresh().then(
            function (data) {
              //$scope.bookings = data;
              $timeout();
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
    Resources, Bookings, User) {

    db("ResourceAddBookingCtrl",2);

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
              db("Go back to prev view",2);
              $ionicHistory.goBack(-1);
            }
          );
        },
        function (reason) {
          popAlert(reason);
        }
        );
    };
  }) // end of .controller - ResourceAddBooking


  // controller for "Resources tab > Bookings > Info" view
  .controller('ResourceInfoCtrl', function ($scope, $stateParams, $timeout,
    Resources, MertServer) {

    db("ResourceInfoCtrl resID " + $stateParams.resID,2);

    var resObj = Resources.get($stateParams.resID);
    $scope.res = resObj;

    $scope.MertServer = MertServer;

    var specsArr = resObj.specs.split(",");
    $scope.specsArr = specsArr;
  }) // end of .controller - ResourceInfo


  // controller for "Bookings tab" view
  .controller('BookingsCtrl', function ($scope, $timeout,
    Bookings, Resources, User) {

    db("BookingsCtrl",2);

    $scope.$on('$ionicView.enter', function (e) {

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
      db("Delete booking ID " + id,2);
      Bookings.delBooking(id).then(
        function (status) {
          Bookings.refresh().then(
            function (data) {
              $scope.bookings = data;
              $timeout();
            }
          );
        }
      );
    };

    $scope.doRefresh = function () {
      db("Refresh Bookings Tab!",2);
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
  .controller('RequestCtrl', function ($scope, $localStorage, $window, User, MertVersion) {
    db("RequestCtrl",2);

    var wh = $window.innerHeight;
    $scope.taHeight = wh - 330; // - 60;

    $scope.mertVersion = MertVersion;

    // Asset_Request__c Object Name
    // .Name__c, .Message__c Field Names
    $scope.assetRequest = {
      Name__c: User.getName(),
      Message__c: ""
    };

    $scope.sendRequest = function () {

      //db ("sendRequest",11);
      //return;

      var n = $scope.assetRequest.Name__c;
      var m = $scope.assetRequest.Message__c;

      if (n == "") {
        popAlert("Name cannot be empty");
        return;
      }

      // #reset = 83a7aa3ead77b4b6d99e0f5312890afa
      // remove above comment for production release
      if (hex_md5(n) == "83a7aa3ead77b4b6d99e0f5312890afa") {
        if (!confirm("Reset User. Are you sure?")) {
          $scope.assetRequest.Name__c = User.getName();
          return;
        }
        User.reset();
        vault("reset");
        changeView("init");
        return;
      }

      // #showme = 18c45baed7c84ea7e2a05d093b458c1b
      // remove above comment for production release
      if (hex_md5(n) == "18c45baed7c84ea7e2a05d093b458c1b") {
        popAlert("user is " + User.getName() + " tkn " + User.getToken(), "Info");
        $scope.assetRequest.Name__c = User.getName();
        return;
      }

      // #version = 0b3533808c01a105c5c36c32b4c80ce7
      // remove above comment for production release
      if (hex_md5(n) == "0b3533808c01a105c5c36c32b4c80ce7") {
        popAlert(MertVersion, "Info");
        $scope.assetRequest.Name__c = User.getName();
        return;
      }

      if (m == "") {
        popAlert("Request Details are required");
        return;
      }

      db("Name " + n + "\nMsg " + m, 11);

      var tkn = User.getToken();
      sfSetUauthUser ("mert_" + tkn);

      showWait("visible", "Sending Asset Request");

      sfCreate('Asset_Request__c', $scope.assetRequest).then(
        function (data) {
          showWait("hide");
          popAlert("Request sent. Thank you.");
        },
        function (error) {
          showWait("hide");
          popAlert(error);
        }
      ); // end of sfCreate()

    }; //end of $scope.sendRequest()


    $scope.doTest = function () {

      db("doTest", 11);
      popAlert (checkNetworkStatus("info"));

    }; // end of $scope.doTest()

  }); // end of .controller() - Request

db("controllers.js loaded", 0);
