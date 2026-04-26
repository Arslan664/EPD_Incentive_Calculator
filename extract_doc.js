const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({ path: 'EPD_Incentive_Platform_Proposal.docx' })
  .then(r => {
    fs.writeFileSync('temp_docx_text.txt', r.value);
    console.log('Extracted', r.value.length, 'chars');
    console.log(r.value.substring(0, 5000));
  })
  .catch(e => console.log('Error:', e.message));
