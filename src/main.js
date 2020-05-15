const {app, BrowserWindow, ipcMain, dialog, Menu, MenuItem} = require('electron')
const path = require('path')

let mainWindow;

let chooseFile = function (event, p) {
    dialog.showOpenDialog(p).then(res => {
        if (res) {// 如果有选中
            // 发送选择的对象给子进程
            mainWindow.webContents.send(p.back, res.filePaths)
        }
    })
}

function create() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile(path.join(__dirname, 'index.html'))

    mainWindow.on('close', () =>
        mainWindow.webContents.send('close'))

    mainWindow.on('closed', () =>
        mainWindow = null)

    let myMenu = Menu.buildFromTemplate([{
        role: 'File',
        label: '文件',
        submenu: [{
            label: '打开音乐文件',
            click: function () {
                chooseFile(null, {
                    title: '选择音乐文件',
                    defaultPath: '.',
                    filters: [{
                        name: 'music',
                        extensions: ['mp3']
                    }],
                    back: 'selected-music-files'
                })
            }
        }, {
            label: '选择背景图片',
            click: function () {
                chooseFile(null, {
                    title: '选择背景图片',
                    defaultPath: '.',
                    filters: [{
                        name: 'image',
                        extensions: ['jpg', 'png']
                    }],
                    back: 'selected-BG-file'
                })
            }
        }]
    }, {
        label:'页面',
        role: 'view',
        submenu: [{
            label:'打开/收起播放列表',
            click:function () {
                mainWindow.webContents.send('open-close-list')
            }
        },{
            label:'打开开发者工具',
            click:function () {
                mainWindow.webContents.openDevTools()
            }
        }]
    }])

    Menu.setApplicationMenu(myMenu)

    ipcMain.on('choose-file-dialog', chooseFile);
}

app.whenReady().then(create)

app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})