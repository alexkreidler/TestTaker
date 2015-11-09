var version = '0.0.0';
var clientVersion = '0.0.0';
console.log('Starting TestTaker Server v' + version);
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var port = process.env.PORT || 3000;
var app = express();
app.listen(port);
console.log('Listening on port: ' + port);
app.use(compression());
app.use(express.static('public'));

var Firebase = require('firebase');
var consolidate = require('consolidate');
var session = require('client-sessions');
var async = require('async');
var root = new Firebase('http://testtaker.firebaseio.com');
var students = root.child('students');
var teachers = root.child('teachers');
var classes = root.child('classes');
var testData = root.child('testData');
var tests = root.child('tests');
var responses = root.child('responses');

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
app.use(express.static('public'));



app.engine('mustache', consolidate.mustache);
app.set('views', __dirname + '/public/views');
app.set('view engine', 'mustache');

var urlencodedParser = bodyParser.urlencoded({
  extended: true
});

// TODO: helper 'error' function to send back errors
/*function error(code){
  switch(code)
  case '500':

  break;
  case '400':
  // Bad Request
  break;
  case '400':

  break;
}
*/
//*********************************************************************************************************
//*********************************************************************************************************
//************************************HELPER FUNCTIONS*****************************************************
//*********************************************************************************************************
//*********************************************************************************************************

function render(req, res, file, locals) {
  var toBeRendered = locals;
  toBeRendered.partials = {
    header: 'header',
    footer: 'footer',
    head: 'head'
  };
  toBeRendered.version = clientVersion;
  toBeRendered.isLoggedIn = (req.session.user != undefined);
  if (toBeRendered.isLoggedIn == true) {
    if (req.session.user.type == 'student') {
      toBeRendered.student = true;
      toBeRendered.teacher = false;
    } else if (req.session.user.type == 'teacher') {
      toBeRendered.student = false;
      toBeRendered.teacher = true;
    }
  }
  res.render(file, toBeRendered);
}

function lookUpUser(uid, type, callback) {
  console.log(uid + ' TYPE: ' + type + 'PLURAL TYPE: ' + type + 's');
  try {
    root.child(type + 's')
      .orderByKey()
      .startAt(uid)
      .endAt(uid)
      .once('value', function(snap) {
        user = snap.val();
        if (user == null) {
          callback('No user found', null);
        } else {
          callback(null, user);
        }
      }, function(err) {
        callback(err, null);
      });
  } catch (err) {
    callback(err, null);
  }
}

function toArray(data) {
  return Object.keys(data).map(function(key) {
    return data[key];
  });
}

function expand(object, callback) {

}
//*********************************************************************************************************
//*********************************************************************************************************
//************************************APP.ALL REQUESTS****************************************************
//*********************************************************************************************************
//*********************************************************************************************************
app.all('/dashboard', function(req, res) {
  if (req.session.user) {
    var userData = req.session.user.userData;
    root.child([req.session.user.type] + 's')
      .orderByChild('uid')
      .startAt(req.session.uid)
      .endAt(req.session.uid)
      .once('value', function(snap) {
        data = snap.val();
        console.log(data);
        data = data[Object.keys(data)[0]];
        var name = data.name;
        var otherArr = [];
        async.forEachOf(data.classes, function(item, key, callback) {
          classes.child(key).once('value', function(snap) {
            var thisClass = snap.val();
            thisClass.id = key;
            console.log(thisClass.code);
            otherArr.push(thisClass);
            callback();
          }, function(err) {
            callback(err);
          });
        }, function(err) {
          if (err) {

          } else {
            data.classes = otherArr;
            var student;
            var teacher;
            console.log(data);
            render(req, res, 'dashboard', {
              type: req.session.user.type,
              uid: Object.keys(snap.val())[0],
              student: student,
              teacher: teacher,
              userData: data,
              title: 'Dashboard'
            });
          }
        });
      });
  } else {
    res.redirect('/login?error=not_signed_in');
  }
});

app.all('/logout', function(req, res) {
  req.session.user = undefined;
  res.redirect('/');
});

//*********************************************************************************************************
//*********************************************************************************************************
//************************************SERVER RENDERING REQUESTS********************************************
//*********************************************************************************************************
//*********************************************************************************************************

app.get('/', function(req, res) {
  render(req, res, 'index', {
    title: 'TestTaker'
  });
});

app.get('/test', function(req, res) {
  //res.sendFile(__dirname + '/static/test/test.html');
  res.redirect('/');
});

app.get('/login', function(req, res) {
  console.log(req.query);
  if (req.session.user != undefined) {
    res.redirect('/dashboard');
  } else {
    var messages, errors = [];
    if (req.query.message != undefined) {
      messages = [req.query.message];
    } else if (req.query.error != undefined) {
      errors = [req.query.error];
    }
    render(req, res, 'login', {
      messages: messages,
      errors: errors
    });

  }
});

app.get('/faq', function(req, res) {
  render(req, res, 'questions', {});
});

app.get('/about', function(req, res) {
  render(req, res, 'about', {
    title: 'TestTaker | About'
  });
});

app.get('/privacy', function(req, res) {
  render(req, res, 'privacy', {
    title: 'TestTaker | Privacy Policy'
  });
});

//*********************************************************************************************************
//*********************************************************************************************************
//************************************API POST REQUESTS****************************************************
//*********************************************************************************************************
//*********************************************************************************************************
app.post('/signUp', urlencodedParser, function(req, res) {
  if (req.body.type == 'student') {
    students.createUser({
      email: req.body.email,
      password: req.body.password
    }, function(error, userData) {
      if (error) {
        switch (error.code) {
          case "EMAIL_TAKEN":
            res.status(400).json({
              error: "The new user account cannot be created because the email is already in use."
            });
            break;
          case "INVALID_EMAIL":
            res.status(400).json({
              error: "The specified email is not a valid email."
            });
            break;
          default:
            res.status(500).json({
              error: error
            });
        }
      } else {
        var spot = students.child(userData.uid);
        spot.set({
          'name': req.body.name,
          classes: 0
        });
        res.redirect('/login?message=account_created');
      }
    });
  } else if (req.body.type == 'teacher') {
    teachers.createUser({
      email: req.body.email,
      password: req.body.password
    }, function(error, userData) {
      if (error) {
        switch (error.code) {
          case "EMAIL_TAKEN":
            res.status(400).json({
              error: "The new user account cannot be created because the email is already in use."
            });
            break;
          case "INVALID_EMAIL":
            res.status(400).json({
              error: "The specified email is not a valid email."
            });
            break;
          default:
            res.status(500).json({
              error: error
            });
        }
      } else {
        var spot = teachers.child(userData.uid);
        spot.set({
          'name': req.body.name,
          classes: 0
        });
        res.redirect('/login?message=account_created');
      }
    });
  } else {
    res.status(400).json({
      error: 'Invalid user type'
    });
  }
});

app.post('/login', urlencodedParser, function(req, res) {
  lookUpUser(req.body.uid, req.body.type, function(err, data) {
    if (err) {
      // TODO: error
      res.status(400).send('whoops! it looks like an error');
    } else {
      req.session.user = {
        type: req.body.type,
        userData: data[Object.keys(data)[0]],
        uid: req.body.uid
      };
      res.redirect('/dashboard');
    }
  });
});

// to think about: should a syncronizer do this automatically and populate student classes with the list  of students in the class
app.post('/addClass', urlencodedParser, function(req, res) {
  //to think about - not use the query, just do it? --> decision: YES
  if (req.session.user.type == 'student') {
    var studentClasses = students.child(req.session.user.uid + '/classes');
    var theClass = studentClasses.child(req.body.classID);
    theClass.set(true);
    res.json({
      'success': 'class added successfully'
    });
  } else {
    res.status(400).json({
      'error': 'this is for students only: please use the /createClass POST request'
    });
  }
});

app.post('/test', urlencodedParser, function(req, res) {
  res.end('we\'re working on it');
  //verify that they can take the test
  //generate test, pulling from Firebase
  /*var questions = [];
  var randomArray = [];
  var testDataKey = tests
      .orderByKey()
      .startAt(req.body.testID)
      .endAt(req.body.testID)
      .child('testData');
  var thisTestData = testData.child(testDataKey).once('value', function(data) {
      questions = Object.keys(data);
  });

  for (var i = 1; i < questions.length; i++) {
      var value = Math.floor((Math.random() * questions.length) - 1);
      var data = questions[value];
      questions.slice(pos, i);
      randomArray.push(data);
  }

  // TODO: substitute references with Firebase values

  //send test to students
  render(req, res, 'test', {
      'class': data,
      'teacher': data,
      'name': data,
      'questions': [{
          'prompt': data,
          'img': data
      }]
  });
  */
});

app.post('/createTest', urlencodedParser, function(req, res) {
  // TODO: check auth
  if (req.body.type == 'teacher') {
    var thisTestData = testData.push(req.body.testData);
    var thisTestDataKey = thisTestData.key();
    var data = JSON.parse(req.body);
    data.testData = thisTestDataKey;
  } else {
    res.status(400).json({
      error: "You can not create tests."
    });
  }
});

app.post('/gradeTest', urlencodedParser, function(req, res) {
  //Record Answers
  var response = responses.push(req.body);

  var thisTestData;
  testData
    .orderByKey()
    .startAt(req.body.testData)
    .endAt(req.body.testData)
    .once('value', function(snap) {
      thisTestData = Object.keys(snap.val())[0];
    });
  //
  var keys = Object.keys(thisTestData.questions);
  var key;
  var arrayOfAnswers = [];
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    arrayOfAnswers.push(thisTestData[key].answer);
  }
});

//to think about: do it on client for auth
app.post('/createClass', urlencodedParser, function(req, res) {
  // TODO: auth
  var createdClass = classes.push({
    name: req.body.className,
    students: 0,
    teachers: 0,
    tests: 0
  });
  var key = createdClass.key();
  var teacherClass = teachers.child(req.session.user.uid + '/classes/' + key);
  teacherClass.set(true);

  // TODO: success
  res.end('success');
});

app.post('/deleteClass', urlencodedParser, function(req, res) {
  // TODO: auth
  var theClass = classes.child(req.body.classID);
  theClass.remove();
  var str = req.session.user.uid + '/classes/' + req.body.classID;
  console.log(str);
  var teacherClassLoc = teachers.child(str);
  teacherClassLoc.remove();
  res.end('success');
  // TODO: error
});

//*********************************************************************************************************
//*********************************************************************************************************
//************************************SPECIALIZED REQUESTS*************************************************
//*********************************************************************************************************
//*********************************************************************************************************

app.get('/classes/:classID', function(req, res) {
  var classData;
  classes
    .orderByKey()
    .startAt(req.params.classID)
    .endAt(req.params.classID)
    .once('value', function(snap) {
      classData = snap.val()[Object.keys(snap.val())[0]];
      render(req, res, 'class', {
        classData: classData,
        classID: req.params.classID
      });
    });
});

console.log('Finished starting TestTaker Server v' + version);
