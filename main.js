const {app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path');
const fs = require('fs');
const Store = require('electron-store')
const { dialog } = require('electron')

const testPath = path.join(__dirname, '/Renderer/html_homeScreen.html')
const shopScreenPath = path.join(__dirname, '/Renderer/html_shopScreen.html');
const housePath = path.join(__dirname, '/Renderer/html_house.html');

const citizenJsonPath = path.join(__dirname, '/Renderer/json_citizenInfo.json')
const namesDBPath = path.join(__dirname, '/Renderer/json_nameDB.json')
const suburbDataPath = path.join(__dirname, '/Renderer/json_suburbs.json');



const store = new Store(); 

let win; 
let winShop

let currentHouse; 

// modify your existing createWindow() function
const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true, 
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile(testPath)
}


const createShopWindow = () => {
  winShop = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false, 
    webPreferences: {
      contextIsolation: true, 
      nodeIntegration: true, 
      preload: path.join(__dirname, 'preload.js')
    }
  })

  winShop.loadFile(shopScreenPath)
  winShop.setMenu(null)
}

app.whenReady().then(() => {
  createWindow()
  citizenFileCheck()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  win = null; 
  if (process.platform !== 'darwin') app.quit()
})


function citizenFileCheck(){
  let checkFileSize =  fs.readFileSync(citizenJsonPath) 
  if(checkFileSize.length == 0){
    fs.writeFileSync(citizenJsonPath, '[]')
  } 
}


function readFileAndParse(filename){
  const file =  fs.readFileSync(filename) 
  let parsed = JSON.parse(file) 
  return parsed; 
}


function updateCitizenFile(){
  const citizenFile =  readFileAndParse(citizenJsonPath)
  return citizenFile; 
}

function updateNamesDBFile(){
  const namesDBFile =  readFileAndParse(namesDBPath)
  return namesDBFile; 
}

function uploadFile(file, filePath){
  fs.writeFileSync(filePath, file); 
}


function getSaveData(){
  const saveData = readFileAndParse(saveDataPath); 
  return saveData; 
}


ipcMain.on('closeWindow:shop', () =>{
  winShop.close();
  winShop = null;
});


ipcMain.on('createWindow:shop', (_, money) => {
  createShopWindow();
});


ipcMain.on('update:saveData', (_, data)=>{
  let uploadData = JSON.stringify(data)
  uploadFile(uploadData, saveDataPath);
});

ipcMain.on('changeScreen:home', async (_, data)=>{
  await win.loadFile(testPath);
  let money = data.moneyEarnt; 
  let jobComplete = data.jobComplete;
  win.webContents.send('update:allVariables', {money, currentHouse, jobComplete});
});

ipcMain.on('changeScreen:citizenHouse', (_, citizen)=>{
  win.loadFile(housePath);
  currentHouse = citizen; 
});

ipcMain.on('upload:citizenData', (_, data)=>{
  let uploadData = JSON.stringify(data);
  uploadFile(uploadData, citizenJsonPath)
});

ipcMain.on('store:set', async (_, key, value) => {
  store.set(key, value);
  console.log(store)
});


ipcMain.on('store:clear', (_) =>{
  store.clear();
  win.reload()
});


ipcMain.handle('store:get', async (_, key) => {
  return store.get(key);
});



ipcMain.handle('request:currentHouse', ()=>{
  return currentHouse; 
});

ipcMain.handle('request:suburbData', () => {
  return readFileAndParse(suburbDataPath); 
});

ipcMain.handle('request:citizenFile', ()=> {
  return updateCitizenFile(); 
}); 

ipcMain.handle('request:namesDB', ()=> {
  return updateNamesDBFile(); 
}); 