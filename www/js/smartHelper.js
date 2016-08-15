/*
helper.js - Helper functions
(c) Philip Pang, July 2016

DESCRIPTION
This is a collection of smart functions written by the above author for his NYP MERT project.
These smart functions perform various operations and some may have to be initialised
by hooking on to Angular .run() function.

These smart functions follow a consistent design pattern. They all make use of some
Cordova plugin services. Before using, they must be initialised in Angular .run().
Each function is capable of several sub-functions. You can even think of these functions
as smart objects, except that they are invoked as imperative functions.

I wrote this collection of smart functions to support my part of the project, 
but all team members are free to use these functions for their parts.

Note to all team members: You may add your smart utility functions here. But please be sure
to document them and to indicate which functions you have written. Also, provide some
examples on how they are to be used.


LIST OF FUNCTIONS
- popAlert () - native Cordova Dialog calls
- doJSONP2() is a smart network function that will perform cross-domain JSONP-based
  HTTP calls to the MERT LAMP server used for the MERT project.
- getUserToken() - convenience function that uses doJSONP2() to register a new mobile ph.
- vault() - smart convenience function thatstores User object with secret token. 
  It is integrated with ngStorage service.
- showWait() - smart function that implements "toast"-like message popups.
- objectInspector() - analyses JS variable and returns string showing object graph.
- checkNetworkStatus() - support function that uses Cordova to check hph network status
- fileHelper() - support function that uses Cordova to read/write text files.
- changeView() - changes the Angular View using state name defined in App.config().
*/

// Note: in VS Code editor, type Shift-Alt-F to beautify!


// (Philip Pang)
// display a message using local device Dialog. uses Cordova.Dialogs plugin.
function popAlert(msg, title) {
  if (window.cordova) {
    if (typeof title == "undefined") title = "Alert";
    navigator.notification.alert(
      msg, null,
      title, "Ok"
    );
  }
  else {
    alert(msg);
  }
}

// (Philip Pang)
// Wrapper for Angular $http service designed to handle cross-domain JSONP web calls.
// doJSONP2 with url and returns JSON object
// URL must contain ?callback=JSON_CALLBACK
// doJSONP2 ($http,true) -- to initialise
// doJSONP2 (url).then () --- to make actual calls
mv_doJSONP2_http = null;  // module variable required
function doJSONP2(variant, initFlag) {
  if (initFlag) {
    var $http = variant;
    mv_doJSONP2_http = $http;
    return;
  }

  if (mv_doJSONP2_http == null) return;

  var $http = mv_doJSONP2_http;
  var url = variant;

  var p = new Promise(function (resolve, reject) {
    $http.jsonp(url)
      .success(function (data) {
        resolve(data);
      })
      .error(function (reason) {
        reject("JSONP ERROR: " + reason);
      });
  });
  return p;
}


// (Philip Pang) DEPRECATED. Replaced by sfHelper.js
// get user Token during device registration
// uses doJSONP2()
function getUserToken(user, ticket) {
  var whereObj = {
    name: user,
    ticket: ticket
  };
  var url = "http://edu.ipg.4u.sg/vpage2.php?callback=JSON_CALLBACK&h=99";
  url += "&m=mert_svc&cmd=queryTable&p1=Users&p2=" + encodeURIComponent(JSON.stringify(whereObj));
  var p = new Promise(function (resolve, reject) {
    doJSONP2(url).then(
      function (data) {
        if (typeof data == "string") {
          reject(data);
          return;
        }
        if (data.length < 1) {
          data = "ERROR: invalid credentials";
          reject(data);
        }
        resolve(data[0].token);
      }
    );
  });
  return p;
}


// (Philip Pang)
// Convenience function to change App View.
// Uses Angular $state service.
// can only change to views without url path parameters
// changeView ($state,"init") -- to initialise in .run() once only
// changeView ("init") -- change to "init" view/state (most common use)
// changeView (null,"setTutorialMode") -- enable Tutorial subview mode
// changeView (null,"getTutorialMode") --- check for Tutorial subview mode
mv_changeView_tutorial = null; // module variable required
mv_changeView_state = null; // module variable required
function changeView(variant, cmdFlag) {
  if (cmdFlag=="init") {
    var $state = variant;
    mv_changeView_state = $state;
    return;
  }
  if (cmdFlag == "setTutorialMode") {
    mv_changeView_tutorial = true;
    return;
  }
  if (cmdFlag == "getTutorialMode") {
    return mv_changeView_tutorial;
  }
  if (mv_changeView_state == null) return;
  var $state = mv_changeView_state;
  var state = variant; // eg "tab.bookings"
  $state.transitionTo(state);
}


// (Philip Pang) (used by David Prasad)
// vault object to store registered tokens
// vault ("init",$localStorage) -- to initialise in .run()
// vault ("put",User) -- to store User object with token
// vault ("get") -- to retrieve User object with token
// vault ("reset") -- to destroy User object with token
mv_storageObject = null; // module var required
function vault(cmd, arg) {
  if (cmd == "init") {
    mv_storageObject = arg; // $localStorage;
    return;
  }
  if (cmd == "put") {
    if (mv_storageObject == null) return;
    mv_storageObject.userObj = arg;
    return;
  }
  if (cmd == "get") {
    if (mv_storageObject == null) return null;
    if ("userObj" in mv_storageObject) return mv_storageObject.userObj;
    return null;
  }
  if (cmd == "reset") {
    if (mv_storageObject == null) return;
    delete mv_storageObject.userObj;
    return;
  }
}


// (Philip Pang) (used by all Team members)
// Convenience Wrapper for $ionicLoading to allow display
// of "toast-like" wait messages
// showWait ("init",$ionicLoading) -- to initialise
// showWait ("visible",msg") -- to show busy "msg"
// showwait (false) -- to hide busy msg
mv_waitObject = null; // required
function showWait(cmd, arg) {
  if (cmd == "init") {
    mv_waitObject = arg; // $ionicLoading
    return;
  }
  if (cmd == "visible") {
    mv_waitObject.show({
      template: arg
    });
    return;
  }
  if (cmd == "hide") {
    mv_waitObject.hide();
  }
}


// (Philip Pang)
// Convenience function to check Mobile Device network status.
// Uses Cordova Network Information plugin.
// checkNetworkStatus() -- returns true/false
// checkNetworkStatus("info") -- returns network status string for display
function checkNetworkStatus(flag) {
  if (!window.Connection) {
    db("checkNetworkStatus() usable in device only", 11);
    return;
  }

  var type = navigator.connection.type;

  if (typeof flag == "undefined" || flag == "" || flag == false) {
    if (type == Connection.NONE) return false;
    return true;
  }

  var ht = "";
  if (type == Connection.NONE) ht += "No Connection\n";
  else if (type == Connection.UNKNOWN) ht += "Unknown Connection\n";
  else if (type == Connection.ETHERNET) ht += "Ethernet\n";
  else if (type == Connection.WIFI) ht += "Wifi\n";
  else if (type == Connection.CELL_2G) ht += "Cell 2G\n";
  else if (type == Connection.CELL_3G) ht += "Cell 3G\n";
  else if (type == Connection.CELL_4G) ht += "Cell 4G\n";
  else if (type == Connection.CELL) ht += "Cellular";
  else ht += "Type " + type;
  return ht;
} // end of checkNetworkStatus()


// (Philip Pang)
// read or write to local file. Uses cordova-plugin-file.
// Used by Analytics service to persist Analytics data.
// fileHelper ("init",$cordovaFile) -- to initialise
// fileHelper ("read","filename") -- to read a file
// fileHelper ("write","filename","string data") -- to hide busy msg
mv_fileObject = null; // required
function fileHelper(cmd, arg1, arg2) {

  if (cmd == "init") {
    mv_fileObject = arg1; // $cordovaFile
    return;
  }

  if (cmd == "write") {

    var p = new Promise(function (resolve, reject) {
      mv_fileObject.writeFile(cordova.file.dataDirectory, arg1, arg2, true).then(
        function (data) {
          resolve ("OK");
        },
        function (error) {
          //db(objectInspector(error), 99);
          reject ("ERROR: unable to write");
        }
      ); // end of writeFile()
    }); // end of new Promise

    return p;
  } // end of cmd=write

  if (cmd == "read") {
    var p = new Promise(function (resolve, reject) {
      mv_fileObject.readAsText(cordova.file.dataDirectory, arg1).then(
        function (data) {
          resolve(data);
        },
        function (error) {
          reject("ERROR: unable to read");
        }
      ); // end of readAsText()
    }); // end of new Promise

    return p;
  } // end of cmd=read
}


// (Philip Pang) (used by Ratheesh)
// Requires cordova-plugin-calendar
// addOpts = {title: "event", location: "place", notes: "any",
// startDate: new Date(yyyy,mm-1,dd,hh,mm,0,0),endDate: new Date(yyyy,mm-1,dd,hh,mm,0,0)};
// delOpts = {startDate: new Date(yyyy,mm-1,dd,hh,mm,0,0),endDate: new Date(yyyy,mm-1,dd,hh,mm,0,0)}
// calHelper ("init",$cordovaCalendar) initialise
// calHelper ("add",addopts) add a calendar event
// calHelper ("delete",delopts) delete a calendar event
mv_calendarSvc = null; // REQUIRED
function calHelper(cmd, arg) {
  if (cmd == "init") {
    mv_calendarSvc = arg;
    return;
  }
  if (cmd == "add") {
    var p = new Promise(function (resolve, reject) {
      mv_calendarSvc.createEvent(arg).then(
        function (data) {
          resolve("OK")
        },
        function (error) {
          reject("ERROR");
        }
      );
    });
    return p;
  }
  if (cmd == "delete") {
    var p = new Promise(function (resolve, reject) {
      mv_calendarSvc.deleteEvent(arg).then(
        function (data) {
          resolve("OK")
        },
        function (error) {
          reject("ERROR");
        }
      );
    });
    return p;
  }
}

// check whether loaded
db("helper.js loaded", 0);