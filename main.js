const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextBridge: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true, // Hides the menu bar for a standalone feel
    titleBarStyle: 'default',
  });

  // Determine the URL to load
  // If in development or if a local backend is needed
  const isDev = process.env.NODE_ENV === 'development';
  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000'; // Default to localhost

  if (isDev) {
    mainWindow.loadURL(url);
    // Open DevTools in dev mode if needed
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, we assume the backend is either remote or started locally
    mainWindow.loadURL(url).catch(() => {
      console.log("Failed to load URL, retrying...");
      // Show a temporary loading page or retry
      setTimeout(() => mainWindow.loadURL(url), 2000);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to start the local backend (Next.js server)
function startBackend() {
  console.log("Starting backend...");
  
  // Use npm start to run the production server
  // Make sure the app is built before running this
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  serverProcess = spawn(command, ['run', 'web:start'], {
    cwd: __dirname,
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  // Wait for the server to be ready before creating the window
  const opts = {
    resources: ['http://localhost:3000'],
    timeout: 30000, // 30 seconds
  };

  waitOn(opts).then(() => {
    createWindow();
  }).catch((err) => {
    console.error("Backend failed to start in time", err);
    app.quit();
  });
}

app.on('ready', () => {
  // If we're not in dev mode, we start the backend automatically
  if (process.env.NODE_ENV !== 'development-external') {
    startBackend();
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Ensure backend is killed on quit
app.on('will-quit', () => {
  if (serverProcess) serverProcess.kill();
});
