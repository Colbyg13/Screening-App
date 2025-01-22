const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron');
const remoteMain = require('@electron/remote/main');
const isDev = process.env.NODE_ENV !== 'production';

const Store = require('electron-store');
const store = new Store();
const { LOG_LEVEL, writeLog, setup } = require('./server/utils/logger');

// setup logger
setup()

let sleepBlockerId = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

remoteMain.initialize();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        icon: './icons/icon.png',
        show: false,
        titleBarStyle: 'hidden',
        titleBarOverlay: true,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: true,
        },
    });

    mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.show();

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    remoteMain.enable(mainWindow.webContents);

    // don't allow computer to sleep
    const preventSleep = store.get('preventSleep', true);
    if (preventSleep) {
        sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    }

    // Open the DevTools.
    if (isDev) mainWindow.webContents.openDevTools();

    // Catch unhandled exceptions in the main process
    process.on('uncaughtException', error => {
        console.error('Unhandled Exception:', error);
        writeLog(LOG_LEVEL.ERROR, `Uncaught exeption: ${error.stack}`);
    });
    
    // Catch unhandled promise rejections in the main process
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection:', reason);
        writeLog(LOG_LEVEL.ERROR, `Uncaught rejection: ${reason}`);
    });
});

// Reload the app when called from context bridge
ipcMain.on('reload-app', () => {
    app.exit();
});

ipcMain.handle('get-path', async (event, arg) => {
    const preventSleep = app.getPath('appData');
    return preventSleep;
});

ipcMain.handle('get-prevent-sleep', event => {
    return store.get('preventSleep', true);
});

ipcMain.on('set-prevent-sleep', (event, preventSleep) => {
    store.set('preventSleep', preventSleep);

    if (preventSleep) {
        sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    } else {
        powerSaveBlocker.stop(sleepBlockerId);
    }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    // Disable sleep blocker before quitting
    if (sleepBlockerId !== null) {
        powerSaveBlocker.stop(sleepBlockerId);
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
