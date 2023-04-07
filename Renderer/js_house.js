let house;
let moneyEarnt = 0; 
let jobComplete = false; 

const store = window.api.store;

const searchArounBtn = document.getElementById('searchAroundBtn')
const eventsDiv = document.getElementById('events');
const eventOutComesLt = document.getElementById('eventOutComes'); 
const workJobBtn = document.getElementById('workJobBtn'); 
const returnHomeBtn = document.getElementById('returnHomeBtn');

window.addEventListener("DOMContentLoaded", async function() {
    house = await window.api.invoke('request:currentHouse');

    document.getElementById('title').innerHTML = house.streetNumber + " " + house.street

    searchArounBtn.addEventListener('click', function(){
        searchAround(); 
    });

    workJobBtn.addEventListener('click', function(){
        workJob();
    });

    returnHomeBtn.addEventListener('click', function(){
        returnHome();
    });
});


function returnHome(){
    ipcRenderer.send('changeScreen:home', {moneyEarnt, jobComplete});
}


async function workJob(){
    if(jobComplete == false){
        jobComplete = true; 
        console.log(house.lawn.job.pay)
        moneyEarnt = house.lawn.job.pay; 
        let newList = document.createElement('li');
        let text = "You finished Mowing the Lawn, You earnt $" + moneyEarnt;
        newList.style.color = 'blue';
        if(house.status == 'Unknown'){
            text = "The grass wept. You earnt $" + moneyEarnt; 
            newList.style.color = 'purple';
        }
        newList.innerHTML = text;
        eventOutComesLt.insertBefore(newList, eventOutComesLt.firstChild);
        document.getElementById('workJobBtn').remove()
        let currentMoney = await store.get('currentMoney');
        let acceptedJobs = await store.get('acceptedJobs');
        console.log(acceptedJobs);
        let objIndex = acceptedJobs.findIndex((obj => obj.nameCombo == house.nameCombo))
        acceptedJobs.splice(objIndex, 1);
        await store.set('acceptedJobs', acceptedJobs); 
        await store.set('currentMoney', currentMoney + moneyEarnt);
    }

}


function searchAround(){
    let outcome = getRandomNumber(100); 
    let newList = document.createElement('li');
    if(outcome >= 89 && outcome <= 98){
        newList.innerHTML = "You found $10";
        newList.style.color = "green";
    } else if((outcome >= 50 && outcome <=60)  && house.status == "Unknown") {
        newList.innerHTML = "Unspeakable Horrors Torment Your Mind";
        newList.style.color = "red";
    } else {
        newList.innerHTML = "You did not find anything.";
    }

    eventOutComesLt.insertBefore(newList, eventOutComesLt.firstChild);
}



function getRandomNumber(range){
    return Math.floor(Math.random() * range); 
}