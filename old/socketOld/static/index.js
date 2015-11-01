var socket = io('https://localhost:443', {
  secure: true
});
root = new Firebase('https://testtaker.firebaseio.com/');
$('#studentLogin').on('click', function() {
    var students = root.child('students');
    students.authWithPassword({
      "email": data.id,
      "password": data.password
    }, function(error, authData) {
      if (error) {
        socket.emit('error', 'Login Failed!' + error)
      } else {
        socket.emit('auth', "Authenticated successfully with payload:" + authData);
      }
    });
});

$('#teacherLogin').on('click', function() {
    var professors = root.child('professors');
    professors.authWithPassword({
      "email": data.id,
      "password": data.password
    }, function(error, authData) {
      if (error) {
        socket.emit('error', 'Login Failed!' + error)
      } else {
        socket.emit('auth', "Authenticated successfully with payload:" + authData);
      }
    });
});

$('#studentSignUp').on('click', function() {
  socket.emit('signUp', {
    type: 'student',
    password: $('#pass'),
    id: $('#user'),
    name: $('#signUpName')
  })
});

$('#teacherSignUp').on('click', function() {
  socket.emit('signUp', {
    type: 'teacher',
    password: $('#pass'),
    id: $('#user'),
    name: $('#signUpName')
  })
});

socket.on('error', function(data){
// TODO: Error message
});
