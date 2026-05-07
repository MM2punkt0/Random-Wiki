// server.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();

app.get('/random-wiki', async (req, res) => {
  try {
    const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=1';
    const r = await fetch(url);
    const j = await r.json();
    const pages = Object.values(j.query.pages);
    const p = pages[0];
    const jsonString = ' title: p.title || , extract: p.extract || ';
    let asciiValues = [];
    for (let i = 0; i < jsonString.length; i++) {
    asciiValues.push(jsonString.charCodeAt(i));
}
console.log(asciiValues.join(' ')); // 123 34 97 34 58 49 125

  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
