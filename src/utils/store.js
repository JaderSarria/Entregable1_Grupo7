const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'src/data');
const publicDir = process.env.PUBLIC_DIR ? path.resolve(process.env.PUBLIC_DIR) : path.join(root, 'public');
const queues = new Map();
async function read(resource) {
  const records = JSON.parse(await fs.readFile(path.join(dataDir, `${resource}.json`), 'utf8'));
  if (!Array.isArray(records)) throw new Error('Invalid data file');
  return records;
}
async function mutate(resource, action) {
  const previous = queues.get(resource) || Promise.resolve();
  const task = previous.catch(() => {}).then(async () => {
    const records = await read(resource);
    const result = await action(records);
    const target = path.join(dataDir, `${resource}.json`);
    const temp = `${target}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(temp, JSON.stringify(records, null, 2) + '\n', 'utf8');
      await fs.rename(temp, target);
    } catch (error) {
      await fs.unlink(temp).catch(() => {});
      throw error;
    }
    return result;
  });
  queues.set(resource, task);
  return task;
}
async function initialize() {
  await fs.mkdir(dataDir, { recursive: true });
  for (const resource of ['users', 'pets']) {
    await fs.mkdir(path.join(publicDir, 'img', resource), { recursive: true });
    try { await fs.writeFile(path.join(dataDir, `${resource}.json`), '[]\n', { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}
async function removeImages(urls) {
  for (const url of urls.filter(Boolean)) {
    if (!/^\/img\/(users|pets)\/[a-zA-Z0-9.-]+$/.test(url)) continue;
    try { await fs.unlink(path.join(publicDir, url.slice(1))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
module.exports = { read, mutate, initialize, removeImages, publicDir };
