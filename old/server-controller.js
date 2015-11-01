//Purpose - to manage communication between client-wrapper.js and server-core.js and provide necessary files, etc
console.log('starting TestTaker server v1.2.9');
var core = require('./server-core.js');
var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io');
//var basicAuth = require('basic-auth-connect');
var stdio = require('stdio');
var auth = require('basic-auth');
var type;
var tests = {
  chyatte: {
    teacher: "Jeff Chyatte",
    testCode: "cTC",
    adminCode: "cAC",
    questions: "35",
    images: "/chyatte",
    fileType: ".jpg",
    answers: [{
      name: "bob",
      score: 56
    }, {
      name: "joe",
      score: 65
    }]
  }
};

/*app.use('/test.html', function(req, res, next) {
  console.log("request at test.html");
  if (basicAuth(function(user, pass) {
      type = pass;
      console.log("Basic Authentication request with username: " + user + " and password: " + pass);
      return pass === "cTC" || "oTC";
    }) === true) {
    if (type === "cTC") {
      data = tests.chyatte;
    } else if (type == "oTC") {
      data = tests.other;
    }
    html = core.init(data);
    res.sendFile(test.html);
    io.on('connection', function(socket) {
      socket.on('setup', function() {
        console.log('test page accessed and requesting data');
        io.emit('data', html);
        console.log('setting up test');
      });
    });
  } else {
    res.send("Error 403: Access Denied.");
  }
});
*/

app.use('/test.html', function(req, res, next) {
      var user = auth(req);
      var good = true;

      switch (user.name + "|" + user.pass) {
        case "chyatteId|chyattePass":
          type = "chyatteId";
          break;
        case "otherId|otherPass":
          type = "otherId";
          break;
        default:
          good = false;
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="TestTaker Test Page Login"');
          res.end('Error 401: Unauthorized');
      }

      if (good === true) {
        core.init(type);
        io.on('connection', function(socket) {
          socket.on('setup', function() {
            console.log('test page accessed and requesting data');
            io.emit('data', html);
            console.log('setting up test');
          });
        });
      }
      /*

  if (user === undefined || user.name !== 'username' || user.pass !== 'password') {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="TestTaker Test Page Login"');
    res.end('Error 401: Unauthorized');
  } else {
    console.log("successful login at " + req.originalUrl + " with username: " + user.name + " and password: " + user.pass);
    res.sendFile(__dirname + "/test.html");

  }
});
*/
      app.get('/*', function(req, res) {
        if (req.originalUrl == "/test.html" || req.originalUrl == "/admin.html") {
          console.log("blocked access to " + req.originalUrl);
          res.send("Error 401: Unauthorized");
        } else {
          res.sendFile(__dirname + req.originalUrl);
        }
      });
      server.listen(80);

      /*
      var adminPath = "admin-" + adminToken + ".html";
      var testPath = "admin-" + testToken + ".html";
      switch (req.originalUrl) {
        case "admin.html":
          if (adminAuth === true) {
            res.sendFile("admin.html");
            io.emit("admin", type);
          } else {
            res.send('403: Access Denied');
          }
          break;
        case "test.html":
          if (auth === true) {
            res.sendFile("test.html");
            io.emit("test", type);
          } else {

            res.send('403: Access Denied');
          }
          break;

        default:
      }
      */
      console.log("completed all tasks");
