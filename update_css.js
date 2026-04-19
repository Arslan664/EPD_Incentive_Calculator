const fs = require('fs');

const html = fs.readFileSync('New/Final_Incentive_Report.html', 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/;
const match = html.match(styleRegex);
let css = match ? match[1] : '';

// Add inline styles as classes
css += `
/* --- Converted Inline Styles from Original HTML --- */
.filters-bar {
    display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: var(--panel-bg); border: 1px solid var(--border); border-radius: 8px;
}

.filter-item {
    display: flex;
    flex-direction: column;
}

.filter-item label {
    display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase;
}

.filter-item select {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; outline: none; background: #fff; min-width: 120px;
}

.filter-item select.view-select {
    border: 1px solid var(--primary); color: var(--primary); background: #e0f2fe; min-width: 220px; font-weight: 600;
}

.reset-btn {
    padding: 8px 16px; background: #f1f5f9; border: 1px solid var(--border); border-radius: 6px; color: var(--text-main); font-weight: 500; cursor: pointer; transition: background 0.2s;
    display: flex; align-items: center; justify-content: center;
}

.table-toolbar {
    margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; color: var(--text-muted); display: flex; align-items: center; gap: 6px;
}

.table-toolbar-left {
    display: flex; align-items: center; gap: 6px; color: var(--primary); font-weight: 600; font-size: 0.95rem; margin-top: 16px; margin-bottom: 12px;
}

/* Base override to stop Tailwind conflicts */
button, input, select {
   font-family: inherit;
}
`;

fs.writeFileSync('app/globals.css', '@import "tailwindcss";\n' + css);
console.log('globals.css updated with original styles successfully!');
