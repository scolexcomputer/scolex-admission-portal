//================================
// SCOLEX STUDENT LOGIN
//================================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4GnLgmd_cV31nocPlRWd6tH0K-HOB-FLtzrtdZ_UGhr8SfWn8SMv5OQnibb5-Mnyp/exec";


function login(){


const loginId = document.getElementById("loginId").value.trim();

const password = document.getElementById("password").value.trim();



if(loginId === "" || password === ""){

alert("Please enter login details");

return;

}



const loginData = {

action:"login",

loginId:loginId,

password:password

};



fetch(SCRIPT_URL, {

method:"POST",

headers:{

"Content-Type":"text/plain;charset=utf-8"

},

body:JSON.stringify(loginData)

})


.then(response=>response.json())


.then(data=>{


console.log(data);



if(data.status === "success"){


localStorage.setItem(
"student",
JSON.stringify(data.student)
);



alert(
"Login Successful\nWelcome "+data.student.name
);



window.location.href="dashboard.html";


}

else{


alert(data.message);

}


})


.catch(error=>{


console.error("Login Error:",error);


alert("Unable to connect with server");


});


}