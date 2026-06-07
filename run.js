#!/usr/bin/env node

const { execSync, exec } = require('child_process');
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

console.log(`${colors.aqua}[1/4] Checking System Requirements...${colors.reset}`);

// Check Node
try {
  const nodeVer = execSync('node -v').toString().trim();
  console.log(`${colors.green} ✔ Node.js is installed (${nodeVer})${colors.reset}`);
} catch (e) {
  console.log(`${colors.red}[ERROR] Node.js is not installed or not in your PATH.${colors.reset}`);
  process.exit(1);
}

// Check PHP
try {
  const phpVer = execSync('php -v').toString().split('\n')[0].trim();
  console.log(`${colors.green} ✔ PHP is installed (${phpVer})${colors.reset}`);
} catch (e) {
  console.log(`${colors.red}[ERROR] PHP is not installed or not in your PATH.${colors.reset}`);
  process.exit(1);
}

// Check Composer
let hasComposer = false;
try {
  execSync('composer -V', { stdio: 'ignore' });
  console.log(`${colors.green} ✔ Composer is installed${colors.reset}`);
  hasComposer = true;
} catch (e) {
  console.log(`${colors.yellow} ⚠ Composer is not found in your PATH.${colors.reset}`);
}

console.log(`\n${colors.aqua}[2/4] Verifying Laravel Backend...${colors.reset}`);

const backendDir = path.join(__dirname, 'backend');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow} ⚠ backend/.env not found. Copying .env.example...${colors.reset}`);
    fs.copyFileSync(envExamplePath, envPath);
    console.log(`${colors.green} ✔ Created backend/.env successfully.${colors.reset}`);
    console.log(`${colors.yellow}   Generating Laravel application key...${colors.reset}`);
    try {
      execSync('php artisan key:generate', { cwd: backendDir, stdio: 'inherit' });
    } catch (e) {
      console.log(`${colors.red} [ERROR] Failed to generate key.${colors.reset}`);
    }
  } else {
    console.log(`${colors.red} [ERROR] backend/.env.example not found.${colors.reset}`);
  }
} else {
  console.log(`${colors.green} ✔ backend/.env exists.${colors.reset}`);
}

const vendorDir = path.join(backendDir, 'vendor');
if (!fs.existsSync(vendorDir)) {
  if (hasComposer) {
    console.log(`${colors.yellow} ⚠ backend/vendor is missing. Installing Composer dependencies...${colors.reset}`);
    try {
      execSync('composer install', { cwd: backendDir, stdio: 'inherit' });
      console.log(`${colors.green} ✔ Composer dependencies installed.${colors.reset}`);
    } catch (e) {
      console.log(`${colors.red} [ERROR] Composer install failed.${colors.reset}`);
    }
  } else {
    console.log(`${colors.red} [ERROR] Cannot install backend dependencies: Composer is not in PATH.${colors.reset}`);
  }
} else {
  console.log(`${colors.green} ✔ Backend dependencies already installed.${colors.reset}`);
}

console.log(`\n${colors.aqua}[3/4] Verifying Next.js Frontend...${colors.reset}`);

const frontendDir = path.join(__dirname, 'frontend');
const nodeModulesDir = path.join(frontendDir, 'node_modules');

if (!fs.existsSync(nodeModulesDir)) {
  console.log(`${colors.yellow} ⚠ frontend/node_modules is missing. Installing npm dependencies...${colors.reset}`);
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    console.log(`${colors.green} ✔ npm dependencies installed.${colors.reset}`);
  } catch (e) {
    console.log(`${colors.red} [ERROR] npm install failed.${colors.reset}`);
  }
} else {
  console.log(`${colors.green} ✔ Frontend dependencies already installed.${colors.reset}`);
}

console.log(`\n${colors.aqua}[4/4] Launching Servers...${colors.reset}`);

// Spawning on Windows in separate windows/tabs
let useWt = false;
try {
  // Check if wt (Windows Terminal) is available in the environment
  execSync('where wt', { stdio: 'ignore' });
  useWt = true;
} catch (e) {
  // Windows Terminal not available, will fall back
}

if (useWt) {
  console.log(`${colors.green}  🚀 Starting Laravel Backend (PHP Artisan Serve) in a new tab...${colors.reset}`);
  exec(`wt -w 0 new-tab -d "${backendDir}" --title "PAGE Backend" powershell -NoExit -Command "php artisan serve"`);

  console.log(`${colors.green}  🚀 Starting Next.js Frontend (NPM Run Dev) in a new tab...${colors.reset}`);
  exec(`wt -w 0 new-tab -d "${frontendDir}" --title "PAGE Frontend" powershell -NoExit -Command "npm run dev"`);
} else {
  console.log(`${colors.green}  🚀 Starting Laravel Backend (PHP Artisan Serve)...${colors.reset}`);
  exec(`start cmd /k "title PAGE Backend && cd /d ${backendDir} && php artisan serve"`);

  console.log(`${colors.green}  🚀 Starting Next.js Frontend (NPM Run Dev)...${colors.reset}`);
  exec(`start cmd /k "title PAGE Frontend && cd /d ${frontendDir} && npm run dev"`);
}

console.log(`\n${colors.aqua}======================================================================${colors.reset}`);
console.log(`${colors.green}${colors.bold}            PAGE National is booting up!${colors.reset}`);
console.log(`${colors.aqua}======================================================================${colors.reset}`);
console.log(`  - Laravel Backend (API):  ${colors.bold}${colors.aqua}http://127.0.0.1:8000${colors.reset}`);
console.log(`  - Next.js Frontend UI:    ${colors.bold}${colors.aqua}http://localhost:3000${colors.reset}`);
console.log(`${colors.aqua}======================================================================${colors.reset}\n`);
