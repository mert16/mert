myservices = angular.module('services', []);

myservices.factory('Beacon', function() {

  // initial model
  var model = {
    number: 10,
    author: "Wilson"
  };

  // service object
  var beaconObj = {
    getModel: function () {
      return model;
    },

    setNumber: function (n) {
      model.number = n;
    },

    setAuthor: function (a) {
      model.author = a;
    }
  };

  // export service object globally
  gv_beaconObj = beaconObj;
  
  // export service object for DI
  return beaconObj;
});

myservices.factory('Resources', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var resources = [
    { id:1, name: "Projector", owner: "R&D West" },
    { id:2, name: "Oscilloscope", owner: "R&D East" },
    { id:3, name: "3D Printer", owner: "Operations" },
    { id:4, name: "Smart Board", owner: "Marketing" },
    { id:5, name: "Frequency Generator 1", owner: "Test Lab" },
    { id:6, name: "Frequency Generator 2", owner: "Test Lab" },
    { id:7, name: "Laser Ruler", owner: "Test Lab" },
    { id:8, name: "Tablet PC 1", owner: "Test Lab" },
    { id:9, name: "Tablet PC 2", owner: "Test Lab" },
    { id:10, name: "Linux Server", owner: "Test Lab" },
    { id:11, name: "Video Camera", owner: "Marketing" },
    { id:12, name: "Android Tablet", owner: "Marketing" },
    { id:13, name: "Apple iPad Mini", owner: "Marketing" },
    { id:14, name: "LAN Analyser", owner: "Test Lab" }    
  ];

  return {
    getAll: function() {
      return resources;
    },
    get: function(id) {
      for (var i = 0; i < resources.length; i++) {
        if (resources[i].id === parseInt(id)) {
          return resources[i];
        }
      }
      return null;
    }
  };
});

// Available Booking Dates
myservices.factory('AvailDates', function() {

  // initialise model
  var model = null;

  var dayArr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var monthArr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  var makeModel = function () {

      var model = [];
      var curDate = new Date ();

      for (var i=0; i < 60; i++) {
          
        var dd = curDate.getDate();
        var wd = curDate.getDay();
        var mm = curDate.getMonth();
        var yy = curDate.getFullYear();

        var date =  yy + "-" + prepad((mm+1),2) + "-" + prepad(dd,2);
        //var date = prepad(dd,2) + " " + monthArr[mm] + " " + yy;
        var dow = dayArr[wd];

        model.push ({dow: dow, date: date});

        curDate.setTime (curDate.getTime() + 1 * 86400000);        
      }
      return model;
  };

  // static model
  model = makeModel ();
  
  var availDatesObj = {
    getModel: function () {
      return model;
    },

    getDay: function (n) {
      return model[n];
    }
  };

  // export service object globally
  gv_availDatesSvc = availDatesObj;
  
  // export service object for DI
  return availDatesObj;
});

// Confirmed Booking Dates
myservices.factory('Bookings', function() {

  // initial static model
  var model = gv_Bookings;
  
  var bookingsObj = {

    // get whole Booking array
    getModel: function () {
      return model;
    },

    // get a specific Booking object
    getBooking: function (n) {
      return model[n];
    },

    // get Booking ID, date is "yyyy/mm/dd", time "hhmm"
    getBookingID: function (resID, begDate, begTime) {
      var begTimeStr = "" + begDate + " " + begTime;
      for (var i=0; i < model.length; i++) {
        if (model[i].res != resID) continue;
        bookStart = model[i].begDate + " " + model[i].begTime;
        bookEnd = model[i].endDate + " " + model[i].endTime;
        if (begTimeStr >= bookStart && begTimeStr < bookEnd) return model[i].id;
      }
      return null;
    },

    isBooking: function (resID, begDate, begTime) {
      if (this.getBookingID (resID,begDate,begTime)!=null) return true;
      return false;
    },

    delBooking: function (id) {
      var foundFlag = false;
      for (var i=0; i < model.length; i++) {
        if (model[i].id == id) {
          foundFlag = true;
          break;
        }
      }
      if (foundFlag) model.splice(i,1);
    }
  };

  // export service object globally
  gv_bookingsSvc = bookingsObj;
  
  // export service object for DI
  return bookingsObj;
});
