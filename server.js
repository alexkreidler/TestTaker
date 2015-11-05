var version = '0.0.0'
console.log('Starting TestTaker Server v' + version);
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;
var app = express();
app.listen(port);
console.log('Listening on port: ' + port);
app.use(express.static('public'));

var Firebase = require('firebase');
var consolidate = require('consolidate');
var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
var root = new Firebase('http://testtaker.firebaseio.com')
var students = root.child('students');
var teachers = root.child('teachers');
var classes = root.child('classes');
var testData = root.child('testData');
var tests = root.child('tests');
var responses = root.child('responses');
var scripts = ['https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', 'https://cdn.firebase.com/js/client/2.3.1/firebase.js', 'https://storage.googleapis.com/code.getmdl.io/1.0.5/material.min.js'];
var stylesheets = ['https://fonts.googleapis.com/icon?family=Material+Icons', 'https://storage.googleapis.com/code.getmdl.io/1.0.5/material.teal-blue.min.css', '../stylesheets/main.css'];

app.use(session({
  genid: function(req) {
    return Math.floor((Math.random() * 9999999999) + 1);
  },
  secret: Math.floor((Math.random() * 9999999999) + 1)
}));

function scriptGen(scriptArray, args) {
  for (var i = 0; i < args.length; i++) {
    scriptArray.push(args[i]);
  }
  return scriptArray;
}

function lookUpUser(uid, type, callback) {
  console.log(uid + ' TYPE: ' + type);
  root.child(type + 's')
    .orderByChild("uid")
    .startAt(uid)
    .endAt(uid)
    .once('value', function(snap) {
      console.log(snap.val());
      user = snap.val();
      console.log(user);
      callback(user);
    });
}

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
//************************************SERVER RENDERING REQUESTS********************************************
//*********************************************************************************************************
//*********************************************************************************************************

app.get('/', function(req, res) {
  res.render('index', {
    title: 'TestTaker',
    scripts: scripts,
    stylesheets: stylesheets
  });
});
app.get('/test', function(req, res) {
  //res.sendFile(__dirname + '/static/test/test.html');
  res.redirect('/')
});
app.get('/login', function(req, res) {
  res.render('login', {
    scripts: scriptGen(scripts.slice(), ['../js/login.js']),
    stylesheets: stylesheets
  });
});
app.get('/faq', function(req, res) {
  res.render('questions', {
    scripts: scriptGen(scripts.slice(), ['../js/faq.js', 'https://fast.eager.io/iXKMX5lync.js']),
    stylesheets: stylesheets
  })
})

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
        students.push({
          'name': req.body.name,
          'uid': userData.uid,
          classes: 0
        })
        res.redirect('/');
      }
    })
  } else if (req.body.type == 'teacher') {

  } else {
    res.status(400).json({
      error: 'Invalid user type'
    });
  }
});
app.post('/login', urlencodedParser, function(req, res) {
  lookUpUser(req.body.uid, req.body.type, function(data) {
    /*
    req.session.type = req.body.type;
    req.session.userData = data[Object.keys(data)[0]];
    res.redirect('/dashboard');
    */
    res.render('dashboard', {
      type: req.body.type,
      userData: data[Object.keys(data)[0]],
      title: 'Dashboard',
      scripts: scripts,
      stylesheets: stylesheets
    });
  });
});
/*app.all('/dashboard', function(req, res) {
  if (req.session.type && req.session.userData) {
    res.render('dashboard', {
      type: req.session.type,
      userData: req.session.userData,
      title: 'Dashboard',
      scripts: scripts,
      stylesheets: stylesheets
    });
  } else {
    // TODO: error 'you need to sign in'
  }
});
*/

// to think about: should a syncronizer do this automatically and populate student classes with the list  of students in the class
app.post('/addClass', urlencodedParser, function(req, res) {
  if (req.body.type == 'student') {
    var key;
    try {
      key = classes
        .orderByKey()
        .startAt(req.body.classID)
        .endAt(req.body.classID)
        .orderByChild('students')
        .startAt(req.body.studentID)
        .endAt(req.body.studentID)
        .key()
      var studentClasses = students.child(req.body.studentID + '/classes');
      studentClasses.push(key);
      res.json({
        'success': 'class added successfully'
      });
    } catch (err) {
      res.status(500).json({
        'error': 'class not added successfully'
      });
      res.send('whoops! there was an error');
    }
  } else if (req.body.type == 'teacher') {

  } else {

  }
});

app.post('/test', urlencodedParser, function(req, res) {
  //verify that they can take the test
  //generate test, pulling from Firebase
  var questions = [];
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
  res.render('test', {
    'class': data,
    'teacher': data,
    'name': data,
    'questions': [{
      'prompt': data,
      'img': data
    }]
  });
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
  var response = responses.push(req.body)

  var thisTestData;
  testData
    .orderByKey()
    .startAt(req.body.testData)
    .endAt(req.body.testData)
    .once('value', function(snap) {
      thisTestData = Object.keys(snap.val())[0];
    });
  //
  var keys = Object.keys(thisTestData.questions)
  var key;
  var arrayOfAnswers = [];
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    arrayOfAnswers.push(thisTestData[key].answer);
  }
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
      classData = Object.keys(snap.val())[0];
    })
  res.render('class', {
    classData: classData
  })
});



console.log('Finished starting TestTaker Server v' + version);
