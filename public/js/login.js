var uid;
var type;
$(document).ready(function() {
  var root = new Firebase('https://testtaker.firebaseio.com');
  $('#studentLogin').on('click', function() {
    var students = root.child('students');
    students.authWithPassword({
      "email": $('#loginEmail').val(),
      "password": $('#loginPass').val()
    }, function(error, authData) {
      if (error) {
        // TODO: error
        console.log('error signing in');
      } else {
        // TODO: success
        type = 'student';
        console.log(authData);
        uid = authData.uid
        $.post('/login', {
          'uid': authData.uid,
          'type': 'student',
          authData: authData
        }, function(data) {
          $('html').html(data);
        });
      }
    });
  });

  $('#teacherLogin').on('click', function() {
    var professors = root.child('professors');
    professors.authWithPassword({
      "email": $('#user').val(),
      "password": $('#pass').val()
    }, function(error, authData) {
      if (error) {
        // TODO: error
        console.log('error signing in');
      } else {
        // TODO: success
        type = 'teacher';
        uid = authData.uid;
        console.log(authData);
        $.post('/login', {
          'uid': authData.uid,
          'type': 'teacher'
        });
      }
    });
  });
  $('#signUpStudent').on('click', function() {
    $.post('/signUp', {
      'type': 'student',
      'email': $('#signUpEmail').val(),
      'password': $('#signUpPass').val()
    })
  })
  $('#signUpTeacher').on('click', function() {
    $.post('/signUp', {
      'type': 'teacher',
      'email': $('#signUpEmail').val(),
      'password': $('#signUpPass').val()
    })
  })
});
