var version = '1.0.7-beta';
var clientVersion = '1.0.7-beta';
console.log('Starting TestTaker Server v' + version);
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var pj = require('prettyjson');
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
var repl = require('repl');
repl.start('TestTaker v' + version + ' REPL> ');
var root = new Firebase('http://testtaker.firebaseio.com');
var students = root.child('students');
var teachers = root.child('teachers');
var classes = root.child('classes');
var testData = root.child('testData');
var tests = root.child('tests');
var responses = root.child('responses');
var answers = root.child('answers');
var grades = root.child('grades');

//create session for 30 minutes
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
app.use(function(req, res, next) {
    if (req.method == 'GET') {
        if (req.query) {
            res.say = {
                error: req.query.error ? req.query.error : null,
                message: req.query.message ? req.query.message : null
            };
        }
    };
    next();
});
//*********************************************************************************************************
//*********************************************************************************************************
//************************************HELPER FUNCTIONS*****************************************************
//*********************************************************************************************************
//*********************************************************************************************************

function render(req, res, file, locals) {
    var toBeRendered = locals ? locals : {};
    toBeRendered.partials = {
        header: 'header',
        footer: 'footer',
        head: 'head',
        outdated: 'outdated',
        say: 'say'
    };
    toBeRendered.version = clientVersion;
    toBeRendered.isLoggedIn = (req.session.user !== undefined);
    toBeRendered.user = toBeRendered.isLoggedIn ? req.session.user.user : null;
    if (toBeRendered.isLoggedIn === true) {
        if (req.session.user.type == 'student') {
            toBeRendered.student = true;
            toBeRendered.teacher = false;
        } else if (req.session.user.type == 'teacher') {
            toBeRendered.student = false;
            toBeRendered.teacher = true;
        }
    }
    if (res.say) {
        toBeRendered.error = res.say.error;
        toBeRendered.message = res.say.message;
    };
    console.log(pj.render(toBeRendered));
    console.log(toBeRendered);
    res.render(file, toBeRendered);
}

function lookUpUser(uid, type, callback) {
    console.log(uid + ' TYPE: ' + type + ' PLURAL TYPE: ' + type + 's');
    try {
        root.child(type + 's')
            .orderByKey()
            .startAt(uid)
            .endAt(uid)
            .once('value', function(snap) {
                user = snap.val();
                console.log('USER:');
                console.log(user);
                if (user == null) {
                    callback('No user found', null);
                } else {
                    console.log('successfully got user');
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
            .orderByKey()
            .startAt(req.session.user.uid)
            .endAt(req.session.user.uid)
            .once('value', function(snap) {
                data = snap.val();
                console.log('pure data: ');
                console.log(pj.render(data));
                data = data[Object.keys(data)[0]];
                console.log('inner data: ');
                console.log(pj.render(data));
                var name = data.name;
                var otherArr = [];
                async.forEachOf(data.classes, function(item, key, callback) {
                    classes.child(key).once('value', function(snap) {
                        var thisClass = snap.val();
                        if (thisClass) {
                            console.log('ITEM');
                            console.log(item);
                            console.log('KEY');
                            console.log(key);
                            console.log('THISCLASS********************START');
                            console.log(pj.render(thisClass));
                            console.log('THISCLASS**********************END');
                            thisClass.id = key;
                            console.log(thisClass.code);
                            otherArr.push(thisClass);
                            callback();
                        } else if (!thisClass) {
                            thisClass = {
                                name: 'Error: Class Not Found',
                                id: key,
                                subject: 'This happened either because a teacher deleted the class or our server made a mistake.'
                            };
                            otherArr.push(thisClass);
                            callback();
                        }
                    }, function(err) {
                        callback(err);
                    });
                }, function(err) {
                    if (err) {
                        res.end('error: ' + err);
                    } else {
                        console.log(otherArr);
                        data.classes = otherArr;
                        var student;
                        var teacher;
                        console.log('DATASTART');
                        console.log(data);
                        console.log('DATAEND');
                        render(req, res, 'dashboard', {
                            type: req.session.user.type,
                            uid: Object.keys(snap.val())[0],
                            userData: data,
                            title: 'Dashboard'
                        });
                    }
                });
            });
    } else {
        res.redirect('/login?error=You are not signed in');
    }
});

app.all('/logout', function(req, res) {
    req.session.user = undefined;
    res.redirect('/login?message=You are logged out');
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
    console.log('Query:');
    console.log(req.query);
    if (req.session.user != undefined) {
        res.redirect('/dashboard');
    } else {
        render(req, res, 'login', {

        });

    }
});

app.get('/help', function(req, res) {
    render(req, res, 'help', {});
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

app.get('/dialog', function(req, res){
    render(req, res, 'dialog', {});
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
                var spot = students.child(userData.uid);
                spot.set({
                    'name': req.body.name,
                    classes: 0
                });
                res.redirect('/login?message=Your account was created');
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
                res.redirect('/login?message=Your account was created');
            }
        });
    } else {
        res.status(400).json({
            error: 'Invalid user type'
        });
    }
});

app.post('/login', urlencodedParser, function(req, res) {
    console.log('Req.body');
    console.log(req.body);
    lookUpUser(req.body.uid, req.body.type, function(err, data) {
        if (err) {
            // TODO: error
            console.error(err);
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
        try {
            classes
                .orderByKey()
                .startAt(req.body.classID)
                .endAt(req.body.classID)
                .once('value', function(snap) {
                    if (snap.val()) {
                        var studentClasses = students.child(req.session.user.uid + '/classes');
                        var theClass = studentClasses.child(req.body.classID);
                        theClass.set(true);
                        var studentLoc = classes.child(req.body.classID + '/students/' + req.session.user.uid);
                        studentLoc.set(true);
                        res.json({
                            'success': 'class added successfully'
                        });
                    } else if (!snap.val()) {
                        res.status(400).json({
                            'error': 'invalid class id: ' + req.body.classID
                        });
                    }
                })
        } catch (err) {
            res.status(500).send('Whoops! It looks like an internal server error: ' + err);
        }
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

app.post('/submitTest', urlencodedParser, function(req, res) {
    //Record Answers
    //try{
    console.log(pj.render(req.body));
    var response = responses.child(req.body.test);
    var toBeSubmitted = req.body.answers;
    toBeSubmitted.uid = req.session.user.uid;
    console.log(toBeSubmitted);
    var responseLoc = response.push(toBeSubmitted);
    answers
        .child(req.body.test)
        .orderByKey()
        .once('value', function(snap) {
            var answers = snap.val();
            console.log(answers);
            var keys = Object.keys(answers);
            console.log(keys);
            var answersArray = toArray(answers);
            console.log(answersArray);
            var gradedObj = {};
            var correct = 0;
            var counter = 0;
            for (var i = 0; i < answersArray.length; i++) {
                console.log(i);
                console.log(answersArray[i]);
                console.log(keys[i]);
                counter++;
                if (answersArray[i] == req.body.answers[keys[i]]) {
                    correct++;
                    gradedObj[keys[i]] = true;
                } else {
                    gradedObj[keys[i]] = false;
                }
            }
            gradedObj.scoreCorrect = correct;
            gradedObj.outOf = counter;
            gradedObj.uid = req.session.user.uid;
            var testGrade = grades.child(req.body.test);
            var gradeLoc = testGrade.child(responseLoc.key());
            gradeLoc.set(gradedObj);
            res.end('success');
        });
    //} catch(err){
    //console.log(err);
    //res.status(500).end(err);
    //}
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
    // TODO: delete references from all student accounts
    var theClass = classes.child(req.body.classID);
    theClass.remove();
    var str = req.session.user.uid + '/classes/' + req.body.classID;
    console.log(str);
    var teacherClassLoc = teachers.child(str);
    teacherClassLoc.remove();
    res.end('success');
    // TODO: error
});

app.post('/unenroll', urlencodedParser, function(req, res) {
    try {
        console.log(req.session.user.uid);
        console.log(req.body.classID);
        var studentClassToBeDeleted = students.child(req.session.user.uid + '/classes/' + req.body.classID);
        studentClassToBeDeleted.remove();
        res.end('success');
    } catch (err) {
        console.error(err);
        res.end(err);
    }
});

//*********************************************************************************************************
//*********************************************************************************************************
//************************************SPECIALIZED REQUESTS*************************************************
//*********************************************************************************************************
//*********************************************************************************************************

app.get('/classes/:classID', function(req, res) {
    // TODO: auth
    classes
        .orderByKey()
        .startAt(req.params.classID)
        .endAt(req.params.classID)
        .once('value', function(snap) {
            var data = snap.val();
            if (data == undefined) {
                console.error('The snapshot didn\'t find anything');
                res.redirect(404, '/dashboard?error=This class was not found');
                //todo - send error to client
            } else {
                data = data[Object.keys(data)[0]];
                var testsArr = [];
                async.forEachOf(data.tests, function(item, key, callback) {
                    tests
                        .orderByKey()
                        .startAt(key)
                        .endAt(key)
                        .once('value', function(snap) {
                            try {
                                var snapdata = snap.val();
                                var id = Object.keys(snapdata)[0];
                                snapdata = snapdata[id];
                                snapdata.id = id;
                                testsArr.push(snapdata);
                                callback();
                            } catch (err) {
                                console.log(err);
                                res.end(err + ' This might be caused because you deleted a class.');
                            }
                        }, function(err) {
                            callback(err);
                        });
                }, function(err) {
                    if (err) {
                        console.error(err);
                        res.end(err);
                    } else {
                        data.tests = testsArr;
                        if (req.session.user.type == 'student') {
                            render(req, res, 'class', {
                                classData: data,
                                classID: req.params.classID
                            });
                        } else if (req.session.user.type == 'teacher') {
                            var studentsArr = [];
                            async.forEachOf(data.students, function(item, key, callback) {
                                students
                                    .orderByKey()
                                    .startAt(key)
                                    .endAt(key)
                                    .once('value', function(snap) {
                                        var snapdata = snap.val();
                                        studentsArr.push(snapdata[Object.keys(snapdata)[0]]);
                                        callback();
                                    }, function(err) {
                                        callback(err);
                                    });
                            }, function(err) {
                                if (err) {
                                    console.error(err);
                                    res.end(err);
                                } else {
                                    data.students = studentsArr;
                                    render(req, res, 'class', {
                                        classData: data,
                                        classID: req.params.classID
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
});


app.get('/tests/:testID', function(req, res) {
    if (req.session.user) {
        tests
            .orderByKey()
            .startAt(req.params.testID)
            .endAt(req.params.testID)
            .once('value', function(snap) {
                // TODO: error check
                testInfo = snap.val();
                console.log(testInfo);
                if (testInfo) {
                    var id = Object.keys(testInfo)[0];
                    testInfo = testInfo[id];
                    console.log(testInfo);
                    if (req.session.user.type == 'student') {
                        if (testInfo.isAvailable === true) {
                            testData.child(req.params.testID)
                                .once('value', function(snap) {
                                    questionData = snap.val();
                                    var keys = Object.keys(questionData);
                                    var questions = toArray(questionData);
                                    for (var i = 0; i < questions.length; i++) {
                                        questions[i].id = keys[i];
                                    }
                                    var theTestData = {
                                        name: testInfo.name,
                                        questions: questions
                                    };
                                    render(req, res, 'test', theTestData);
                                });
                        } else {
                            res.redirect('/dashboard?error=Whoops! Your test is not ready to take yet.');
                        }
                    } else if (req.session.user.type == 'teacher') {
                        render(req, res, 'test', {
                            name: testInfo.name
                        });
                    }
                } else {
                    console.log('test is null');
                    // TODO: investigate
                }
            }, function(err) {
                res.end(err);
            });

    } else {
        res.redirect('/login?error=You are not signed in');
    }
});

app.get('/tests/:testID/grades', function(req, res) {
    if (req.session.user.type == 'teacher') {
        try {
            var testGrades = grades.child(req.params.testID);
            testGrades
                .orderByKey()
                .once('value', function(snap) {
                    data = snap.val();
                    var gradeData = [];
                    async.forEachOf(data, function(item, key, callback) {
                        console.log(item);
                        var score = item.scoreCorrect + '/' + item.outOf;
                        console.log(item.uid);
                        lookUpUser(item.uid, 'student', function(err, user) {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            } else {
                                console.log(user);
                                user = user[Object.keys(user)[0]]
                                gradeData.push({
                                    studentName: user.name,
                                    score: score
                                });
                                callback();
                            }
                        });
                    }, function(err) {
                        if (err) {
                            console.log(err);
                            res.end(err);
                        } else {
                            var renderData = {}
                            renderData.scores = gradeData;
                            console.log(req.params.testID);
                            tests.child(req.params.testID)
                                .once('value', function(snap) {
                                    var data = snap.val();
                                    renderData.testName = data.name;
                                    render(req, res, 'grades', renderData);
                                });
                        }
                    });
                });
        } catch (err) {
            console.log(err);
            res.redirect(400, '/classes/' + req.params.classID + '?error=The class you are looking for does not exist.')
        }
    } else {
        res.redirect(403, '/classes/' + req.params.classID + '?error=You do not have access to those grades');
    }
});

app.get('/createTest', function(req, res) {
    if (req.session.user) {
        render(req, res, 'create', {
            classID: req.params.classID ? req.params.classID : null
        });
    } else {
        res.redirect('/login?error=You are not signed in');
    }
});

console.log('Finished starting TestTaker Server v' + version);

module.exports = app;
