const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}  Exam Management System Setup  ${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}\n`);

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const runCommand = (command, cwd = '.') => {
  try {
    console.log(`${colors.blue}Executing: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit', cwd });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute ${command}${colors.reset}`);
    return false;
  }
};

const setupBackend = async () => {
  console.log(`\n${colors.yellow}Setting up backend...${colors.reset}`);
  
  if (!runCommand('npm install', './backend')) {
    return false;
  }
  
  console.log(`\n${colors.green}Backend dependencies installed successfully.${colors.reset}`);
  
  // Ask for database configuration
  console.log(`\n${colors.yellow}Database Configuration:${colors.reset}`);
  const dbHost = await askQuestion('Database Host (default: localhost): ') || 'localhost';
  const dbUser = await askQuestion('Database User (default: root): ') || 'root';
  const dbPassword = await askQuestion('Database Password: ');
  const dbName = await askQuestion('Database Name (default: exam_manage): ') || 'exam_manage';
  
  // Create .env file
  const envContent = `# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# Server Configuration
PORT=3001

# Sample Data Configuration
LOAD_SAMPLE_DATA=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:4173,http://localhost:5173,http://localhost:3000
`;

  try {
    fs.writeFileSync(path.join(__dirname, 'backend', '.env'), envContent);
    console.log(`${colors.green}.env file created successfully.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to create .env file: ${error.message}${colors.reset}`);
    return false;
  }
  
  return true;
};

const setupFrontend = async () => {
  console.log(`\n${colors.yellow}Setting up frontend...${colors.reset}`);
  
  if (!runCommand('npm install', './frontend')) {
    return false;
  }
  
  console.log(`\n${colors.green}Frontend dependencies installed successfully.${colors.reset}`);
  return true;
};

const loadSampleData = async () => {
  const answer = await askQuestion(`\n${colors.yellow}Do you want to load sample data? (Y/n): ${colors.reset}`);
  if (answer.toLowerCase() !== 'n') {
    console.log(`\n${colors.yellow}Loading sample data...${colors.reset}`);
    if (!runCommand('npm run seed', './backend')) {
      return false;
    }
    console.log(`\n${colors.green}Sample data loaded successfully.${colors.reset}`);
  }
  return true;
};

const runApplication = async () => {
  console.log(`\n${colors.cyan}====================================${colors.reset}`);
  console.log(`${colors.cyan}  Starting Application  ${colors.reset}`);
  console.log(`${colors.cyan}====================================${colors.reset}\n`);
  
  console.log(`${colors.magenta}To start the backend server, run:${colors.reset}`);
  console.log(`  cd backend`);
  console.log(`  npm run dev\n`);
  
  console.log(`${colors.magenta}To start the frontend server, run:${colors.reset}`);
  console.log(`  cd frontend`);
  console.log(`  npm run dev\n`);
  
  console.log(`${colors.magenta}Access the application at:${colors.reset}`);
  console.log(`  Frontend: http://localhost:5173`);
  console.log(`  Backend API: http://localhost:3001\n`);
  
  const startNow = await askQuestion(`${colors.yellow}Do you want to start the application now? (Y/n): ${colors.reset}`);
  if (startNow.toLowerCase() !== 'n') {
    // Start backend in a separate terminal
    console.log(`\n${colors.yellow}Starting backend server...${colors.reset}`);
    const backendCmd = process.platform === 'win32' 
      ? 'start cmd /k "cd backend && npm run dev"'
      : `gnome-terminal -- bash -c "cd backend && npm run dev; bash"`;
    runCommand(backendCmd);
    
    // Start frontend in a separate terminal
    console.log(`\n${colors.yellow}Starting frontend server...${colors.reset}`);
    const frontendCmd = process.platform === 'win32' 
      ? 'start cmd /k "cd frontend && npm run dev"'
      : `gnome-terminal -- bash -c "cd frontend && npm run dev; bash"`;
    runCommand(frontendCmd);
  }
};

const main = async () => {
  try {
    if (await setupBackend() && await setupFrontend()) {
      await loadSampleData();
      await runApplication();
    }
  } catch (error) {
    console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
};

main(); 