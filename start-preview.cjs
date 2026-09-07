const path = require('node:path');
const { spawn } = require('node:child_process');
const url = 'http://localhost:5173';
function openBrowser() {
  if (!process.argv.includes('--no-open')) {
    const child = spawn('cmd.exe', ['/d', '/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
    child.unref();
  }
}
(async () => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if ((await response.text()).includes('智游镜界')) { console.log('Preview is ready: ' + url); openBrowser(); return; }
  } catch {}
  const { createServer } = await import('vite');
  const server = await createServer({ root: __dirname, configFile: path.join(__dirname, 'vite.config.js') });
  await server.listen();
  console.log('\nPreview is ready: ' + url + '\nKeep this window open. Press Ctrl+C to stop.\n');
  openBrowser();
})().catch(error => { console.error('Unable to start preview:', error.message); process.exitCode = 1; });
