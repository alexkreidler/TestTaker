$(document).ready(function() {

    version = '0.0.0';
    console.info('Starting TestTaker Client v' + version);
    root = new Firebase('https://testtaker.firebaseio.com/');
    // TODO: fix onclick event listener

    $('#studentLogin').on('click', function() {
        console.log('hi');
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
                console.log(authData);
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
        console.log('hi');
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
                console.log(authData);
                $.post('localhost:443/login', {
                    'uid': authData.uid,
                    'type': 'teacher'
                });
            }
        });
    });

});
