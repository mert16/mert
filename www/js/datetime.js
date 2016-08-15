/*
datetime.js - Helper functions
(c) Philip Pang, July 2016

DESCRIPTION

This is a collection of utility helper functions that manage the date and time data
used in tracking resource bookings.

Note that date is recorded as a string in the format  "YYYY-MM-DD" eg "2016-12-31"
Time is recorded as a string in the format "HHMM" eg "2359"

This set of date time functions is shared by all team members.

Note to Team Members: If you add a new date/time manipulation function, please
add it to the list of functions below.

LIST OF FUNCTIONS
- prepad(), getNextDate(), getNextTime(), getDOW(), getTimeDiff(), makeHoursArray(),
  getTodayStr(), getTimeStr() are utility functions to manipulate Date and Time
  for the MERT project. Date is processed as "YYYY-MM-DD" and Time as "HHMM".
*/

// Note: in VS Code editor, type Shift-Alt-F to beautify!


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

// getTimeDiff (begTime,endTime) within same day in minutes
function getTimeDiff(begTime, endTime) {
  var mm1 = begTime.substr(0, 2) * 60 + begTime.substr(2) * 1;
  var mm2 = endTime.substr(0, 2) * 60 + endTime.substr(2) * 1;
  mm = mm2 - mm1;
  return mm;
}

// return array of hours viz ["0000","0030", ..., 2300, 2330]
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

// getTodayStr() returns today's date as a string in the format "YYYY-MO-DD"
function getTodayStr() {
  var dateObj = new Date();
  var dd = dateObj.getDate();
  var mm = dateObj.getMonth();
  var yy = dateObj.getFullYear();
  var todayStr = yy + "-" + prepad((mm + 1), 2) + "-" + prepad(dd, 2);
  return todayStr;
}

// getTimeStr() returns time now as a string in the format "HHMM"
function getTimeStr() {
  var dateObj = new Date();
  var hh = dateObj.getHours();
  var mm = dateObj.getMinutes();
  var timeStr = prepad(hh, 2) + prepad(mm, 2);
  return timeStr;
}

// explodeDateTime("2016-12-31 2359") returns
// hash object as {2016,12,31,23,59}
function explodeDateTime (datetimestr) {
  var obj = {};
  obj.yy = 1 * datetimestr.substr(0,4);
  obj.mo = 1 * datetimestr.substr(5,2);
  obj.dd = 1 * datetimestr.substr(8,2);
  obj.hh = 1 * datetimestr.substr(11,2);
  obj.mm = 1 * datetimestr.substr(13,2);
  return obj;
}

// percent calculates n/d and returns it as a whole number percentage
function percent(n, d) {
  var pc = n / d * 100;
  return Math.round(pc);
}

// check whether loaded
db("datetime.js loaded", 0);

