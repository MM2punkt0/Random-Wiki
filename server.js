// server.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const app = express();

app.get('/random-wiki', async (req, res) => {
  try {
    const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=1';
    const r = await fetch(url);
    const j = await r.json();
    const pages = Object.values(j.query.pages);
    const p = pages[0];
    res.json({ title: p.title || '', extract: p.extract || '' });
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});

// /random-wiki-ascii
app.get('/random-wiki-ascii', async (req, res) => {
  try {
    const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=1';
    const r = await fetch(url);
    const j = await r.json();
    const pages = Object.values(j.query.pages);
    const p = pages[0];

    const title = p.title || '';
    const extract = p.extract || '';

    // Text → ASCII Dezimalzahlen
    const toAscii = str =>
      str
        .split('')
        .map(ch => ch.charCodeAt(0))
        .join(' ');

    res.json({
      title: toAscii(title),
      extract: toAscii(extract)
    });
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});


app.listen(process.env.PORT || 3000, () => console.log('Server running'));

