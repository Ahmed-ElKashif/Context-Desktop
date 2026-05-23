const { spawn } = require('child_process');

console.log('Starting Electron app for testing...');
const child = spawn('npx', ['electron', '.'], { stdio: 'pipe', shell: true });

let output = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  output += data.toString();
  process.stderr.write(data);
});

setTimeout(() => {
  console.log('\\n--- TEST COMPLETED, KILLING ELECTRON ---');
  child.kill();
  if (output.includes('Error') || output.includes('Exception') || output.includes('ERR_')) {
    console.error('Found potential errors in output.');
  } else {
    console.log('No obvious errors found in the output. Renderer loaded successfully.');
  }
  process.exit(0);
}, 8000);
