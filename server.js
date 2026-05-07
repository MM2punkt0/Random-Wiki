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
    res.json({ title: p.title || '', extract: p.extract || '' });
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));

// charset (Index 1..n). Passe bei Bedarf an.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-:()";
const charIndex = {};
for(let i=0;i<CHARS.length;i++) charIndex[CHARS[i]] = (i+1).toString().padStart(2,'0');

// Kodiert text in numeric slices (maxIdsPerSlice z.B. 12)
function encodeToSlices(text, maxIdsPerSlice=12){
  const ids = [];
  for(const ch of text){
    const id = charIndex[ch] || '00'; // 00 = unknown/space fallback
    ids.push(id);
  }
  const slices = [];
  for(let i=0;i<ids.length;i+=maxIdsPerSlice){
    const chunk = ids.slice(i, i+maxIdsPerSlice).join(''); // z.B. "010205..."
    // Als Zahl: entferne führende Nullen? wir behalten als string, but cloud var expects number — leading zeros not needed
    slices.push(chunk); // chunk ist Dezimalstring, übergebe als Zahl beim Setzen der Cloudvar
  }
  return slices; // Array von Dezimalstrings (z.B. ["010203...", "0506..."])
}
// server.js
app.get('/random-wiki-ascii', async (req, res) => {
  try {
    const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=1';
    const r = await fetch(url);
    const j = await r.json();
    const pages = Object.values(j.query.pages);
    const p = pages[0];
    res.json encodeToSlices(({ title: p.title || '', extract: p.extract || '' }));
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
