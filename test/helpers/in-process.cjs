const { IncomingMessage, ServerResponse } = require('node:http');
const { Duplex } = require('node:stream');

// Exercise Express directly without opening a network connection.
module.exports = async function dispatch(app, url, options = {}) {
  const webRequest = new Request(new URL(url, 'http://localhost'), options);
  const body = Buffer.from(await webRequest.arrayBuffer());
  const chunks = [];
  const socket = new Duplex({ writableHighWaterMark: 32 * 1024 * 1024, read() {}, write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
  const request = new IncomingMessage(socket);
  request.method = webRequest.method;
  request.url = webRequest.url.replace('http://localhost', '');
  request.headers = Object.fromEntries(webRequest.headers);
  if (body.length) request.headers['content-length'] = String(body.length);
  request.httpVersion = '1.1';
  request.httpVersionMajor = 1;
  request.httpVersionMinor = 1;
  request.complete = true;
  const response = new ServerResponse(request);
  response.assignSocket(socket);
  const finished = new Promise((resolve, reject) => {
    response.on('finish', resolve);
    response.on('error', reject);
  });
  app.handle(request, response);
  request.push(body.length ? body : null);
  if (body.length) request.push(null);
  await finished;
  const raw = Buffer.concat(chunks);
  const split = raw.indexOf('\r\n\r\n');
  const headerText = raw.subarray(0, split).toString();
  const status = Number(headerText.split(' ')[1]);
  let data = raw.subarray(split + 4);
  if (/transfer-encoding: chunked/i.test(headerText)) {
    const decoded = [];
    let offset = 0;
    while (offset < data.length) {
      const end = data.indexOf('\r\n', offset);
      const length = parseInt(data.subarray(offset, end).toString(), 16);
      if (!length) break;
      decoded.push(data.subarray(end + 2, end + 2 + length));
      offset = end + 2 + length + 2;
    }
    data = Buffer.concat(decoded);
  }
  return { status, ok: status >= 200 && status < 300, json: async () => JSON.parse(data.toString()), text: async () => data.toString() };
};
