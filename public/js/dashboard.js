$('addClass').on('click', function(){
    $.post('/addClass', {'type': type, 'uid': uid})
});
$('submitTest').on('click', function(){
    $.post('/gradeTest', {'uid': uid})
});
