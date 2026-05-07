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

const queue = [];
let isProcessing = false;

function enqueueCloudUpdate(projectId, varName, value, sessionId) {
  queue.push({ projectId, varName, value, sessionId });
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const job = queue.shift();
    await sendCloudVar(job.projectId, job.varName, job.value, job.sessionId);
    await new Promise(r => setTimeout(r, 1000)); // 1 Sekunde Pause
  }

  isProcessing = false;
}

function sendCloudVar(projectId, varName, value, sessionId) {
  return new Promise(resolve => {
    const ws = new WebSocket("wss://clouddata.scratch.mit.edu/", {
      headers: {
        "Cookie": `scratchsessionsid=${sessionId};`,
        "Origin": "https://scratch.mit.edu"
      }
    });

    ws.on("open", () => {
      ws.send(JSON.stringify({
        method: "set",
        name: `☁ ${varName}`,
        value: String(value),
        project_id: projectId
      }));
    });

    ws.on("close", () => resolve());
    ws.on("error", () => resolve());
  });
}

  console.log("\n================ SCRATCH DEBUG ================");
  console.log("[DEBUG] Preparing to send cloud variable:");
  console.log("  Project ID:", projectId);
  console.log("  Variable:", `☁ ${varName}`);
  console.log("  Value length:", String(value).length);
  console.log("  Value preview:", String(value).slice(0, 120), "...");
  console.log("  SessionID length:", sessionId.length);


  ws.on("open", () => {
    console.log("[DEBUG] WebSocket connected to Scratch Cloud.");

    const msg = {
      method: "set",
      name: `☁ ${varName}`,
      value: String(value),
      project_id: projectId
    };

    console.log("[DEBUG] Sending message:", msg);
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



// Chunks automatisch an Scratch senden
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendChunksToScratch(projectId, baseName, asciiString, sessionId) {
  const chunks = chunkAsciiString(asciiString);

  chunks.forEach((chunk, i) => {
    enqueueCloudUpdate(projectId, `${baseName}_${i + 1}`, chunk, sessionId);
  });

  enqueueCloudUpdate(projectId, `${baseName}_count`, chunks.length, sessionId);
}


  // Anzahl der Chunks speichern
  setCloudVar(projectId, `${baseName}_count`, chunks.length, sessionId);

function toSafeAscii(str) {
  // 1. Unicode normalisieren
  str = str.normalize("NFKD");

  // 2. Diakritische Zeichen entfernen (é → e)
  str = str.replace(/[\u0300-\u036f]/g, "");

  // 3. Problematische Zeichen ersetzen
  const replacements = {
    "–": "-", "—": "-", "−": "-",
    "„": "\"", "“": "\"", "”": "\"",
    "‚": "'", "‘": "'", "’": "'",
    "…": "...",
    "ß": "ss",
    "ø": "o", "Ø": "O",
    "æ": "ae", "Æ": "AE",
    "œ": "oe", "Œ": "OE"
  };

  str = str.replace(/./g, ch => replacements[ch] || ch);

  // 4. Nur ASCII 32–126 behalten
  str = str.replace(/[^\x20-\x7E]/g, "");

  // 5. In ASCII-Dezimal umwandeln
  return str.split("").map(ch => ch.charCodeAt(0)).join(" ");
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

   const toAscii = toSafeAscii;

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

