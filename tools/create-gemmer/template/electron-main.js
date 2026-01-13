import { app, BrowserWindow } from 'electron';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load app:
  // 1. Production: Load packaged 'dist/index.html' (Vite's default output)
  // 2. Development: Connect to Vite server or load local index.html
  if (app.isPackaged) {
    win.loadFile('dist/index.html');
  } else {
    // Try to connect to localhost:5173 (standard Vite port)
    // Or you can check process.env.VITE_DEV_SERVER_URL if using a concurrent runner
    win.loadURL('http://localhost:5173').catch(() => {
        win.loadFile('index.html');
    });
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
