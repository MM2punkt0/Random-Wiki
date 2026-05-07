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


// Hilfsfunktion: ASCII-String in Chunks aufteilen
function chunkAsciiString(str, chunkSize = 200) {
  const parts = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    parts.push(str.slice(i, i + chunkSize));
  }
  return parts;
}

// Cloudvariable setzen
const WebSocket = require("ws");

function setCloudVar(projectId, varName, value, sessionId) {
  console.log("\n================ SCRATCH DEBUG ================");
  console.log("[DEBUG] Preparing to send cloud variable:");
  console.log("  Project ID:", projectId);
  console.log("  Variable:", `☁ ${varName}`);
  console.log("  Value length:", String(value).length);
  console.log("  Value preview:", String(value).slice(0, 120), "...");
  console.log("  SessionID length:", sessionId.length);

  const ws = new WebSocket("wss://clouddata.scratch.mit.edu/", {
    headers: {
      "Cookie": `scratchsessionsid=${sessionId};`,
      "Origin": "https://scratch.mit.edu"
    }
  });

  ws.on("open", () => {
    console.log("[DEBUG] WebSocket connected to Scratch Cloud.");

    const msg = {
      method: "set",
      name: `☁ ${varName}`,
      value: String(value),
      project_id: projectId
    };

    console.log("[DEBUG] Sending message:", msg);

    ws.send(JSON.stringify(msg));
  });

  ws.on("message", data => {
    console.log("[DEBUG] Scratch responded:", data.toString());
  });

  ws.on("error", err => {
    console.error("[ERROR] WebSocket error:", err);
  });

  ws.on("unexpected-response", (req, res) => {
    console.error("[ERROR] Unexpected response from Scratch:", res.statusCode, res.statusMessage);
  });

  ws.on("close", (code, reason) => {
    console.log("[DEBUG] WebSocket closed. Code:", code, "Reason:", reason.toString());
    console.log("===============================================");
  });
}



// Chunks automatisch an Scratch senden
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendChunksToScratch(projectId, baseName, asciiString, sessionId) {
  const chunks = chunkAsciiString(asciiString);

  for (let i = 0; i < chunks.length; i++) {
    const varName = `${baseName}_${i + 1}`;
    console.log(`[DEBUG] Sending chunk ${i + 1}/${chunks.length} → ${varName}`);
    setCloudVar(projectId, varName, chunks[i], sessionId);
    await wait(300); // wichtig!
  }

  // Anzahl der Chunks speichern
  setCloudVar(projectId, `${baseName}_count`, chunks.length, sessionId);
}


// Express-Route mit Chunk-System
app.get('/random-wiki-ascii-scratchbotinfpr26', async (req, res) => {
  try {
    const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=1';
    const r = await fetch(url);
    const j = await r.json();
    const pages = Object.values(j.query.pages);
    const p = pages[0];

    const title = p.title || '';
    const extract = p.extract || '';

    const toAscii = str =>
      str.split('').map(ch => ch.charCodeAt(0)).join(' ');

    const title_ascii = toAscii(title);
    const extract_ascii = toAscii(extract);

    // Titel-Chunks senden
    sendChunksToScratch(
      process.env.SCRATCH_PROJECT,
      "title_ascii",
      title_ascii,
      process.env.SCRATCH_SESSION
    );

    // Extract-Chunks senden
    sendChunksToScratch(
      process.env.SCRATCH_PROJECT,
      "extract_ascii",
      extract_ascii,
      process.env.SCRATCH_SESSION
    );

    res.json({
      title,
      title_ascii,
      extract_ascii
    });

  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
});





app.listen(process.env.PORT || 3000, () => console.log('Server running'));

