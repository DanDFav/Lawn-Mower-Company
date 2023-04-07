const closeWindow = document.getElementById('close')


window.addEventListener('DOMContentLoaded', () => {
    closeWindow.addEventListener('click', () =>{
        ipcRenderer.send('closeWindow:shop')
    });
});