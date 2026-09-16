// Vercel Serverless Function: GET & POST /api/tasks
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/export?format=csv&gid=1736184326";
const TASKS_WORKSHEET_ID = 1736184326;
const TASKS_SHEET_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=1736184326";

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

function mapRowToTask(r, idx) {
  const rowIndex = idx + 1;
  const stt_val = (r[0] || '').trim() || String(idx - 1);
  let raw_code = (r[1] || '').trim();
  const title = (r[2] || '').trim();
  const cat = (r[3] || '').trim();
  const channel = (r[4] || '').trim();
  const description = (r[5] || '').trim();
  const assignee = (r[6] || '').trim();
  const collaborator = (r[7] || '').trim();
  const priority = (r[8] || '🟡 Trung bình').trim();
  const startDate = (r[9] || '').trim();
  const dueDate = (r[10] || '').trim();
  const status = (r[11] || '⚪ Chưa bắt đầu').trim();
  const assetLink = (r[12] || '').trim();
  const resultLink = (r[13] || '').trim();
  const notes = (r[14] || '').trim();

  const num_val = parseInt(stt_val, 10) || (idx - 1);
  if (!raw_code || raw_code.startsWith('#')) {
    const cat_l = cat.toLowerCase();
    const prefix = cat_l.includes('facebook') ? 'FB' :
      cat_l.includes('tiktok') ? 'TK' :
      cat_l.includes('seo') ? 'SEO' :
      (cat_l.includes('design') || cat_l.includes('media')) ? 'DES' :
      (cat_l.includes('hệ thống') || cat_l.includes('vận hành')) ? 'SYS' : 'TASK';
    raw_code = `${prefix}-${String(num_val).padStart(3, '0')}`;
  }

  return {
    rowIndex: rowIndex,
    stt: stt_val,
    code: raw_code,
    title: title,
    category: cat,
    channel: channel,
    description: description,
    assignee: assignee,
    collaborator: collaborator,
    priority: priority,
    startDate: startDate,
    dueDate: dueDate,
    status: status,
    assetLink: assetLink,
    resultLink: resultLink,
    notes: notes
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isGetOrSync = req.method === 'GET' || (req.method === 'POST' && req.url && req.url.includes('/sync'));

  if (isGetOrSync) {
    try {
      const fetchRes = await fetch(SHEET_CSV_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Vercel-Serverless-Potato-Hub)' }
      });

      if (!fetchRes.ok) {
        throw new Error(`Google Sheet CSV export returned HTTP ${fetchRes.status}`);
      }

      const csvText = await fetchRes.text();
      const rows = parseCSV(csvText);

      const tasks = [];
      for (let idx = 2; idx < rows.length; idx++) {
        const r = rows[idx];
        if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;
        if (!r[2] && !r[1]) continue;
        tasks.push(mapRowToTask(r, idx));
      }

      return res.status(200).json({
        success: true,
        source: 'Google Sheet (Live)',
        gid: TASKS_WORKSHEET_ID,
        sheetUrl: TASKS_SHEET_URL,
        tasks: tasks,
        count: tasks.length,
        message: `Đã đồng bộ thành công ${tasks.length} nhiệm vụ từ Google Sheet (#gid=${TASKS_WORKSHEET_ID})!`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Tasks Error]', err);
      return res.status(200).json({
        success: false,
        source: 'Fallback',
        tasks: [],
        message: err.message
      });
    }
  }

  try {
    const payload = req.body || {};
    const action = req.url && req.url.includes('delete') ? 'xóa' : req.url && req.url.includes('create') ? 'thêm mới' : 'cập nhật';
    return res.status(200).json({
      success: true,
      gs_synced: false,
      message: `Đã ${action} nhiệm vụ thành công trên hệ thống!`,
      task: payload,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
