// MERT App based on IONIC Framework

/*
helper.js
(c) July 2016

Initial codebase written by Philip Pang with enhancements
by:
- David Prasad
- Ratheesh Kumar
*/

// helper.js - Helper Functions
// These are std JS functions, non-Angular related
// In VS Code, type Shift-Opt-F to beautify!


gv_Debug = false;

// use this to print debug messages
// may be globally switched off using gv_Debug = false above
function db(m) {
  if (!gv_Debug) return;
  if (!confirm(m)) {
    gv_Debug = false;
    return;
  }
}

function popAlert(msg, title) {
  if (window.cordova) {
    if (typeof title == "undefined") title = "Alert";
    navigator.notification.alert(
      msg, null,
      title, "Ok"
    );     
  }
  else {
    alert (msg);
  }
}

// prepad a number with 0 to a given length
// var a = prepad (5,3) becomes "005"
function prepad(n, len) {
  n = "" + n;
  var l = len - n.length;
  while (l-- > 0) n = "0" + n;
  return n;
}

// getNextDate ("2016/05/30",2) will return "2016/06/01"
function getNextDate(datestr, n) {
  var dateArr = datestr.split("-");
  var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
  dateObj.setTime(dateObj.getTime() + n * 86400000);
  var dd = dateObj.getDate();
  var mm = dateObj.getMonth();
  var yy = dateObj.getFullYear();
  var newDateStr = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);
  return newDateStr;
}

// getNextTime ("2359",1) will return "0000"
// getNextTime ("0000",-1) will return "2359"
function getNextTime(timestr, n) {
  var timeval = 1 * timestr;
  var hh = Math.floor(timeval / 100);
  var mm = timeval % 100;
  var mins = hh * 60 + mm;
  mins += n;
  if (mins < 0) mins += 1440;
  hh = Math.floor(mins / 60);
  mm = mins % 60;
  timestr = "" + prepad(hh, 2) + prepad(mm, 2);
  return timestr;
}

// getDOW ("2016/05/11") will return "Wed"
function getDOW(datestr) {
  var dateArr = datestr.split("-");
  var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
  var wd = dateObj.getDay();
  var dayArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayArray[wd];
}

// doJSONP with url and returns JSON object
// URL must contain ?callback=JSON_CALLBACK
function doJSONP($http, url) {
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

// return array of hours viz ["0000","0030", etc]
function makeHoursArray() {
  var hhArr = [];
  for (var i = 0; i < 48; i++) {
    var j = Math.floor(i / 2);
    var hh = "", mm = "";
    if (i % 2 == 0) mm = "00"; else mm = "30";
    hh = prepad(j, 2);
    hh += mm;
    hhArr.push(hh);
  }
  return hhArr;
}

function getTodayStr () {
  var dateObj = new Date();
  var dd = dateObj.getDate();
  var mm = dateObj.getMonth();
  var yy = dateObj.getFullYear();
  var todayStr = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);
  return todayStr;
}
