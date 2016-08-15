// MERT App based on IONIC Framework

/*
services.js
(c) Philip Pang, July 2016

Initial codebase written by Philip Pang with enhancements
by David Prasad, Ratheesh Kumar where indicated.

I wrote this codebase to support my part of the project, but
all team members are free to use these services for their parts.

Note to All Team Members:
- Please fee free to add your Service objects here. 
- Be sure to tag it with your name, and describe what it does.
- If you modify another team member's service, please indicate what
  you have changed.
- To write your own Service object, you can use the "User" service 
  as an example. All my service objects are written with this same
  design pattern.  
*/

// declare service module
myservices = angular.module('services', []);


// (written by Philip Pang)
// This User service stores the registered User name
// and secret MERT server access token. After app
// registration, a copy of this object is stored in the secure vault.
myservices.factory('User',function () {
  var model = {
    name: "",
    token: ""
  };

  var userObj = {

    getModel: function () {
      return model;
    },

    setModel: function (m) {
      model = m;
    },

    getName: function () {
      return model.name;
    },

    setName: function (n) {
      model.name = n;
    },

    getToken: function () {
      return model.token;
    },

    setToken: function (t) {
      model.token = t;
    },

    reset: function () {
      model.name = "";
      model.token = "";
    }
  };

  // export service object globally
  gv_userSvc = userObj;

  // export service object for DI
  return userObj;
});


// (by Philip Pang) (used by Ratheesh to display resources)
// This Resources service is used to interface with the MERT server.
// It fetches a list of resource names and related information from
// the server and makes these available to the App. It caches this
// information and can sync with the latest copy on the MERT server.
myservices.factory('Resources', function (MertServer, User) {

  // populate model with some static data
  // initial static model (testdata.js)
  //var model = gv_Resources;

  // initial model is empty
  var validflag = false;
  var model = [];

  // create service object
  var resourcesObj = {

    load: function () {

      // get access token
      var tkn = User.getToken ();

      var p = new Promise(function (resolve, reject) {

        // server URL
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&tkn=" + tkn;
        url += "&cmd=queryTable&p1=Resources";
        doJSONP2(url).then(
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
          showWait ("visible","Loading");
          self.load().then(
            function (data) {
              showWait ("hide"); 
              resolve(data);
            },
            function (err) { 
              showwait ("hide");
              reject(err);
            }
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


// (Philip Pang)
// This AvailDates service is used to generate Booking dates
// for the next 60 days from the current day.
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


// (by Philip Pang) (used by Ratheesh to display booking rate)
// This Bookings service is used to manage Booking records
// of resources. It handles add, retrieval, delete of
// Booking records. It maintains a cache of relevant records
// from the MERT server and is able to sync with it.
myservices.factory('Bookings', function ($timeout, MertServer, User) {

  // initial static model (testdata.js)
  //var model = gv_Bookings;

  // initialise model (empty)
  var validflag = false;
  var model = [];

  // create service object
  var bookingsObj = {

    load: function () {
      var p = new Promise(function (resolve, reject) {

        // get access token
        var tkn = User.getToken();

        // server url
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&tkn=" + tkn;
        url += "&cmd=getBookings&p1=" + getTodayStr();
        
        doJSONP2 (url).then(
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
          showWait ("visible","Loading");
          self.load().then(
            function (data) {
              showWait("hide");
              db('server bookings'); 
              resolve(data);
            },
            function (err) {
              showWait("hide");
              reject(err);
            }
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

    // returns Booking object by resID, begin Date and Time (if any)
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

    // returns Booking object by booking ID
    getBookingById: function (bookID) {
      if (!validflag) return null;
      for (var i=0; i < model.length; i++) {
        if (model[i].id == bookID) return model[i];
      }
      return null;
    },

    // check whether this is a booking object
    isBooking: function (resID, begDate, begTime) {
      if (this.getBookingID(resID, begDate, begTime) != null) return true;
      return false;
    },

    // get count of Bookings of a resID on a given day
    getBookingSlotCount: function (resID, dt) {
      var cnt = 0;
      var mins = 0;
      if (!validflag) return 0;
      for (var i = 0; i < model.length; i++) {
        var book = model[i];
        if (book.res != resID) continue;
        if (book.begDate == dt && book.endDate == dt) {
          mins = getTimeDiff (book.begTime,book.endTime);
          cnt += Math.round (mins/30);    
        }
        else if (book.begDate == dt && book.endDate > dt) {
          mins = getTimeDiff (book.begTime,"2400");
          cnt += Math.round (mins/30);              
        }
        else if (book.begDate < dt && book.endDate == dt) {
          mins = getTimeDiff ("0000",book.endTime);
          cnt += Math.round (mins/30);    
        }
        else if (book.begDate < dt && book.endDate > dt) {
          cnt += 48;
        }
      }
      return cnt;
    },

    getBookingPercent: function (resID, dt) {
      var cnt = this.getBookingSlotCount (resID, dt);
      var percent = Math.round (cnt/48*100);
      return percent;
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

        var whereObj = {
          id: id
        }

        // get access token
        var tkn = User.getToken();

       /* without notification (DEPRECATED)
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&cmd=delTable&p1=Bookings&p2=" + encodeURIComponent(JSON.stringify(whereObj));
        doJSONP2 (url).then(
          function (data) {
            db("Delete MERT server booking status is " + data);
            resolve ("OK");
          }
        );
        */

        // Delete Booking With Email Notification
        // Note that p1=bookingID, not table. Also no p2
        var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
        url += "&m=mert_svc&tkn=" + tkn;
        url += "&cmd=delBooking&p1=" + whereObj.id;
        doJSONP2 (url).then(
          function (data) {
            db("Delete MERT server booking status is " + data);
            resolve ("OK");
          }
        );

      });
      return p;
    }, // end delBooking()

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

      // get access token
      var tkn = User.getToken();

      // server url
      var url = "http://" + MertServer + "/vpage2.php?callback=JSON_CALLBACK&h=99";
      url += "&m=mert_svc&tkn=" + tkn;
      url += "&cmd=addBooking&p1=" + encodeURIComponent(vlist);

      var p = new Promise(function (resolve, reject) {
        doJSONP2 (url).then(
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

// (by Philip Pang) (used in side-menu by David Prasad)
// This Analytics service is used to track the usage of this
// App. It monitors when this App is started and activated,
// and what Views the user vists. These are stored into various
// counters. The side menu can display the results.
// The analytics data are persistent. When the App suspends,
// the counters are written out to a local "analytics.txt" file.
myservices.factory('Analytics',function () {

  var model = {
    times: [0,0,0,0,0,0,0,0],
    visits: {
      resources: 0,
      calendar: 0,
      timeslots: 0,
      add: 0,
      info: 0,
      bookings: 0,
      request: 0
    }
  };

  var timeSegments = [
    "0000-0300", "0300-0600", "0600-0900", "0900-1200",
    "1200-1500", "1500-1800", "1800-2100", "2100-2400"
  ];

  var analyticsObj = {

    getModel: function () {
      return model;
    },

    setModel: function (m) {
      model = m;
    },

    getVisits: function () {
      return model.visits;
    },

    getTimes: function () {
      return model.times;
    },

    merge: function (obj) {
      for (var i=0; i < model.times.length; i++) {
        model.times[i] += obj.times[i];
      }
      for (var ppty in model.visits) {
        if (model.visits.hasOwnProperty(ppty)) {
          model.visits[ppty] += obj.visits[ppty];
        }
      }          
    },

    log: function (vw) {

      if (vw == "time") {
        var now = getTimeStr();
        if (now >= 0000 && now < 0300) model.times[0]++;
        if (now >= 0300 && now < 0600) model.times[1]++;
        if (now >= 0600 && now < 0900) model.times[2]++;
        if (now >= 0900 && now < 1200) model.times[3]++;
        if (now >= 1200 && now < 1500) model.times[4]++;
        if (now >= 1500 && now < 1800) model.times[5]++;
        if (now >= 1800 && now < 2100) model.times[6]++;
        if (now >= 2100 && now < 2400) model.times[7]++;        
        return;
      }

      switch (vw) {
        case "resources": model.visits.resources++; break;
        case "calendar": model.visits.calendar++; break;
        case "timeslots": model.visits.timeslots++; break;
        case "add": model.visits.add++; break;
        case "info": model.visits.info++; break;
        case "bookings": model.visits.bookings++; break;
        case "request": model.visits.request++; break;
      }
    },

    getReport: function (nl) {
      if (typeof nl == "undefined") nl = "\n";
      var ht = "";

      var timesTotal = 0;
      for (var i=0; i < model.times.length; i++) {
        timesTotal += model.times[i];
      }

      var visitsTotal = 0;
      for (var ppty in model.visits) {
        if (model.visits.hasOwnProperty(ppty)) visitsTotal += model.visits[ppty];
      }

      ht += "Visits" + nl;
      for (var ppty in model.visits) {
        if (model.visits.hasOwnProperty(ppty)) {
          ht += ppty + ":" + model.visits[ppty];
          ht += " (" + percent (model.visits[ppty],visitsTotal) + "%)" + nl;
        }
      }
      ht += "Total Visits: " + visitsTotal + " (100%)" + nl;
      
      ht += nl;
      ht += "Times" + nl;
      for (var i=0; i < model.times.length; i++) {
        ht += timeSegments[i] + ":" + model.times[i];
        ht += " (" + percent (model.times[i],timesTotal) + "%)" + nl;
      }
      ht += "Total Times: " + timesTotal + " (100%)"  + nl;

      return ht;
    },

    reset: function () {
      model.times = [0,0,0,0,0,0,0,0];
      model.visits = {
        reslist: 0,
        calendar: 0,
        timeslots: 0,
        add: 0,
        info: 0,
        bookings: 0,
        request: 0
      };
    }
  };

  // export service object globally
  gv_analyticsSvc = analyticsObj;

  // export service object for DI
  return analyticsObj;
});

// check whether loaded
db ("services.js loaded",0);