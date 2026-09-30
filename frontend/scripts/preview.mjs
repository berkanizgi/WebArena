import { fileURLToPath } from 'node:url';
import { startServer } from 'next/dist/server/lib/start-server.js';

// Run in one process so Windows environments that restrict child processes work.
process.env.WEBARENA_PREVIEW = '1';
const port = Number(process.env.PORT || 3100);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
await startServer({
  dir: fileURLToPath(new URL('..', import.meta.url)),
  port,
  hostname: '127.0.0.1',
  isDev: true,
  allowRetry: false,
});
