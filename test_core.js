module.exports = {
    generate: function(input){
        numberOfQuestions = input.length;
        var randomArray = [];
        function contains(randomArray, num) {
          for (var i = 0; i < randomArray.length; i++) {
            if (randomArray[i] === num)
              return true;
          }
          return false;
        }
        function randomize() {
          var value = Math.floor((Math.random() * 5) - 1);
          return value;
        }
        function selectAnswers() {
          var randnum;
          var i = 0;
          while (i < numberOfQuestions) {
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
        selectAnswers();
    }
}
