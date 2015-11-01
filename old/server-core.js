//purpose --> to manage the serverside aspect of the testing. This includes validating, providing images, etc.
function generateHtml(data) {
  var questions = data.questions;
  var fileType = data.fileType;
  var location = data.images;

  var html;
  var generatedQuestions;

  function createImage(imgLocation) {
    var data = "<br><img src='" + imgLocation + "'>";
    return data;
  }

  var elId = [""];

  function createQuestion(questionNumber) {
    qmod = questionNumber - 1;
    var qid = randomArray[qmod];
    var injectHtml = createImage(location + "/pics/" + qid + fileType) + "<br><input type='text' id='" + questionNumber + "'>";
    return injectHtml;
  }

  function startTest(questions) {
    console.info("We just started the test");
    selectAnswers();
    html = "<h1>TestTaker2000</h1> <p>Hello, " + studentName + ". Welcome to the testing page. There should be " + numofqs + "  question(s) on the test below. do your best to answer the questions. Type in the box that corresponds with the question number. Scroll down the page to see more questions and answer boxes. When you are done, press submit at the bottom of the page. Do your best!</p> <p id='message' class='error'></p>";


    for (var i = 1; i < numofqsmod; i++) {
      generatedQuestions += createQuestion(i);
    }
  }
  html += "<div id='quizDiv'>" + generatedQuestions + "<input type='submit' onclick='grade();</div>";
  return html;
}

exports.init = function(testmode) {
  var newHtml;
  switch (testmode) {
    case 'chyatte':
      numberofquestions = 30;
      imgLocation = 'chyatte';
      fileType = '.jpg';
      newHtml = generateHtml(numberofquestions);
      break;
    default:
      console.log('ERROR: TESTMODE NOT IDENTIFIED');
      newHtml = "<p class='error'>Error: Testmode not identified. Please try again or report a bug.";
  }
  return newHtml;
};
