$(document).ready(function() {

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
