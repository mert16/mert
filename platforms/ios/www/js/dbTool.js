/*
dbTool.js
(c) Philip Pang, Aug 2016

Free to use for both commercial and private projects. However, copyright requires
this notice to be retained in any project that uses this file.

Let this be the first js file to be sourced!

Usage:

db ("debug message", msgTag) or db ("debug message");

Embed above line in various parts of your code to be debugged.
When execution reach the line, the "debug message" will popup
with Ok and Cancel buttons. If you click Ok, execution will continue
to the next db("...",tagNum) line. If you click Cancel, execution will
also continue. But at the next db(...) line, no message will show if its
tagNum matches what was cancelled previously.

To suppress all db() messages, be sure to gv_Debug object such that
on:false and tagList:""
*/

// detect full range of browsers
var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
var is_safari = navigator.userAgent.indexOf("Safari") > -1;
var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
if ((is_chrome)&&(is_safari)) {is_safari=false;}
if ((is_chrome)&&(is_opera)) {is_chrome=false;}


// set to true to show debug messages
// 0 JS file loading
// 1 .config() .run()
// 2 .controller()
// 3 ionicPlatform ready
// 4 network avail restart
// 5 initialisation by initCtrl
// 10 sf Connection
// 11 sf Request Submission
// 99 adhoc use
gv_Debug = {
  on: false,
  tagList: "" //0,1,2,3,4,5,10,11,99"
}

// use this to print debug messages
// may be globally switched off using gv_Debug = false above
function db (m,s) {
  if (typeof s == "undefined") s = ""; else s = "" + s;
  s = s.replace(/[ ]+/gm,'');
  var s2 = "," + s + ",";
  var tagList = gv_Debug.tagList.replace(/[ ]+/gm,'');
  tagList = "," + tagList + ",";
  if (!gv_Debug.on) {
    if (tagList==",," || s2==",,") return;
    if (tagList.indexOf(s2)<0) return;    
  } 
  if (s) m += "\n" + "[" + s + "]";
  var a = prompt (m,gv_Debug.tagList);
  if (a === null || a === '' && is_safari && confirm('Did you click Cancel?')) {
    gv_Debug.on = false;
    if (s != "") {
      tagList = tagList.replace("," + s + ",", ",");
      tagList = tagList.replace(/^[,]+/gm,'');
      tagList = tagList.replace(/[,]+$/gm,'');
      gv_Debug.tagList = tagList;
    }
    return;
  }
  gv_Debug.tagList = a;
}

// dbPrompt(true);
// var a = dbPrompt ("Enter parameter","10");
// dbPrompt (false);
function dbPrompt(m, d) {
  if (typeof m == "undefined") return;
  if (typeof m == "boolean") {
    mv_dbPrompt = m;
    return;
  }
  if (!mv_dbPrompt) return null;
  if (typeof d == "undefined") d = "";
  var a = prompt(m, d);
  return a;
}

db ("dbTool.js loaded",0);
