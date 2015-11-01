$('#login').on('click', function(){
    var login = io.connect('https://localhost/login', {secure: true});
    login.emit('login', {name: $('#name').val(), password: $('#password').val()});
});
