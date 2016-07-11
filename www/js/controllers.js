// architecture originally designed by Philip Pang
// subsequent changes by other team members

angular.module('controllers', [])


  .controller('HomeCtrl', function ($scope, User) {
    db("Home tab");

    $scope.user = User.getModel();

    $scope.showuser = function () {
      db("Selected user is " + User.getName());
    };
  })


  .controller('ResourceCtrl', function ($scope, $timeout, Resources) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    db("Resource tab");

    Resources.getModel().then(
      function (data) {
        db("Resource controller: resource count = " + data.length);
        $scope.resources = data;
        $timeout(); // update view
      }
    );
  })

  .controller('ResourceBookingCtrl', function ($scope, $stateParams, $timeout,
    Resources, AvailDates, MertServer) {

    db("Resource Bookings View of resID " + $stateParams.resID);

    $scope.res = Resources.get($stateParams.resID);

    $scope.dates = AvailDates.getModel();

    $scope.MertServer = MertServer;
  })


  .controller('ResourceTimeslotCtrl', function ($scope, $stateParams, $timeout,
    Resources, Bookings, User) {

    db("Resource Timeslot View");

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
      db("Delete booking ID " + id);
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
  })


  .controller('ResourceAddbookingCtrl', function ($scope, $stateParams, $timeout, $ionicHistory,
    Resources, Bookings, User) {

    db("Resource Add Booking View");

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

      /* debug
      var ht = ""; var nl = "\n";
      ht += "Add new booking!" + nl;
      ht += "Res: " + $scope.res.name + nl;
      ht += "User: " + $scope.user.name + nl;
      ht += "begDate: " + $scope.begin.date + nl;
      ht += "begTime: " + $scope.begin.time + nl;
      ht += "endDate: " + $scope.end.date + nl;
      ht += "endTime: " + $scope.end.time + nl;
      if (!confirm(ht)) return; */

      Bookings.addBooking($scope.res.id, $scope.user.name, $scope.begin.date, $scope.begin.time,
        $scope.end.date, $scope.end.time).then(
        function (data) {
          Bookings.refresh().then(
            function (status) {
              db("Go back to prev view");
              $ionicHistory.goBack(-1);
            }
          );
        },
        function (reason) {
          db(reason);
        }
        );
    };
  })


  .controller('ResourceInfoCtrl', function ($scope, $stateParams, $timeout,
    Resources) {

    db("Resource Specs View of resID " + $stateParams.resID);

    var resObj = Resources.get($stateParams.resID);

    $scope.res = resObj;

    var specsArr = resObj.specs.split(",");
    $scope.specsArr = specsArr;
  })


  .controller('BookingsCtrl', function ($scope, $timeout,
    Bookings, Resources, User) {

    db("Bookings tab");

    $scope.$on('$ionicView.enter', function (e) {

      // get Bookings Data and make available to the view
      Bookings.getModel().then(
        function (data) {
          db("Bookings controller: bookings count = " + data.length);
          $scope.bookings = data;
          $timeout(); // update view
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
      db("Delete booking ID " + id);
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
      db("Refresh Bookings Tab!");
      Bookings.refresh().then(function (data) {
        $scope.bookings = data;
        $scope.$broadcast("scroll.refreshComplete");
      });
    };

  });
