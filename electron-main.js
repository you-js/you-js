import { app, BrowserWindow } from 'electron';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load app:
    // 1. Production: Load packaged 'dist-game/index.html'
    // 2. Development: Try connecting to Vite server (localhost:5173), fallback to local 'index.html'
    if (app.isPackaged) {
        win.loadFile('dist-game/index.html');
    } else {
        win.loadURL('http://localhost:5173').catch(() => {
            win.loadFile('index.html');
        });
    }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
