const fs = require('fs')
const {ipcRenderer} = require('electron')

let musicMenu, selectedMusic, musicContextMenu,musicPlayer,musicSource;
let menuInfo = JSON.parse(fs.readFileSync('datas/menuInfo.json'));

window.onload = function () {
    musicMenu = document.getElementById('music-menu')
    musicContextMenu = document.getElementById('music-context-menu')
    // musicPlayer = document.getElementById('music-player')
    // musicSource = document.getElementById('music-source')
    // musicSource.src = menuInfo[0].path
    document.addEventListener('click', e => musicContextMenu.style.display = 'none')
}

ipcRenderer.on('selected-music-files', (event, p) => {
    add:
    for (let i in p) {
        for(let j in menuInfo){
            if(menuInfo[j].path === p[i]){
                continue add;
            }
        }
        menuInfo.push({
            path: p[i],
            name: p[i].substring(p[i].lastIndexOf('\\') + 1, p[i].lastIndexOf('.'))
        })
    }
    updateMenu()
    fs.writeFile('datas/menuInfo.json', JSON.stringify(menuInfo),()=>{})
})

ipcRenderer.on('selected-BG-file',(event,p)=>{
    let content = fs.readFileSync(p[0])
    fs.writeFileSync(`datas/background_m.jpg`,content)
    if(img!==undefined)
        img = loadImage("../datas/background_m.jpg");
})

ipcRenderer.on('close', (event, p) => {
    // fs.writeFileSync('datas/menuInfo.json', JSON.stringify(menuInfo))
})

ipcRenderer.on('open-close-list',()=>{
    if(musicMenu.style.display === 'block'){
        musicMenu.style.display = 'none'
    }else{
        musicMenu.style.display = 'block'
    }
})

let updateMenu = function () {
    while (musicMenu.children.length > 0)
        musicMenu.removeChild(musicMenu.children[0])
    for (let i in menuInfo) {
        let li = document.createElement('li')
        li.setAttribute('path', menuInfo[i].path);
        li.setAttribute('name', menuInfo[i].name);
        li.addEventListener('contextmenu', function (e) {
            selectedMusic = this;
            e.preventDefault()
            musicContextMenu.style.display = 'block'
            musicContextMenu.style.top = `${e.clientY}px`
            musicContextMenu.style.left = `${e.clientX}px`
            console.log(`${e.clientY}px`)
        })
        li.textContent = menuInfo[i].name
        li.onclick = function () {
            soundFilePath = this.attributes['path'].value
            isLoading = true
            soundFile.stop()
            soundFile = loadSound(soundFilePath)
        }
        musicMenu.appendChild(li);
    }

}

function removeMusic() {
    musicMenu.removeChild(selectedMusic);
    for (let i in menuInfo) {
        if (menuInfo[i].path === selectedMusic.attributes['path'].value) {
            menuInfo.splice(i, 1)
            fs.writeFile('datas/menuInfo.json', JSON.stringify(menuInfo),()=>{})
            return
        }
    }
}

function setTop(){
    for(let i in menuInfo){
        if(menuInfo[i].path === selectedMusic.attributes['path'].value){
            let t = menuInfo[i]
            menuInfo.splice(i,1)
            menuInfo.splice(0,0,t)
            updateMenu()
            fs.writeFile('datas/menuInfo.json', JSON.stringify(menuInfo),()=>{})
        }
    }
}

// function player() {
//     console.log(this)
// }