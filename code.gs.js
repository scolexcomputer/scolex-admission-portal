//====================================================
// SCOLEX MOCK TEST PORTAL
// GOOGLE APPS SCRIPT BACKEND
//====================================================


//====================================================
// GET REQUEST
//====================================================
function doGet(e) {

  const action = e && e.parameter ? e.parameter.action : "";

  if (action === "getQuestions") {

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("question_bank");

    if (!sheet) {
      return jsonResponse({
        status: "error",
        message: "question_bank sheet not found"
      });
    }

    const rows = sheet.getDataRange().getValues();

    const questions = [];

    for (let i = 1; i < rows.length; i++) {

      questions.push({
        testId: rows[i][0],
        topic: rows[i][1],
        qNo: Number(rows[i][2]),
        question: rows[i][3],
        options: [
          rows[i][4],
          rows[i][5],
          rows[i][6],
          rows[i][7]
        ],
        answer: Number(rows[i][8])
      });

    }

    return jsonResponse({
      status: "success",
      questions: questions
    });

  }

  return jsonResponse({
    status: "success",
    message: "Scolex Mock Test API Running"
  });

}
//====================================================
// POST REQUEST
//====================================================
function doPost(e) {

  try {

    const data = JSON.parse(e.postData.contents);

    switch (data.action) {

      case "signup":
        return signupStudent(data);

      case "login":
        return loginStudent(data);

      case "saveResult":
        return saveResult(data);

      default:
        return jsonResponse({
          status: "error",
          message: "Invalid Action"
        });

    }

  } catch (error) {

    return jsonResponse({
      status: "error",
      message: error.toString()
    });

  }

}
//====================================================
// STUDENT SIGNUP
//====================================================


function signupStudent(data){


const sheet = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(STUDENT_SHEET);



const rows = sheet
.getDataRange()
.getValues();



// duplicate mobile check

for(let i=1;i<rows.length;i++){


let mobile = String(rows[i][3]).trim();



if(mobile == String(data.mobile).trim()){


return jsonResponse({

status:"exists",
message:"Mobile number already registered"

});


}


}




const studentId = 
"STD" +
Utilities.formatDate(
new Date(),
"Asia/Kolkata",
"yyyyMMddHHmmss"
);



sheet.appendRow([

studentId,
data.name,
data.father,
data.mobile,
data.email,
data.course,
data.password,
new Date()

]);



return jsonResponse({

status:"success",
studentId:studentId

});


}






//====================================================
// STUDENT LOGIN
//====================================================


function loginStudent(data){


const sheet = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(STUDENT_SHEET);



const rows = sheet
.getDataRange()
.getValues();



const loginId = String(data.loginId).trim();

const password = String(data.password).trim();



for(let i=1;i<rows.length;i++){


const studentId = String(rows[i][0]).trim();

const name = String(rows[i][1]).trim();

const father = String(rows[i][2]).trim();

const mobile = String(rows[i][3]).trim();

const email = String(rows[i][4]).trim();

const course = String(rows[i][5]).trim();

const savedPassword = String(rows[i][6]).trim();





if(
(loginId === studentId || loginId === mobile)
&&
(password === savedPassword)
){



return jsonResponse({


status:"success",


student:{


id:studentId,
name:name,
father:father,
mobile:mobile,
email:email,
course:course


}



});


}



}



return jsonResponse({

status:"failed",
message:"Invalid Student ID/Mobile or Password"

});


}



//====================================================
// GET QUESTIONS BY TEST ID
// Example: FUND01
//====================================================


function getQuestions(testId){


const sheet = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(QUESTION_SHEET);



if(!sheet){


return jsonResponse({

status:"error",
message:"question_bank sheet not found"

});


}




const rows = sheet
.getDataRange()
.getValues();



const questions = [];



const searchId = String(testId)
.trim()
.toUpperCase();




// Convert answer format
// A=0, B=1, C=2, D=3

const answerMap = {

"A":0,
"B":1,
"C":2,
"D":3

};





for(let i=1;i<rows.length;i++){



const sheetId = String(rows[i][0])
.trim()
.toUpperCase();



if(sheetId !== searchId){

continue;

}




let rawAnswer = String(rows[i][8])
.trim()
.toUpperCase();



let finalAnswer;



if(answerMap[rawAnswer] !== undefined){

finalAnswer = answerMap[rawAnswer];

}
else{


finalAnswer = parseInt(rawAnswer);


}




questions.push({


testId:sheetId,

topic:rows[i][1],

qno:rows[i][2],

question:rows[i][3],


options:[

rows[i][4],
rows[i][5],
rows[i][6],
rows[i][7]

],


answer:isNaN(finalAnswer) ? 0 : finalAnswer



});



}




return jsonResponse({

status:"success",

questions:questions

});



}








//====================================================
// SAVE RESULT
//====================================================


function saveResult(data){



const sheet = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(RESULT_SHEET);



sheet.appendRow([


new Date(),

data.studentName,

data.mobile,

data.course,

data.testId,

data.total,

data.correct,

data.wrong,

data.unattempted,

data.score



]);




return jsonResponse({


status:"success",

message:"Result Saved Successfully"


});


}








//====================================================
// JSON RESPONSE
//====================================================


function jsonResponse(obj){


return ContentService

.createTextOutput(
JSON.stringify(obj)
)

.setMimeType(
ContentService.MimeType.JSON
);


}