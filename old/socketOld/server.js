var version = '0.0.0'
console.log('Starting TestTaker Server v' + version);
var app = require('express').createServer();
var io = require('socket.io')(app);
var Firebase = req('firebase');
var root = new Firebase('http://testtaker.firebaseio.com')

app.listen(443);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/static/index.html');
});
app.get('/test', function(req, res) {
    res.sendfile(__dirname + '/static/test/test.html');
});

/*io.on('connection', function(socket) {

            socket.on('signUp', function(data) {
                if (data.type == student) {
                    var students = root.child('students');
                    students.createUser({
                        email: data.id,
                        password: data.password
                    }, function(error, userData) {
                        if (error) {
                            switch (error.code) {
                                case "EMAIL_TAKEN":
                                    socket.emit('error', "The new user account cannot be created because the email is already in use.");
                                    break;
                                case "INVALID_EMAIL":
                                    socket.emit('error', "The specified email is not a valid email.");
                                    break;
                                default:
                                    socket.emit('error', "Error creating user:" + error);
                            }
                        } else {
                            socket.emit('create', "Successfully created user account with uid:" + userData.uid);
                        }
                    });
                } else if (data.type == 'teacher') {
                    var professors = root.child('professors');
                    professors.createUser({
                        email: data.id,
                        password: data.password
                    }, function(error, userData) {
                        if (error) {
                            switch (error.code) {
                                case "EMAIL_TAKEN":
                                    socket.emit('error', "The new user account cannot be created because the email is already in use.");
                                    break;
                                case "INVALID_EMAIL":
                                    socket.emit('error', "The specified email is not a valid email.");
                                    break;
                                default:
                                    socket.emit('error', "Error creating user:" + error);
                            }
                        } else {
                            socket.emit('create', "Successfully created user account with uid:" + userData.uid);
                        }
                    });
                }
            });

            socket.on('test', function(socket) {

            });
        }*/

        //console.log('Started TestTaker Server v' + version);
