const tests = {

    fund: {
        title: "💻 Computer Fundamentals",
        tests: [
            {
                name:"Computer Fundamental Test 01",
                id:"FUND01",
                questions:50
            },
            {
                name:"Computer Fundamental Test 02",
                id:"FUND02",
                questions:50
            },
            {
                name:"Computer Fundamental Test 03",
                id:"FUND03",
                questions:50
            },
            {
                name:"Computer Fundamental Test 04",
                id:"FUND04",
                questions:50
            },
            {
                name:"Computer Fundamental Test 05",
                id:"FUND05",
                questions:50
            }
        ]
    },


    win: {
        title:"🪟 Windows OS",
        tests:[
            {
                name:"Windows Test 01",
                id:"WIN01",
                questions:50
            },
            {
                name:"Windows Test 02",
                id:"WIN02",
                questions:50
            }
        ]
    },


    word:{
        title:"📝 MS Word",
        tests:[
            {
                name:"MS Word Test 01",
                id:"WORD01",
                questions:50
            }
        ]
    },


    excel:{
        title:"📊 MS Excel",
        tests:[
            {
                name:"MS Excel Test 01",
                id:"EXCEL01",
                questions:50
            }
        ]
    },


    ppt:{
        title:"📢 PowerPoint",
        tests:[
            {
                name:"PowerPoint Test 01",
                id:"PPT01",
                questions:50
            }
        ]
    },


    net:{
        title:"🌐 Internet",
        tests:[
            {
                name:"Internet Test 01",
                id:"NET01",
                questions:50
            }
        ]
    }

};





function showTests(topic){


    document.getElementById("topicSection").classList.add("hidden");

    document.getElementById("testSection").classList.remove("hidden");


    const data = tests[topic];


    document.getElementById("selectedTopicTitle").innerHTML = data.title;



    let html="";


    data.tests.forEach(test=>{


        html += `

        <div class="card test-card">

            <h4>${test.name}</h4>

            <p class="test-info">
            Total Questions: ${test.questions}
            </p>


            <button class="btn-start"
            onclick="startTest('${test.id}')">
            Start Test
            </button>

        </div>

        `;


    });



    document.getElementById("testListContainer").innerHTML = html;


}





function goBack(){


document.getElementById("topicSection")
.classList.remove("hidden");


document.getElementById("testSection")
.classList.add("hidden");


}





function startTest(testId){

    alert("Selected Test ID: " + testId);

    console.log("Selected Test ID:", testId);


    localStorage.setItem("testId", testId);


    console.log(
        "Stored Test ID:",
        localStorage.getItem("testId")
    );


    window.location.href = "mocktest.html";

}