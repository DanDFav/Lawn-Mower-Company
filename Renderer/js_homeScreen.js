const sleep = document.getElementById('goToSleep');
const moneyDisplay = document.getElementById('currentMoney');
const dayDisplay = document.getElementById('currentDay');
const suburbDisplay = document.getElementById('tavelDivHeader') 
const suburbOneShops = document.getElementById('suburbOneShops');
const clearStorage = document.getElementById('clearStorage');

const store = window.api.store;


let saveData; 

let player; 

let suburbData = []; 

let streetBucket = []; 

let citizenData = []; 
let readyLawns =  [];
let maxCitizens = 25;
let currentUnknowable = 5;

let acceptedJobs = [];
let maxAcceptedJobs = 4;

let names; 

let currentMoney; 
let currentDay;  

let lawnsGrownPerDay = 3; 
let maxGrowthStage = 8;
let week = 7;  

class citizen {
    constructor(name, lastName, defaultStage, nameCombo, suburb, street, streetNumber, status) {
        this.name = name;
        this.lastName = lastName; 
        this.lawn = new lawn(defaultStage, getRandomNumber(250) + 50); 
        this.nameCombo = nameCombo
        this.suburb = suburb; 
        this.street = street; 
        this.streetNumber = streetNumber;
        this.status = status;
    }
}

class lawn {
    constructor(growthStage, lawnSize) {
        this.growthStage = growthStage;
        this.startDate = -1; 
        this.needsMowing = false;
        this.lawnSize = lawnSize; 
        this.job = undefined; 
    }
}

class job {
    constructor(pay, time){
        this.pay = pay; 
        this.time = time; 
    }
}

class playerClass {
    constructor(){
        this.mower = new pushCylinder(); 
    }
}

class mowers {
    price; 
    power; 
    cutQuality; 
    speed; 
};

class pushCylinder extends mowers {
    price = 60; 
    power = 10; 
    cutQuality = 10; 
    speed = 3; 
}

//ryobi dirt cheap 
window.addEventListener("DOMContentLoaded", async function(){
    await readSaveData()
    moneyDisplay.innerHTML = "Money: $" + currentMoney;
    dayDisplay.innerHTML = "Day: " + parseInt(currentDay);
    sleep.addEventListener("click", async function(){ sleepFunc() });
    suburbOneShops.addEventListener("click", async function(){ shopWindow() });
    clearStorage.addEventListener("click", async function(){ ipcRenderer.send('store:clear') });



    growLawns();
}); 


function shopWindow(){
    ipcRenderer.send('createWindow:shop', currentMoney);
}


async function save(){
    store.set('currentMoney', currentMoney);
    store.set('currentDay', currentDay);
    store.set('suburbData', suburbData);
    store.set('citizenData', citizenData);
    store.set('readyLawns', readyLawns);
    store.set('acceptedJobs', acceptedJobs);
    store.set('player', player);
}


function sleepFunc(){
    
    currentDay += 1; 
    moneyDisplay.innerHTML = "Money: $" + parseInt(currentMoney);
    dayDisplay.innerHTML = "Day: " + parseInt(currentDay);

    if(currentDay == 2){
        dayOnePrep(currentDay); 
    } else if(currentDay == 4){
        dayOnePrep(currentDay); 
    }

    growLawns();
    hasLawnExpired();
    listDisplay('availableJobs', 'sleep', "Job", readyLawns);
}


function hasLawnExpired(){
    for(let i = 0; i < readyLawns.length; i++) {
        let citizensLawn = readyLawns[i].lawn;

        if(parseInt(currentDay) == parseInt(citizensLawn.endDate)){
            document.getElementById(readyLawns[i].nameCombo + "Job").style.color = "rgb(209, 7, 7)"; 
        }

        if(parseInt(currentDay) > parseInt(citizensLawn.endDate)){
            lawnHasBeenMowed(citizensLawn, i)
            hasLawnExpired(); 
            break; 
        }
    }
}


function acceptJob(item, index) {
    acceptedJobs.push(item); 
    elementRemoval(document.getElementById(readyLawns[index].nameCombo + "Job"));
    readyLawns.splice(index, 1);
    listDisplay("acceptedJobs", "acceptJob", "Job", acceptedJobs);
    listDisplay("travelList", "travel", "Travel", acceptedJobs);
}


function lawnHasBeenMowed(citizensLawn, index){
    citizensLawn.endDate = -1; 
    citizensLawn.startDate = -1; 
    citizensLawn.growthStage = 0; 
    citizensLawn.needsMowing = false;

    elementRemoval(document.getElementById(readyLawns[index].nameCombo + "Job")); 
    elementRemoval(document.getElementById(readyLawns[index].nameCombo + "Travel"));


    let objIndex = acceptedJobs.findIndex((obj => obj.nameCombo == readyLawns[index].nameCombo));
    if(objIndex != -1){
        acceptedJobs.splice(objIndex, 1);
    }
    readyLawns.splice(index, 1); 
}


function growLawns(){ 
    let noDuplicates = [];
    for(let i = 0; i < lawnsGrownPerDay; i++){
        let newNumber = false; 
        let randomNumber;
        while(newNumber == false){
            randomNumber = getRandomNumber(citizenData.length);
            if(!noDuplicates.includes(randomNumber)){
                newNumber = true;
            }
        }

        noDuplicates.push(randomNumber);
        let citizensLawn = citizenData[randomNumber].lawn;
        citizensLawn.growthStage = parseInt(citizensLawn.growthStage) + parseInt(1); 
        if(citizensLawn.growthStage >= maxGrowthStage && citizensLawn.needsMowing == false){
            updateLawn(citizensLawn, randomNumber);
        }
    }
}


function updateLawn(citizensLawn, index){
    citizensLawn.needsMowing = true; 
    citizensLawn.startDate = currentDay;
    citizensLawn.endDate = currentDay + getRandomNumber(week) + week - 1;
    citizensLawn.job = new job(Math.floor((citizensLawn.lawnSize / 5) + 140), 1);
    readyLawns.push(citizenData[index])
}


function displaySuburb(index){
    suburbDisplay.innerHTML = "Travel: " + suburbData[index].suburb; 
}


function dayOnePrep(index){
    console.log(citizenData[index])
    let citizensLawn = citizenData[index].lawn;
    updateLawn(citizensLawn, index)
}


function generateCitizens(){
    let nameArray = []; 
    for(let i = 0; i < maxCitizens - currentUnknowable; i++){
        let newName = false;
        let nameCombo;
        let name; 
        let lastName; 
        while(newName == false){
            name = getRandomName();
            lastName = getRandomName();
            nameCombo = name + lastName; 
            if(!nameArray.includes(nameCombo)){
                newName = true;
            } 
        }
        nameArray.push(nameCombo);

        let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Normal");
        citizenData.push(person)
    }
}


function generateTheUnknown(){
    for(let i = 0; i < currentUnknowable; i++){
        if(i == 0){
            let name = "Pete"
            let lastName = "The Unforgiven"
            let nameCombo = name + lastName
            let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Unknown");
            citizenData.push(person)
        } else if(i == 1){
            let name = "Horrace"
            let lastName = "The EverLasting"
            let nameCombo = name + lastName
            let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Unknown");
            citizenData.push(person)
        } else if(i == 2){
            let name = "Grace"
            let lastName = "The Tainted"
            let nameCombo = name + lastName
            let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Unknown");
            citizenData.push(person)
        } else if(i == 3){
            let name = "Emily"
            let lastName = "The Forgotten"
            let nameCombo = name + lastName
            let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Unknown");
            citizenData.push(person)
        } else if(i == 4){
            let name = "Roger"
            let lastName = "Of the Eternal Light"
            let nameCombo = name + lastName
            let person = new citizen(name, lastName, getRandomNumber(5), nameCombo, "Trimbor", generateCitizensStreet(), getRandomNumber(100), "Unknown");
            citizenData.push(person)
        }

    }
}


function generateCitizensStreet(){
    let street = streetBucket[0];
    streetBucket.shift(); 
    return street; 
}

function fillStreetBucket(){
    let peoplePerStreet = suburbData[0].populationStart / suburbData[0].streetStart;
    for(let i = 0; i < parseInt(suburbData[0].streetStart); i++){
        for(let j = 0; j < parseInt(peoplePerStreet); j++){
            streetBucket.push(suburbData[0].streetNames[i]);
        }
    }

    shuffle(streetBucket);
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


async function listDisplay(listID, caller, check, array){
    let foo = await store.get('foo');
    console.log(foo);
    let ID = listID; 
    let callerID = caller; 
    let text; 

    for(let i = 0; i < array.length; i++){
        if(document.getElementById(array[i].nameCombo + check) == null){
            let newList = document.getElementById(ID);
            let li = document.createElement("li");

            if(callerID == "sleep" || callerID == "acceptJob"){
                let nameDisplay = array[i].name
                if(array[i].status == "Unknown"){
                    nameDisplay = nameDisplay + " " + array[i].lastName;
                }
                text = nameDisplay + ': Complete By the: ' + array[i].lawn.endDate + 'th ' + ' || Pay: $' + array[i].lawn.job.pay;
            } else if(callerID == "travel"){
                text = array[i].name + ": " + array[i].streetNumber + " " + array[i].street
            }

            li.innerText = text; 
            li.id = array[i].nameCombo + check;

            if(parseInt(currentDay) == parseInt(array[i].lawn.endDate) && check != "Travel"){
                li.style.color = "rgb(209, 7, 7)";
            }



            if(callerID == "sleep" || callerID == "acceptJob"){
                li.onclick = function(){
                    let identifier = this.id;
                    let objIndex = array.findIndex((obj => obj.nameCombo + "Job" == identifier))
                    
                    if(acceptedJobs.length < maxAcceptedJobs){ 
                        acceptJob(array[objIndex], objIndex) 
                    } 
                }
            } else if(callerID == "travel") {
                li.onclick = async function(){
                    let identifier = this.id;
                    let objIndex = array.findIndex((obj => obj.nameCombo + "Travel" == identifier))
                    await save();
                    ipcRenderer.send('changeScreen:citizenHouse', array[objIndex])
                }
            }
            newList.appendChild(li);
        }
    }
}


function elementRemoval(element){
    if(element != null){ element.remove(); }
}


function getRandomNumber(range){
    return Math.floor(Math.random() * range); 
}


function getRandomName(){
    let randomName; 
    let length = names.length
    let randomNumber = getRandomNumber(length); 
    randomName = names[randomNumber] 
    return randomName;
}


function uploadCitizenData(upload){
    ipcRenderer.send('upload:citizenData', upload);
}



async function firstTimeLoad(){
    suburbData = await window.api.invoke('request:suburbData')
    await window.api.invoke('request:namesDB').then(function(data){
        names = data.names
    })
    await window.api.invoke('request:citizenFile').then(async function(data){
        if(data.length <= 0){
            console.log('Entered data leng 0')
            player = new playerClass(); 
            fillStreetBucket(); 
            generateCitizens(); 
            generateTheUnknown();
            currentDay = 0;
            currentMoney = 100; 
        } 
    }); 
    await save();
    dayOnePrep(currentDay); 
    displaySuburb(0);
   
}


async function readSaveData(){
    if(await store.get('suburbData') == undefined){
        console.log('First TIme Load')
        await firstTimeLoad();
    } else {
        await loadSaveData();
    }
}


//{"firstTimeLoad":{"Value":true},"suburbData":{},"streetBucket":{},"citizenData":{}, "readyLawns":[],"acceptedJobs":[],"currentMoney":{"Value":100},"currentDay":{"Value":0}}

async function loadSaveData(){
    player = await store.get('player')
    currentDay = await store.get('currentDay')
    currentMoney = await store.get('currentMoney')
    suburbData = await store.get('suburbData')
    citizenData = await store.get('citizenData')
    acceptedJobs = await store.get('acceptedJobs')
    readyLawns = await store.get('readyLawns')


    listDisplay("acceptedJobs", "acceptJob", "Job", acceptedJobs);
    listDisplay('availableJobs', 'sleep', "Job", readyLawns);
    listDisplay("travelList", "travel", "Travel", acceptedJobs);
}


ipcRenderer.on('update:allVariables', async (_, data) => {

    await loadSaveData(); 
})



