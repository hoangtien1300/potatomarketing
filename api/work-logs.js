// Vercel Serverless Function: GET & POST /api/work-logs
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/export?format=csv&gid=1776016196";
const WORK_LOG_WORKSHEET_ID = 1776016196;
const WORK_LOG_SHEET_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=1776016196";

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
        // skip
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

    const logs = [];
    for (let idx = 2; idx < rows.length; idx++) {
      const r = rows[idx];
      if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;
      const log_id = (r[0] || '').trim() || `LOG-${idx + 1}`;
      const time_str = (r[1] || '').trim();
      const category = (r[2] || 'Hệ thống & Kỹ thuật').trim();
      const action = (r[3] || '').trim();
      const description = (r[4] || '').trim();
      const executor = (r[5] || 'Potato Dev').trim();

      if (!action && !description) continue;

      logs.push({
        rowIndex: idx + 1,
        id: log_id,
        time: time_str,
        category: category,
        action: action,
        description: description,
        executor: executor
      });
    }

    logs.sort((a, b) => (b.time || '').localeCompare(a.time || ''));

    return res.status(200).json({
      success: true,
      source: 'Google Sheet (Live)',
      gid: WORK_LOG_WORKSHEET_ID,
      sheetUrl: WORK_LOG_SHEET_URL,
      logs: logs,
      count: logs.length,
      message: `Đã đồng bộ thành công ${logs.length} nhật ký công việc từ Google Sheet (#gid=${WORK_LOG_WORKSHEET_ID})!`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Work Logs Error]', err);
    return res.status(200).json({
      success: false,
      source: 'Fallback',
      logs: [],
      message: err.message
    });
  }
};
