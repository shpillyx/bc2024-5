const { program } = require('commander');
const options = program.opts();
const path = require('path');
const express = require('express'); // додайте цей рядок

program
  .option('-h, --host <host>', 'Адреса сервера')
  .option('-p, --port <port>', 'Порт сервера')
  .option('-c, --cache <cacheDir>', 'Шлях до директорії з кешем');

program.parse();
const app = express();

if (!options.host || !options.port || !options.cache) {
  console.error('Please, specify the necessary parameters: host, port, and cache.');
  process.exit(1);
}

app.listen(options.port, options.host, (req, res) => {
  console.log(`Server is running on http://${options.host}:${options.port}`);
});