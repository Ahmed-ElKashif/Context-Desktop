const { exec } = require('child_process');

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function test() {
  try {
    await run(`reg add "HKCU\\Software\\Classes\\Directory\\shell\\ContextAppTest" /ve /t REG_SZ /d "Test App" /f`);
    await run(`reg add "HKCU\\Software\\Classes\\Directory\\shell\\ContextAppTest\\command" /ve /t REG_SZ /d "\\"C:\\Program Files\\test.exe\\" --path=\\"%V\\"" /f`);
    console.log("SUCCESS!");
    await run(`reg delete "HKCU\\Software\\Classes\\Directory\\shell\\ContextAppTest" /f`);
  } catch (err) {
    console.error(err);
  }
}
test();
