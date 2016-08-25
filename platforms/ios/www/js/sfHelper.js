/* sfHelper.js (Salesforce Helper)
by Philip Pang (c) Aug 2016

DESCRIPTION
This is a wrapper for ForceNG service. CRUD functions (eg sfCreate(), sfDelete(), sfQuery(), 
sfUpdate()) can be conveniently called when needed. Each of these will internally attempt
to connect to the Salesforce website  if there is no existing connection.

This wrapper also implements two methods of logging in to the SalesForce server:
OAuth2 and User/Password Flow. sfInitUauth() and sfInitOauth() must be initially
called in App.run() before using the methods in this wrapper library.

I wrote this library for my NYP MERT Mobile Project. It is used in the Send Asset Request
function of the App.

You may use this library for your project so long as this entire header comments
are left intact and the source of the code is acknowledged.

DEPENDENCIES
- use only in Angular framework
- must include ForceNG service (forceng.js) available on GitHub
*/

// 'module' variables used by this helper library

// init data for Oauth and Uauth
mv_sfMethod = ""; // "Oauth" or "Uauth"
mv_sfForceObject = null;

// init data for Oauth only
mv_sfAppID = "";
mv_sfBrowser = null;
mv_sfRootScope = null;

// init data for Uauth only
mv_sfUser = null; // .client_id, .client_secret, .username, .password

// holds tokens
mv_sfTokenArr = [];

// ready flags for both Oauth and Uauth
mv_sfSvcReadyFlag = false;
mv_sfInitParmsAvailFlag = false;

function sfGetLoginMethod () {
  return mv_sfMethod;
}

// need to call this in .run()
function sfInitOauth(force, cskey, browser, rootScope) {
  db("sfInitOauth()...",10);
  mv_sfMethod = "Oauth";
  mv_sfAppID = cskey;
  mv_sfForceObject = force;
  mv_sfBrowser = browser;
  mv_sfRootScope = rootScope;
  mv_sfInitParmsAvailFlag = true;
}

function sfInitUauth(force) {
  db("sfInitUauth()",10)
  mv_sfMethod = "Uauth";
  mv_sfForceObject = force;
  mv_sfInitParmsAvailFlag = true;
}

function sfSetUauthUser (user) {
  if (mv_sfUser != user) {
    mv_sfUser = user;
    mv_sfSvcReadyFlag = false;
  }
}

function sfGetUauthUser () {
  return mv_sfUser;
}

/*
curl -v https://login.salesforce.com/services/oauth2/token 
-d grant_type=password 
-d client_id=3MVG9ZL0ppGP5UrCK0cuK1W0VNp9QpTgLOCdrfxPx3uM_7r3HC8SzX9YhHDuF5dufEuRCw4NWDXyQlxNDVaGY 
-d client_secret=8938661770939641627 
-d username=pang.philip%40gmail.com 
-d password=SanelyMe1

Result is
{"access_token":"00D28000001NiaU!AR4AQO0clX_phCeT03tmkVz9ZaRsfKDAAln4HjsMv_UqgKAC5mvJWTXvYou6c.6QwhDclLjbLESPIndod5uK.V.houBbeqyG","instance_url":"https://ap2.salesforce.com","id":"https://login.salesforce.com/id/00D28000001NiaUEAS/00528000003cqytAAA","token_type":"Bearer","issued_at":"1468768558335","signature":"N3FuJ/AhleeDPlhTwxjgJJJC2fiR4k8yjLBP6Jy3Aco="}
*/
function sfGetUauthToken() {
  db("sfGetUserLoginToken()...",10);

  //var $http = mv_sfHttpSvc;

  var p = new Promise(function (resolve, reject) {

    if (mv_sfUser == null) {
      var error = "ERROR: Uauth username not set";
      reject (error);
    }

    var url = "http://edu.ipg.4u.sg/vpage2.php?callback=JSON_CALLBACK&h=99";
    url += "&m=mert_svc&cmd=sfLogin&user=" + mv_sfUser;
    doJSONP2 (url, checkNetworkHelper).then(
      function (data) {
        resolve(data);
      },
      function (error) {
        reject(error);
      }
    );

  });

  return p;
}


// returns Promise object. Resolver gets array object with SF token and SF url
// error object is a string that starts with "ERROR: xxxxx"
function sfGetOauthToken() {

  db("sfGetOAuthToken()...",10);
  var browser = mv_sfBrowser;

  var p = new Promise(function (resolve, reject) {

    if (!window.cordova) {
      reject("ERROR: Not running in device!");
      return;
    }

    if (!gv_CordovaReadyFlag) {
      reject("Error. Cordova plugins are not ready!");
      return;
    }

    if (!mv_sfInitParmsAvailFlag) {
      var error = "ERROR: sfGetOAuthToken. sfInit parameters not set";
      reject(error);
      return;
    }

    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'no'
    };

    var loginURL = 'https://login.salesforce.com';
    var oauthCallbackURL = 'http://localhost/callback';
    var loginWindowURL = loginURL + '/services/oauth2/authorize?client_id='
      + mv_sfAppID + '&redirect_uri=' + oauthCallbackURL + '?&response_type=token';

    mv_sfOauthCapturedFlag = false;
    db("just before cordovaInAppBrowser opening",10);

    browser.open(loginWindowURL, '_blank', options);
    //browser.open("http://google.com", '_blank', options);

    db("cordovaInAppBrowser opened",10);

    var listenerOff = mv_sfRootScope.$on('$cordovaInAppBrowser:loadstart', function (e, event) {

      if (mv_sfOauthCapturedFlag) return;

      var url = decodeURI(event.url);

      db("loadstart fired\nURL=" + url,10);

      // redirects us to 
      // http://localhost/callback#access_token=...&refresh_token=...&instance_url=... 
      var accessToken = /access_token=(.+?)&/.exec(url);
      var instanceUrl = /instance_url=(.+?)&/.exec(url);
      var error = /error=(.+?)&/.exec(url);

      if (accessToken || error) {

        mv_sfOauthCapturedFlag = true;

        // unsubscribe
        listenerOff();

        // Always close the browser when match is found 
        browser.close();

        if (accessToken) {
          var at = decodeURIComponent(accessToken[1]);
          var iu = decodeURIComponent(instanceUrl[1]);
          var tokenArr = [at, iu];
          db ("OAuth. RE grep. Got token successfully", 10);
          resolve(tokenArr);
          return;
        }

        if (error) {
          db ("OAuth. RE grep. Failed to get token", 10);
          reject("ERROR: Fail to get token. " + error);
          return;
        }
      }
    }); // $rootScope.$on
  });
  return p;
}

// returns Promise object. Resolver gets "OK" string.
// Error function contains "ERROR: xxxx" string
function sfConnect() {

  db("sfConnect()...",10);
  var force = mv_sfForceObject;

  var p = new Promise(function (resolve, reject) {

    if (!mv_sfInitParmsAvailFlag) {
      var error = "ERROR: sfConnect(). sfInit parameters not set";
      reject(error);
      return;
    }

    if (mv_sfMethod == "Oauth") {
      sfGetOauthToken().then(
        function (tokenArr) {
          mv_sfTokenArr = tokenArr;
          db("Got Oauth SF Token!", 10);
          var at = mv_sfTokenArr[0];
          var iu = mv_sfTokenArr[1];
          db("Oauth Token: " + at + "\n" + "Instance URL: " + iu, 10);
          force.init({ accessToken: at, instanceURL: iu });
          mv_sfSvcReadyFlag = true;
          resolve("OK");
        },
        function (error) {
          reject(error);
        }
      );
    }

    if (mv_sfMethod == "Uauth") {
      sfGetUauthToken().then(
        function (data) {
          mv_sfTokenArr = [data.access_token, data.instance_url];
          db("Got Uauth SF Token!", 10);
          var at = mv_sfTokenArr[0];
          var iu = mv_sfTokenArr[1];
          db("Uauth Token: " + at + "\n" + "Instance URL: " + iu, 10);
          force.init({ accessToken: at, instanceURL: iu });
          mv_sfSvcReadyFlag = true;
          resolve("OK");
        },
        function (error) {
          reject (error);
        }
      );
    }

  });

  return p;
}

// This is the logical opposite of sfConnect()
// After this is called, it will be necessary to
// reconnect using sfConnect() 
function sfDisconnect () {
  var force = mv_sfForceObject;
  force.discardToken ();
  mv_sfSvcReadyFlag = false;
}

// returns Promise object. Resolver gets "OK" string.
// Error function gets "ERROR: xxxxx" string
function sfCreate(table, objRec) {

  db("sfCreate()...", 11);
  var force = mv_sfForceObject;

  var p = new Promise(function (resolve, reject) {

    var create = function (table, objRec) {
      force.create(table, objRec).then(
        function (data) {
          //resolve("OK");
          resolve (data);
        },
        function (error) {
          var errmsg = error;
          db (objectInspector(error), 11);
          if (typeof error == "object") errmsg = error[0].errorCode + " " + error[0].message;
          reject (errmsg);
        }
      );
    };

    if (!mv_sfSvcReadyFlag) {
      sfConnect().then(
        function (data) {
          create(table, objRec);
          //resolve ("OK");
        },
        function (error) {
          var errmsg = error;
          db (objectInspector(error), 11);
          if (typeof error == "object") errmsg = error[0].errorCode + " " + error[0].message;
          reject (errmsg);
        }
      );
      return;
    }

    create(table, objRec);
    //resolve ("OK");
  });
  return p;
}


// returns Promise object. Resolver gets array of objects.
// Error function gets "ERROR: xxxx" string
function sfQuery(sqlstr) {

  db("sfQuery()...",12);
  var force = mv_sfForceObject;

  var p = new Promise(function (resolve, reject) {

    var query = function (sqlstr) {
      force.query(sqlstr).then(
        function (data) {
          db("sfQuery(): Got object/table data from salesForce",12);
          resolve(data);
        },
        function (error) {
          db ("sfQuery(): Error in force.query()",12);
          db (objectInspector(error),2);
          var errmsg = error[0].errorCode + " " + error[0].message;
          reject ("ERROR: " + errmsg);
        }
      );
    };

    if (!mv_sfSvcReadyFlag) {
      sfConnect().then(
        function (data) {
          db("Return status from sfConnect is " + data,10);
          query(sqlstr);
        },
        function (error) {
          reject(error);
        }
      );
      return;
    }

    query(sqlstr);

  });
  return p;
}

// returns Promise object. Resolver gets "OK" string
// Error function gets "ERROR: xxxx" string
function sfDelete (table,id) {

  db("sfDelete()...", 13);
  var force = mv_sfForceObject;

  var p = new Promise(function (resolve, reject) {

    var del = function (sqlstr) {
      force.del (table,id).then(
        function (data) {
          db("sfDelete(): Delete record in salesforce", 13);
          resolve ("OK");
        },
        function (error) {
          db ("sfDelete(): Error in force.del()", 13);
          db (objectInspector(error), 13);
          var errmsg = error[0].errorCode + " " + error[0].message;
          reject ("ERROR: " + errmsg);
        }
      );
    };

    if (!mv_sfSvcReadyFlag) {
      sfConnect().then(
        function (data) {
          db("Return status from sfConnect is " + data, 11);
          del (table,id);
        },
        function (error) {
          reject(error);
        }
      );
      return;
    }

    del (table,id);

  });
  return p;
}

// update a SalesForce Object record
// returns Promise object. Success function gets "OK" string
// Error function gets "ERROR: xxxx" string
function sfUpdate (table,objRec) {

  db("sfUpdate()...", 14);
  var force = mv_sfForceObject;

  var p = new Promise(function (resolve, reject) {

    var update = function (sqlstr) {
      force.update (table,objRec).then(
        function (data) {
          db("sfUpdate(): Updated record in salesforce", 14);
          resolve ("OK");
        },
        function (error) {
          db ("sfUpdate(): Error in force.updatel()", 14);
          db (objectInspector(error), 14);
          var errmsg = error[0].errorCode + " " + error[0].message;
          reject ("ERROR: " + errmsg);
        }
      );
    };

    if (!mv_sfSvcReadyFlag) {
      sfConnect().then(
        function (data) {
          db("Return status from sfConnect is " + data, 11);
          update (table,objRec);
        },
        function (error) {
          reject(error);
        }
      );
      return;
    }

    update (table,objRec);

  });
  return p;
}

// check whether loaded
db("sfHelper loaded ok",0);
