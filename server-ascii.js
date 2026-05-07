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
