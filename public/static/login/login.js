function authHandler(error, authData) {
    if (error) {
        console.log("Login Failed!", error);
    } else {
        console.log("Authenticated successfully with payload:", authData);
        window.location = window.location.hostname + '/dashboard';
    }
}

if (window.location.hash == '#student_sign_up') {
    $('#page').html('Please input the login code that your professor gave you: <input type="text" id="code" placeholder="Login Code"><button id="studentSignUp">Sign Up</button>')

} else if (window.location.hash == '#professor') {
    $('#page').html('<input type="text" placeholder="name" id="name"><input type="password" placeholder="password" id="password"><button id="professorLogin">Log In</button>');
    $('#professorLogin').on('click', function() {
        ref.authWithPassword({
            email: $('#name').val(),
            password: $('#password').val()
        }, authHandler);
    });
} else if (window.location.hash == '#student') {
    $('#page').html('<input type="text" placeholder="name" id="name"><input type="password" placeholder="password" id="password"><button id="studentLogin">Log In</button>')

}
