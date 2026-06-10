#!/usr/bin/env node

const { execSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const colors = {
  green: '\x1b[92m',
  aqua: '\x1b[96m',
  yellow: '\x1b[93m',
  red: '\x1b[91m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.clear();
console.log(`${colors.aqua}======================================================================${colors.reset}`);
console.log(`${colors.aqua}${colors.bold}             PAGE National - Fullstack Dev Server Launcher            ${colors.reset}`);
console.log(`${colors.aqua}======================================================================${colors.reset}\n`);

console.log(`${colors.aqua}[1/3] Checking System Requirements...${colors.reset}`);

// Check Node
try {
  const nodeVer = execSync('node -v').toString().trim();
  console.log(`${colors.green} ✔ Node.js is installed (${nodeVer})${colors.reset}`);
} catch (e) {
  console.log(`${colors.red}[ERROR] Node.js is not installed or not in your PATH.${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.aqua}[2/3] Verifying NestJS Backend...${colors.reset}`);

const backendDir = path.join(__dirname, 'backend-nest');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow} ⚠ backend-nest/.env not found. Copying .env.example...${colors.reset}`);
    fs.copyFileSync(envExamplePath, envPath);
    console.log(`${colors.green} ✔ Created backend-nest/.env successfully.${colors.reset}`);
  } else {
    console.log(`${colors.red} [ERROR] backend-nest/.env and .env.example are missing.${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`${colors.green} ✔ backend-nest/.env exists.${colors.reset}`);
}

const nodeModulesDir = path.join(backendDir, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log(`${colors.yellow} ⚠ backend-nest/node_modules is missing. Installing npm dependencies...${colors.reset}`);
  try {
    execSync(process.platform === 'win32' ? 'npm.cmd install' : 'npm install', { cwd: backendDir, stdio: 'inherit' });
    console.log(`${colors.green} ✔ NestJS dependencies installed.${colors.reset}`);
  } catch (e) {
    console.log(`${colors.red} [ERROR] npm install in backend-nest failed.${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`${colors.green} ✔ NestJS dependencies already installed.${colors.reset}`);
}

console.log(`\n${colors.aqua}[3/3] Verifying Next.js Frontend...${colors.reset}`);

const frontendDir = path.join(__dirname, 'frontend');
const frontendNodeModulesDir = path.join(frontendDir, 'node_modules');

if (!fs.existsSync(frontendNodeModulesDir)) {
  console.log(`${colors.yellow} ⚠ frontend/node_modules is missing. Installing npm dependencies...${colors.reset}`);
  try {
    execSync(process.platform === 'win32' ? 'npm.cmd install' : 'npm install', { cwd: frontendDir, stdio: 'inherit' });
    console.log(`${colors.green} ✔ Frontend dependencies installed.${colors.reset}`);
  } catch (e) {
    console.log(`${colors.red} [ERROR] npm install in frontend failed.${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`${colors.green} ✔ Frontend dependencies already installed.${colors.reset}`);
}

console.log(`\n${colors.aqua}Launching Servers in this terminal...${colors.reset}`);

// Spawning both processes inline in the current terminal window
const backendProcess = spawn(process.platform === 'win32' ? 'npm.cmd run start:dev' : 'npm run start:dev', {
  cwd: backendDir,
  shell: true
});

const frontendProcess = spawn(process.platform === 'win32' ? 'npm.cmd run dev' : 'npm run dev', {
  cwd: frontendDir,
  shell: true
});

console.log(`${colors.aqua}======================================================================${colors.reset}`);
console.log(`${colors.green}${colors.bold}            PAGE National is booting up!${colors.reset}`);
console.log(`${colors.aqua}======================================================================${colors.reset}`);
console.log(`  - NestJS Backend (API):   ${colors.bold}${colors.aqua}http://localhost:8000${colors.reset}`);
console.log(`  - Next.js Frontend UI:    ${colors.bold}${colors.aqua}http://localhost:3000${colors.reset}`);
console.log(`${colors.aqua}======================================================================${colors.reset}`);
console.log(`${colors.yellow}Press Ctrl+C to stop both servers.${colors.reset}\n`);

// Helper to pipe and prefix stream outputs
const handleStream = (prefix, color, stream) => {
  let buffer = '';
  stream.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    lines.forEach(line => {
      const cleanLine = line.replace(/\r$/, '');
      if (cleanLine.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${cleanLine}`);
      }
    });
  });
};

handleStream('Backend', colors.yellow, backendProcess.stdout);
handleStream('Backend Error', colors.red, backendProcess.stderr);
handleStream('Frontend', colors.green, frontendProcess.stdout);
handleStream('Frontend Error', colors.red, frontendProcess.stderr);

// Safe kill helper using taskkill on Windows to ensure child tree termination
const killProcess = (proc) => {
  if (proc && proc.pid) {
    try {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', proc.pid, '/f', '/t'], { stdio: 'ignore' });
      } else {
        proc.kill();
      }
    } catch (e) {
      // Process might already be dead
    }
  }
};

let isShuttingDown = false;
const shutdown = (code) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${colors.yellow}Shutting down dev servers...${colors.reset}`);
  
  killProcess(backendProcess);
  killProcess(frontendProcess);
  
  process.exit(code || 0);
};

backendProcess.on('close', (code) => {
  if (!isShuttingDown) {
    console.log(`\n${colors.red}[Backend] Process exited with code ${code}${colors.reset}`);
    shutdown(code);
  }
});

frontendProcess.on('close', (code) => {
  if (!isShuttingDown) {
    console.log(`\n${colors.red}[Frontend] Process exited with code ${code}${colors.reset}`);
    shutdown(code);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => {
  killProcess(backendProcess);
  killProcess(frontendProcess);
});
