//====================================
// SCOLEX MOCK TEST JAVASCRIPT
//====================================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxRrvBiqpQEkLyGEazHJ9f4DBoGGhbUH_KyNUWbe5NoE_xM1R2KoWT5cy4Ht9taCxXb/exec";


let questions = [];
let currentQuestion = 0;
let answers = [];



//====================================
// LOAD QUESTIONS
//====================================

window.onload = function(){

fetch(SCRIPT_URL + "?action=getQuestions")

.then(response => response.json())

.then(data => {


console.log(data);


if(data.status=="success"){


questions = data.questions;


// store answers
answers = new Array(questions.length).fill(null);



document.getElementById("totalQNum").innerHTML =
questions.length;



loadQuestion();


}
else{

alert("Question loading failed");

}



})


.catch(error=>{

console.log(error);

alert("Server connection error");

});


};






//====================================
// DISPLAY QUESTION
//====================================

function loadQuestion(){


let q = questions[currentQuestion];



document.getElementById("currentQNum").innerHTML =
currentQuestion + 1;



document.getElementById("questionText").innerHTML =
q.question;



document.getElementById("opt0").innerHTML =
q.optionA;


document.getElementById("opt1").innerHTML =
q.optionB;


document.getElementById("opt2").innerHTML =
q.optionC;


document.getElementById("opt3").innerHTML =
q.optionD;




// select previous answer

let radios =
document.querySelectorAll(
'input[name="quizOption"]'
);


radios.forEach((radio,index)=>{


radio.checked =
answers[currentQuestion] == index;


});



updateProgress();



document.getElementById("prevBtn").disabled =
currentQuestion==0;



if(currentQuestion == questions.length-1){


document.getElementById("nextBtn").style.display="none";

document.getElementById("submitBtn").style.display="block";


}

else{


document.getElementById("nextBtn").style.display="block";

document.getElementById("submitBtn").style.display="none";


}



}






//====================================
// SELECT OPTION
//====================================


function selectOption(index){


answers[currentQuestion]=index;



let cards =
document.querySelectorAll(".option-card");


cards.forEach(card=>{

card.classList.remove("selected");

});



cards[index].classList.add("selected");



}






//====================================
// NEXT QUESTION
//====================================

function nextQuestion(){


if(currentQuestion < questions.length-1){


currentQuestion++;

loadQuestion();


}


}






//====================================
// PREVIOUS QUESTION
//====================================

function prevQuestion(){


if(currentQuestion>0){


currentQuestion--;

loadQuestion();


}


}






//====================================
// PROGRESS BAR
//====================================

function updateProgress(){


let progress =
((currentQuestion+1)/questions.length)*100;


document.getElementById("progressBar").style.width =
progress+"%";


}






//====================================
// SUBMIT TEST
//====================================

function submitTest(){


let score=0;



questions.forEach((q,index)=>{


if(answers[index] == q.answer){

score++;

}


});



alert(
"Test Completed\n\nScore : "
+score+
"/"+
questions.length
);



}