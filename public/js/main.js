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
        var root = new Firebase('testtaker.firebaseio.com');
        var testData = root.child('testData');
        var answers = root.child('answers');
        var tests = root.child('tests');
        var classes = root.child('classes');

        $('#startTestingSession').on('click', function() {
            var href = window.location.href;
            //string operations so development and production can use same code
            var num = href.search('/tests') + 7;
            var testID = href.substr(num, href.length);
            var test = tests.child(testID);
            var stat = test.child('isAvailable');
            stat.set(true);
            alert('session started');
        });

        $('#endTestingSession').on('click', function() {
            //string operations so development and production can use same code
            var num = href.search('/tests') + 7;
            var testID = href.substr(num, href.length);
            var test = tests.child(testID);
            var stat = test.child('isAvailable');
            stat.set(false);
            alert('session stopped');
        });

        $('[id^=delete-]').on('click', function() {
            if (mainType == 'teacher') {
                $.post('/deleteClass', {
                    classID: (this).id.replace('delete-', '')
                }, function(data) {
                    console.log(data);
                    window.location = '/dashboard';
                });
            } else if (mainType == 'student') {
                $.post('/unenroll', {
                    classID: (this).id.replace('delete-', '')
                }, function(data) {
                    console.log(data);
                    window.location = '/dashboard';
                });
            }
        });

        $('#addClass').on('click', function() {
            $("#dialog").show();
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
        /*$('#submitTest').on('click', function() {
            $.post('/gradeTest', {
                'uid': uid
            });
        });*/
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
                          if (window.location.href.search(/\\?/g) == -1){
                            window.location.href += '?error='+ error;
                          } else {
                            window.location.href += '&error='+ error;
                            }
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
                          if (window.location.href.search(/\\?/g) == -1){
                            window.location.href += '?error='+ error;
                          } else {
                            window.location.href += '&error='+ error;
                            }
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

        var counter = 1;

        $('#create').on('click', function() {
            var testInfo = {
                name: $('#testName').val(),
                date: $('#testDate').val()
            };
            var test = tests.push(testInfo);
            var key = test.key();
            $('.question').each(function(index, el) {
                console.log('INDEX: ' + index);
                console.log('ELEMENT: ');
                console.log(el);
                var obj = {
                    prompt: $(el).find('.prompt').val(),
                    imageUrl: $(el).find('.imageUrl').val()
                };
                console.log(obj);
                var thisTestData = testData.child(key);
                var question = thisTestData.push(obj);
                qkey = question.key();
                var answerLoc = answers.child(key);
                answerLoc.child(qkey).set($(el).find('.answer').val());

                var cTests = classes.child(theClass + '/tests');
                var cTest = cTests.child(key);
                cTest.set(true);
            });
        });

        $('#newQuestion').on('click', function() {
            counter++;
            $('#questions').append('<div class="question"><div class="demo-card-wide mdl-card mdl-shadow--2dp"> <div class="mdl-card__title"> <h2 class="mdl-card__title-text" style="color: black;">Question ' + counter +
                '</h2> </div><div class="mdl-card__supporting-text"> <div class="mdl-textfield mdl-js-textfield"> <input name="testImage" class="mdl-textfield__input prompt" type="text" id="prompt"> <label class="mdl-textfield__label" for="prompt">Prompt/Question</label> </div><div class="mdl-textfield mdl-js-textfield"> <input name="testImage" class="mdl-textfield__input imageUrl" type="text" id="imageUrl"> <label class="mdl-textfield__label" for="imageUrl">Image URL</label> </div></div><div class="mdl-card__actions mdl-card--border"> <div class="mdl-textfield mdl-js-textfield"> <input name="testImage" class="mdl-textfield__input answer" type="text" id="answer"> <label class="mdl-textfield__label" for="answer">Answer</label> </div></div><div class="mdl-card__menu"> <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect deleteQuestion"> <i class="material-icons md-dark">delete</i> </button> </div></div></div></div>'
            );
        });

        $('.deleteQuestion').on('click', function() {
            console.log(this);
            $(this).parent().parent().remove();
        });


    });
