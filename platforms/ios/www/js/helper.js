// helper.js - Helper Functions
// These are std JS functions, non-Angular related
// In VS Code, type Shift-Opt-F to beautify!

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
  var dayArr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];  
  return dayArray[wd];
}
