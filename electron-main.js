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
  
  // Handle command line args for testing
  // Electron args often include the app path, so we check process.argv
  const isTest = process.argv.includes('--test');
  const targetUrl = isTest ? 'http://localhost:5173/test.html' : 'http://localhost:5173';

  // For simplicity, if we are in test mode and the dev server isn't likely running
  // (unless the user started it), we should prefer loading the file directly
  // to avoid "ERR_CONNECTION_REFUSED".
  
  // Also check if we are in production build (packaged app)
  if (app.isPackaged) {
    win.loadFile('dist-game/index.html');
  } else if (isTest) {
      win.loadFile('test.html');
  } else {
      win.loadURL(targetUrl).catch(() => {
          win.loadFile('index.html');
      });
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
