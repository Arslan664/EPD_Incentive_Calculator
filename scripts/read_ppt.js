const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// PPTX is a ZIP file - use built-in unzip
const pptPath = path.join(__dirname, '..', 'PPT', 'ICP_Executive_Summary_2026.pptx');
const buf = fs.readFileSync(pptPath);

// Simple ZIP parser - find local file headers
const results = [];
let i = 0;
while (i < buf.length - 4) {
  // Local file header signature: 0x04034b50
  if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
    const compMethod = buf.readUInt16LE(i + 8);
    const compSize   = buf.readUInt32LE(i + 18);
    const uncompSize = buf.readUInt32LE(i + 22);
    const fnLen      = buf.readUInt16LE(i + 26);
    const extraLen   = buf.readUInt16LE(i + 28);
    const fileName   = buf.slice(i + 30, i + 30 + fnLen).toString('utf8');
    const dataStart  = i + 30 + fnLen + extraLen;
    const dataEnd    = dataStart + compSize;

    if (fileName.match(/^ppt\/slides\/slide\d+\.xml$/) && compSize > 0) {
      try {
        const compData = buf.slice(dataStart, dataEnd);
        let xml;
        if (compMethod === 8) {
          xml = zlib.inflateRawSync(compData).toString('utf8');
        } else {
          xml = compData.toString('utf8');
        }
        const textMatches = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)];
        const texts = textMatches.map(m => m[1].trim()).filter(Boolean);
        results.push({ name: fileName, texts });
      } catch(e) {
        results.push({ name: fileName, texts: ['[error: ' + e.message + ']'] });
      }
    }
    i = dataEnd;
  } else {
    i++;
  }
}

results.sort((a, b) => a.name.localeCompare(b.name));
results.forEach(r => {
  console.log('=== ' + r.name + ' ===');
  console.log(r.texts.join(' | '));
  console.log('');
});
