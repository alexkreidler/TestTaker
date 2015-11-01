//Copyright (c) Pending
//Purpose -- > to manage all client side aspects of testing. This includes manipulating DOM, dealing with errors, etc

console.info("We're off.");

var quizDiv;

var fileType = ".jpg";

var studentName;

var score = 0;

var numberofquestions;

var quizSpace;

var userAnswers = [];

//answer holders
//replace with your answers corresponding to images
var answers = ["2", "4", "6", "8", "10", "answer", "answer", "answer", "answer", "answer"];

var randomArray = [];

/**
 * Checks to see if the randomized number is already in the randomArray
 * @param randomArray
 * @param num Randomized number
 * @returns {Boolean} True if number is contained in randomArray, false if number is not.
 */
function contains(randomArray, num) {
  for (var i = 0; i < randomArray.length; i++) {
    if (randomArray[i] === num)
      return true;
  }
  return false;
}

/**
 * Randomizes a number between 1 and 50
 * @returns randomized number
 */
function randomize() {
  var value = Math.floor((Math.random() * 5) - 1);
  return value;
}

/**
 * Calls randomize() to calculate a random number, then calls contain() method and
 * adds number to randomArray if number is not already contained in the randomArray.
 * While loop loops until iterator(i) is equal to the number of questions.
 */
function selectAnswers() {
  var randnum;
  var i = 0;
  while (i < numberofquestions) {
    randnum = randomize();
    if (randomArray[0] !== null) //If the randomArray is not empty
    {
      if (!(contains(randomArray, randnum))) //If the number is not already in the randomArray
      {
        randomArray.push(randnum); //adds number to randomArray
        i++;
      }
    } else {
      randomArray.push(randnum);
      i++;
    }

  }
}


//Adds to current score
function addScore() {
  score = score + 1;
}

//puts all of the users answers into an array
function funnel(numofqs) {
  numofqsmod = numofqs + 1;
  for (i = 1; i < numofqsmod; i++) {
    var data = document.getElementById(i);
    userAnswers.push(data.value);
  }
}

//Validates the accuracy of the answer given
function validate() {
  for (var i = 0; i < userAnswers.length; i++) {
    var data = randomArray[i];
    var userAnswer = userAnswers[i];
    var actualAnswer = answers[data];

    if (userAnswer.localeCompare(actualAnswer) === 0) {
      score++;
    }
  }
}


//Sends student name, score, and number of questions
function sendScore() {
  var myDataRef = new Firebase('https://testtaker2014.firebaseio.com/');
  myDataRef.push({
    name: studentName,
    score: score + "/" + numberofquestions
  });
}

// Ends test and redirects student to the home page
function endTest() {
  document.body.innerHTML = "<h1>Thank you for using TestTaker 2000</h1><p>Your score has been recorded.</p><p>You will be redirected to the homepage in 5 seconds</p>";
  setTimeout(function() {
    window.location = "index.html";
  }, 5000);
}

//Calculates accuracy of the answers
function grade() {
  funnel(numberofquestions);
  validate();
  sendScore();
  endTest();

}


//Creates an image for the test question
function createImage(imgLocation) {
  console.info("We just created an image");
  quizDiv.innerHTML += "<br><img src='" + imgLocation + "' alt='Something went wrong.'>";
}

var elId = [""];

//Creates question with the image included
function createQuestion(questionNumber) {
  console.info("We just created a question");
  qmod = questionNumber - 1;
  var qid = randomArray[qmod];
  createImage("pics/" + qid + fileType);
  quizDiv.innerHTML += "<br><input type='text' id='" + questionNumber + "'>";
}

//Creates a submit button
function createSubmit() {
  console.info("We just created a submit button");
  quizDiv.innerHTML += "<input type='submit' onclick='grade();'>";
}

//Creates questions, declares references that hold ansers
function startTest(numofqs) {
  console.info("We just started the test");
  numberofquestions = numofqs;
  selectAnswers();
  document.body.innerHTML = "<h1>TestTaker2000</h1> <p>Hello, " + studentName + ". Welcome to the testing page. There should be " + numofqs + "  question(s) on the test below. do your best to answer the questions. Type in the box that corresponds with the question number. Scroll down the page to see more questions and answer boxes. When you are done, press submit at the bottom of the page. Do your best!</p> <p id='message' class='error'></p>";
  quizDiv = document.createElement("div");
  document.body.appendChild(quizDiv);
  document.head.innerHTML += "<title>TestTaker2000</title>";
  document.head.innerHTML += "<link rel='stylesheet' href='main.css'>";

  numofqsmod = numofqs + 1;

  //Loops until i is equal to the number of questions
  for (var i = 1; i < numofqsmod; i++) {
    createQuestion(i); //Throws number question to method createQuestion
  }
  createSubmit(); //Calls createSubmit();
}


//Error is checked if student doesn't enter name field correctly
function notEmpty() {
  console.info("We just checked your info");
  var myTextField = document.getElementById('myText');
  var name = document.getElementById('name');

  if (name.value === "") {
    var errorSpot = document.getElementById("error");
    errorSpot.innerHTML = "Please enter the student's name.";
  } else {

    studentName = name.value;
    if (myTextField.value === "") {
      var errorSpot = document.getElementById("error");
      errorSpot.innerHTML = "Please enter a number.";
    } else if (myTextField.value < 1) {
      var errorSpot = document.getElementById("error");
      errorSpot.innerHTML = "You can't have " + myTextField.value + " questions on a test";
    } else {
      document.body.innerHTML = "<p>Hello, " + name.value + ". There will be " + myTextField.value + " questions on the test. When you are ready, press Start Test.</p><button onclick='startTest(" + myTextField.value + ");'>Start Test</button>";
    }
  }
}

//Professor login
function goToLogin() {
  document.head.innerHTML = "<link rel='stylesheet' href='main.css'>";
  document.body.innerHTML = "<h1>Login</h1> <p>Please enter your password below.</p><input type='password' id='password'><input type='submit' onclick='login();'><p class='error' id='messageBox'></p>";
}

function login() {
  var pwd = document.getElementById("password");
  if (pwd.value == "password") {
    loggedIn();
  } else {
    var message = document.getElementById("messageBox");
    message.innerHTML = "The password you entered is incorrect. Please try again.";
  }
}

//Prints how scores to Professor (Will later be printed out into excel)
function loggedIn() {
  document.body.innerHTML = "<h1>Welcome to your dashboard.</h1><button onclick='viewScores();'>View student scores.</button>";
}

//Prints out scores
function viewScores() {
  document.body.innerHTML = "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\"></script><script src='https://cdn.firebase.com/js/client/2.0.4/firebase.js'><\/script><h1>Student scores</h1><div id='messagesDiv'></div>";

  var myDataRef = new Firebase('https://testtaker2014.firebaseio.com/');

  console.info("we made a reference to a firebase");
  try {
    myDataRef.on('child_added', function(snapshot) {
      var message = snapshot.val();
      displayChatMessage(message.name, message.score);
    });
  } catch (err) {
    throw "We could't get a message from firebase or create a snapshot. Error Code: " + err;
  }


  function displayChatMessage(name, score) {
    $('<div/>').text(score).prepend($('<em/>').text(name + ': ')).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
    console.info("We recieved a score of " + score + " for a student named " + name + " and we added it to the list");
  }

}
