    var mainType;
    var uid;

    function submit(form, type) {
        var item = $('#' + type + form.capitalizeFirstLetter());
        console.log(item);
        item.attr('checked', true);
        mainType = type;
        $('#' + form + 'Form').submit();
    }
    $(document).ready(function() {
        root = new Firebase('testtaker.firebaseio.com');

        $('[id^=delete-]').on('click', function() {
            if (mainType == 'teacher') {
                $.post('/deleteClass', {
                    classID: (this).id.replace('delete-', '')
                }, function(data) {
                    console.log(data);
                    window.location = '/dashboard';
                });
            } else if (mainType == 'student'){
                $.post('/unenroll', {
                    classID: (this).id.replace('delete-', '')
                }, function(data) {
                    console.log(data);
                    window.location = '/dashboard';
                });
            }
        });

        $('#addClass').on('click', function() {
            $('#dialog').show();
            $('#doIt').on('click', function() {
                if (mainType == 'teacher') {
                    $.post('/createClass', {
                        className: $('#className').val()
                    }, function(data) {
                        console.log(data);
                        window.location = '/dashboard';
                    });
                } else if (mainType == 'student') {
                    $.post('/addClass', {
                        classID: $('#classID').val()
                    }, function(data) {
                        console.log(data);
                        window.location = '/dashboard';
                    });
                } else {
                    // TODO: err
                }
            });
        });
        $('#submitTest').on('click', function() {
            $.post('/gradeTest', {
                'uid': uid
            });
        });
        var submitVar = false;
        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };

        $('#loginForm').submit(function(event) {
            if (submitVar === true) {
                return true;
            } else {
                event.preventDefault();
                if (mainType == 'student') {
                    students = root.child('students');
                    students.authWithPassword({
                        "email": $('#loginEmail').val(),
                        "password": $('#loginPass').val()
                    }, function(error, authData) {
                        if (error) {
                            // TODO: error
                            console.log('error signing in: ' + error);
                        } else {
                            $('#loginForm').html($('#loginForm').html() + '<input name="uid" type="text" value="' + authData.uid + '" style="display: none;">');
                            submitVar = true;
                            $('#loginForm').submit();
                        }
                    });
                } else if (mainType == 'teacher') {
                    teachers = root.child('teachers');
                    teachers.authWithPassword({
                        "email": $('#loginEmail').val(),
                        "password": $('#loginPass').val()
                    }, function(error, authData) {
                        if (error) {
                            // TODO: error
                            console.log('error signing in');
                        } else {
                            $('#loginForm').html($('#loginForm').html() + '<input name="uid" type="text" value="' + authData.uid + '" style="display: none;">');
                            submitVar = true;
                            $('#loginForm').submit();
                        }
                    });
                } else {
                    throw 'invalid type';
                }
            }
        });
    });
    $('#signUpStudent').on('click', function() {
        $.post('/signUp', {
            'type': 'student',
            'email': $('#signUpEmail').val(),
            'password': $('#signUpPass').val()
        });
    });
    $('#signUpTeacher').on('click', function() {
        $.post('/signUp', {
            'type': 'teacher',
            'email': $('#signUpEmail').val(),
            'password': $('#signUpPass').val()
        });
    });
    $('addClass').on('click', function() {
        $.post('/addClass', {
            'type': type,
            'uid': uid
        });
    });
    $('submitTest').on('click', function() {
        $.post('/gradeTest', {
            'uid': uid
        });
    });
    $('.lookLikeButton').html(
    'testing'
);
