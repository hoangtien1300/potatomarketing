// Vercel Serverless Function: GET /api/about-us
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/export?format=csv&gid=1973975368";
const WORKSHEET_ID = 1973975368;
const SHEET_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=1973975368";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (nextCh === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\r') {
        // skip carriage return
      } else if (ch === '\n') {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = '';
      } else {
        current += ch;
      }
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetchRes = await fetch(SHEET_CSV_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Vercel-Serverless-Potato-Hub)' }
    });

    if (!fetchRes.ok) {
      throw new Error(`Google Sheet CSV export returned HTTP ${fetchRes.status}`);
    }

    const csvText = await fetchRes.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      throw new Error('No data rows found in Google Sheet export');
    }

    const headers = rows[0];
    const items = [];

    for (let idx = 1; idx < rows.length; idx++) {
      const r = rows[idx];
      if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;
      items.push({
        rowIndex: idx + 1,
        group: r[0] || '',
        item: r[1] || '',
        content: r[2] || '',
        rule: r[3] || ''
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Google Sheet (Live)',
      gid: WORKSHEET_ID,
      sheetUrl: SHEET_URL,
      headers: headers,
      items: items,
      count: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Vercel Serverless /api/about-us error]', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      source: 'Client Fallback Cache',
      items: []
    });
  }
};
