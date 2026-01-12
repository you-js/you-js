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

  // Check if we are in development mode (Vite typically runs on port 5173)
  // We can try to connect to the local server, or fallback to file.
  // For simplicity in this 'npm run dev' setup, we'll assume the user
  // runs 'npm run electron' separately OR we can configure concurrent running later.
  // For now, let's load the file directly for 'electron .' or localhost if dev.
  
  // A simple strategy: In dev, we often want to load the URL.
  // But to keep it simple as "just run", let's try to load the dev server URL.
  // If not reachable, load index.html.
  // However, without a concurrent runner, 'npm run dev' just starts vite.
  // 'npm run electron' starts this.
  
  // Let's assume the user will run `npm run dev` in one terminal (providing localhost:5173)
  // and `npm run electron` in another for desktop testing, 
  // OR we can make a script that does both.
  
  // For this initial setup, let's target the Vite default port.
  win.loadURL('http://localhost:5173').catch(() => {
      // Fallback if server is not running (e.g. just double clicked electron)
      win.loadFile('index.html');
  });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
