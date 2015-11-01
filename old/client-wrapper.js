//purpose --> to manage communication between client and server, and to manage all local js tasks
(function() {
  var socket = io();
  $('#submit').on('click', function(){
    var login = $('#code');
    socket.emit('login', login);
  });
  var step1 = '<p id="error" class="error"></p><p>Please your name.</p><input type="text" placeholder="Name" id="name"> <button onclick="notEmpty()"">Start Test</button>';
  $('');
})();
