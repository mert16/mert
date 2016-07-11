angular.module('controllers', [])

  .controller('HomeCtrl', function ($scope) {
    alert("Home tab");
  })

  .controller('ResourceCtrl', function ($scope, Resources, Beacon, $http) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    //$scope.chats = Chats.all();
    //$scope.remove = function(chat) {
    //  Chats.remove(chat);
    //};
    alert("Resource tab");

    var data = "initial";
    $scope.resources = Resources.getAll();

    // get cross-domain json data
    /* var url = "http://edu.ipg.4u.sg/vpage2.php?callback=JSON_CALLBACK&h=99&m=mert_svc&cmd=getjsonp";
    $http.jsonp (url)
      .success (function (data) {
        alert (data.name);
        $scope.htdata = data.name;
      })
      .error (function (reason) {
        alert ("error: " + reason);
      }); */

    // get html flat data only
    var url = "http://edu.ipg.4u.sg/vpage2.php?h=99&m=mert_svc&cmd=gethtml";
    $http.get(url)
      .success(function (data2) {
        alert(data2);
        $scope.htdata = data2;
      })
      .error(function (status) {
        alert("Error: " + status);
      });

    $scope.beacon = Beacon.getModel();

    $scope.update = function () {
      $scope.$apply();
    }

    if (gv_ResourceCtrlScope == null) gv_ResourceCtrlScope = $scope;
  })

  .controller('ResourceBookingCtrl', function ($scope, $stateParams,
    Resources, AvailDates) {

    alert("Resource Bookings View of resID " + $stateParams.resID);

    $scope.res = Resources.get($stateParams.resID);

    $scope.dates = AvailDates.getModel();

    gv_ResourceBookingCtrlScope = $scope;
  })

  .controller('ResourceTimeslotCtrl', function ($scope, $stateParams, Resources, Bookings) {

    alert("Resource Timeslot View");

    var hhArr = [];
    for (var i = 0; i < 48; i++) {
      var j = Math.floor(i / 2);
      var hh = "", mm = "";
      if (i % 2 == 0) mm = "00"; else mm = "30";
      hh = prepad(j, 2);
      hh += mm;
      hhArr.push(hh);
    }

    $scope.hours = hhArr;

    $scope.itemcolor = function (id, dt, tm) {
      if (Bookings.isBooking(id, dt, tm)) return "item-energized";
      return "item-light";
    };

    $scope.isbooking = function (id, dt, tm) {
      return Bookings.isBooking(id, dt, tm);
    };

    $scope.bookingID = function (id, dt, tm) {
      return Bookings.getBookingID(id, dt, tm);
    };

    $scope.delbooking = function (id) {
      alert("Booking ID is " + id);
      Bookings.delBooking(id);
    };

    $scope.date = $stateParams.date;
    $scope.dow = $stateParams.dow;
    $scope.res = Resources.get($stateParams.resid);

    gv_ResourceTimeslotCtrlScope = $scope;
  })

  .controller('ResourceAddbookingCtrl', function ($scope, $stateParams) {

    alert("Resource Add Booking View");

    gv_ResourceAddbookingCtrlScope = $scope;
  })


  .controller('ResourceInfoCtrl', function ($scope, $stateParams, Resources) {
    alert("Resource Info View");

    //gv_ResourceInfoCtrlScope = $scope;
  })

  .controller('BookingsCtrl', function ($scope) {
    alert("Bookings tab");
    $scope.settings = {
      enableFriends: true
    };
  });
