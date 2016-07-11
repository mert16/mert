myservices = angular.module('services', []);

myservices.factory('User',function () {
  var model = {
    name: "philip"
  };

  var userObj = {

    getModel: function () {
      return model;
    },

    getName: function () {
      return model.name;
    },

    setName: function (n) {
      model.name = n;
    }
  };

  // export service object globally
  gv_userSvc = userObj;

  // export service object for DI
  return userObj;
});

myservices.factory('Resources', function ($http, MertServer) {

  // populate model with some static data
  /* var model = [
    { id: 1, name: "Projector", owner: "R&D West", image: "" },
    { id: 2, name: "Oscilloscope", owner: "R&D East", image: "" },
    { id: 3, name: "3D Printer", owner: "Operations", image: "" },
    { id: 4, name: "Smart Board", owner: "Marketing", image: ""  },
    { id: 5, name: "Frequency Generator 1", owner: "Test Lab", image: ""  },
    { id: 6, name: "Frequency Generator 2", owner: "Test Lab", image: ""  },
    { id: 7, name: "Laser Ruler", owner: "Test Lab", image: ""  },
    { id: 8, name: "Tablet PC 1", owner: "Test Lab", image: ""  },
    { id: 9, name: "Tablet PC 2", owner: "Test Lab", image: ""  },
    { id: 10, name: "Linux Server", owner: "Test Lab", image: ""  },
    { id: 11, name: "Video Camera", owner: "Marketing", image: ""  },
    { id: 12, name: "Android Tablet", owner: "Marketing", image: ""  },
    { id: 13, name: "Apple iPad Mini", owner: "Marketing", image: ""  },
    { id: 14, name: "LAN Analyser", owner: "Test Lab", image: ""  }
  ]; */

  // initial model is empty
  var validflag = false;
  var model = [];

  // create service object
  var resourcesObj = {

    load: function () {
      var p = new Promise(function (resolve, reject) {
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&cmd=queryTable&p1=Resources";
        doJSONP($http, url).then(
          function (data) {
            db("Loaded resources from MERT server. Count = " + data.length);
            model = data;  // cache locally
            validflag = true;
            resolve(data);
          },
          function (error) {
            reject(error);
          }
        );
      });
      return p;
    },

    getModel: function () {
      var self = this;
      var p = new Promise(function (resolve, reject) {
        if (validflag) resolve(model);
        else {
          self.load().then(
            function (data) { resolve(data); },
            function (err) { reject(err); }
          );
        }
      });
      return p;
    },

    refresh: function () {
      var self = this;
      var p = new Promise(function (resolve, reject) {
        validflag = false;
        self.getModel().then(
          function (data) { resolve(data); },
          function (err) { reject(err); }
        );
      });
      return p;
    },

    get: function (id) {
      if (!validflag) return null;
      for (var i = 0; i < model.length; i++) {
        if (parseInt(model[i].id) === parseInt(id)) {
          return model[i];
        }
      }
      return null;
    }
  };

  // export service object globally
  gv_resourcesSvc = resourcesObj;

  // export service object for DI
  return resourcesObj;
});

// Available Booking Dates: stretch for 60 days from current day
myservices.factory('AvailDates', function () {

  // initialise model (empty)
  var model = null;

  var dayArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // populate initial model with next 60 date strings
  var makeModel = function () {

    var model = [];
    var curDate = new Date();

    for (var i = 0; i < 60; i++) {

      var dd = curDate.getDate();
      var wd = curDate.getDay();
      var mm = curDate.getMonth();
      var yy = curDate.getFullYear();

      var date = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);
      //var date = prepad(dd,2) + " " + monthArr[mm] + " " + yy;
      var dow = dayArr[wd];

      model.push({ dow: dow, date: date });

      curDate.setTime(curDate.getTime() + 1 * 86400000);
    }
    return model;
  };

  // static model
  model = makeModel();

  // create service object
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
myservices.factory('Bookings', function ($http, $timeout, MertServer) {

  // initial static model
  //var model = gv_Bookings;

  // initialise model (empty)
  var validflag = false;
  var model = [];

  // create service object
  var bookingsObj = {

    load: function () {
      var p = new Promise(function (resolve, reject) {
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&cmd=queryTable&p1=Bookings";
        doJSONP($http, url).then(
          function (data) {
            db("Loaded bookings from MERT server. Count = " + data.length);
            model = data;  // cache locally
            validflag = true;
            resolve(data);
          },
          function (error) {
            reject(error);
          }
        );
      });
      return p;
    },

    getModel: function () {
      var self = this;
      var p = new Promise(function (resolve, reject) {
        if (validflag) { db('cached bookings'); resolve(model); }
        else {
          self.load().then(
            function (data) { db('server bookings'); resolve(data); },
            function (err) { reject(err); }
          );
        }
      });
      return p;
    },

    refresh: function () {
      var self = this;
      var p = new Promise(function (resolve, reject) {
        validflag = false;
        self.getModel().then(
          function (data) { resolve(data); },
          function (err) { reject(err); }
        );
      });
      return p;
    },

    // get Booking ID or null, date is "yyyy/mm/dd", time "hhmm"
    getBookingID: function (resID, begDate, begTime) {
      var begTimeStr = "" + begDate + " " + begTime;
      for (var i = 0; i < model.length; i++) {
        if (model[i].res != resID) continue;
        bookStart = model[i].begDate + " " + model[i].begTime;
        bookEnd = model[i].endDate + " " + model[i].endTime;
        if (begTimeStr >= bookStart && begTimeStr < bookEnd) return model[i].id;
      }
      return null;
    },

    // returns Booking object
    getBooking: function (resID, begDate, begTime) {
      if (!validflag) return null;
      var begTimeStr = "" + begDate + " " + begTime;
      for (var i = 0; i < model.length; i++) {
        if (model[i].res != resID) continue;
        bookStart = model[i].begDate + " " + model[i].begTime;
        bookEnd = model[i].endDate + " " + model[i].endTime;
        if (begTimeStr >= bookStart && begTimeStr < bookEnd) return model[i];
      }
      return null;
    },

    // check whether this is a booking object
    isBooking: function (resID, begDate, begTime) {
      if (this.getBookingID(resID, begDate, begTime) != null) return true;
      return false;
    },

    // delete a booking
    delBooking: function (id) {
      var self = this;
      var p = new Promise(function (resolve, reject) {
        var foundFlag = false;
        for (var i = 0; i < model.length; i++) {
          if (model[i].id == id) {
            foundFlag = true;
            break;
          }
        }

        if (!foundFlag) {
          reject("ERROR: booking not found");
          return;
        }

        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&cmd=delBooking&p1=" + id;
        doJSONP($http, url).then(
          function (data) {
            db("Delete MERT server booking status is " + data);
            resolve ("OK");
          }
        );
      });
      return p;
    },

    // add a new Booking object
    addBooking: function (rid, user, begDate, begTime, endDate, endTime) {
      var self = this;
      var c = ",";
      var q = function (w) {
        w = (w + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        return "'" + w + "'";
      };

      var vlist = q(rid) + c + q(user) + c + q(begDate) + c + q(begTime) + c
        + q(endDate) + c + q(endTime);

      var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
      url += "&m=mert_svc&cmd=addBooking&p1=" + encodeURIComponent(vlist);

      var p = new Promise(function (resolve, reject) {
        doJSONP($http, url).then(
          function (data) {
            if (data == "OK") {
              db("Add booking to MERT server: Status is " + data);
              resolve(data);
            }
            else {
              reject(data);
            }
          }
        );
      });
      return p;
    }
  };

  // export service object globally
  gv_bookingsSvc = bookingsObj;

  // export service object for DI
  return bookingsObj;
});
