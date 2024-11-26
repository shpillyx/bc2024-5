const { program } = require('commander');
const options = program.opts();
const path = require('path');
const express = require('express'); 
const app = express();
const fs = require('fs/promises');

program
  .option('-h, --host <host>', 'Адреса сервера')
  .option('-p, --port <port>', 'Порт сервера')
  .option('-c, --cache <cacheDir>', 'Шлях до директорії з кешем');

program.parse();


if (!options.host || !options.port || !options.cache) {
  console.error('Please, specify the necessary parameters: host, port, and cache.');
  process.exit(1);
}

app.use(express.json());

// GET /notes/:name
app.get('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const notePath = path.join(options.cache, `${noteName}.txt`);

  fs.readFile(notePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Cannot edit note: Not found');
      } else {
        res.status(500).json({ message: 'Internal server error', error: err });
      }
    } else {
      res.status(200).send(data);
    }
  });
});

// PUT /notes/:name
app.put('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const noteContent = req.body.text;
  const notePath = path.join(options.cache, `${noteName}.txt`);

  if (!fs.existsSync(notePath)) {
    res.status(404).send('Cannot edit note: Not found');
  } else {
    fs.writeFile(notePath, noteContent, 'utf8', (err) => {
      if (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
      } else {
        res.status(200).send('OK');
      }
    });
  }
});

// DELETE /notes/:name
app.delete('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const notePath = path.join(options.cache, `${noteName}.txt`);

  fs.unlink(notePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Cannot edit note: Not found');
      } else {
        res.status(500).json({ message: 'Internal server error', error: err });
      }
    } else {
      res.status(200).send('OK');
    }
  });
});

// GET /notes
app.get('/notes', (req, res) => {
  const notesInCache = fs.readdirSync(options.cache);
  const notes = notesInCache.map((note) => {
    const noteName = path.basename(note, '.txt');
    const notePath = path.join(options.cache, note);
    const noteText = fs.readFileSync(notePath, 'utf8');
    return { name: noteName, text: noteText };
  });
  res.status(200).json(notes);
});

// POST /write
app.post('/write', (req, res) => {
  const noteName = req.body.note_name;
  const noteContent = req.body.note;

  if (!noteName || !noteContent) {
    res.status(400).send('Вміст нотатки не може бути порожнім');
    return;
  }

  const notePath = path.join(options.cache, `${noteName}.txt`);

  if (fs.existsSync(notePath)) {
    res.status(400).send('Нотатка з такою ім*ям вже існує');
  } else {
    fs.writeFile(notePath, noteContent, 'utf8', (err) => {
      if (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
      } else {
        res.status(201).send('Created');
      }
    });
  }
});

// GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
    const htmlPage = fs.readFileSync(path.join(__dirname, 'UploadForm.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlPage);
  })


app.listen(options.port, options.host, (req, res) => {
  console.log(`Server is running on http://${options.host}:${options.port}`);
});