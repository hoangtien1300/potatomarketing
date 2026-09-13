// Vercel Serverless Function: GET /api/calendar & POST /api/calendar/sync
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/export?format=csv&gid=926192727";
const CALENDAR_WORKSHEET_ID = 926192727;
const CALENDAR_SHEET_URL = "https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=926192727";

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

function mapRowToPost(r, idx) {
  const month = (r[0] || '9').trim();
  const week = (r[1] || '1').trim();
  const day_num = (r[2] || '').trim();
  const platform = (r[3] || 'Facebook').trim();
  const title = (r[4] || '').trim();
  const content = (r[5] || '').trim();
  const tags = (r[6] || '').trim();
  const format_type = (r[7] || '').trim();
  const media_link = (r[8] || '').trim();
  const date_str = (r[9] || '').trim();
  const status = (r[10] || 'Lên kế hoạch').trim();
  const post_link = (r[11] || '').trim();

  const day_val = parseInt(day_num, 10) || 1;
  const iso_date = `2026-09-${day_val < 10 ? '0' + day_val : day_val}`;

  const plat_lower = platform.toLowerCase();
  let plat_key = 'facebook';
  let plat_name = 'Facebook Fanpage';
  let plat_icon = 'fa-brands fa-facebook-f';
  let plat_color = 'text-blue-600 bg-blue-50 border-blue-200';
  let badge_color = 'bg-blue-600 text-white';

  if (plat_lower.includes('tiktok')) {
    plat_key = 'tiktok';
    plat_name = 'TikTok Shorts';
    plat_icon = 'fa-brands fa-tiktok';
    plat_color = 'text-slate-900 bg-slate-100 border-slate-300';
    badge_color = 'bg-slate-900 text-white';
  } else if (plat_lower.includes('web') || plat_lower.includes('seo')) {
    plat_key = 'seo';
    plat_name = 'Website Blog SEO';
    plat_icon = 'fa-solid fa-globe';
    plat_color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    badge_color = 'bg-emerald-600 text-white';
  } else if (plat_lower.includes('zalo')) {
    plat_key = 'zalo';
    plat_name = 'Zalo OA CRM';
    plat_icon = 'fa-solid fa-comment-dots';
    plat_color = 'text-blue-500 bg-sky-50 border-sky-200';
    badge_color = 'bg-blue-500 text-white';
  }

  const st_lower = status.toLowerCase();
  let st_key = 'planned';
  let st_badge = 'bg-slate-100 text-slate-700 border border-slate-200';

  if (st_lower.includes('đã đăng') || st_lower.includes('đã xuất bản')) {
    st_key = 'published';
    st_badge = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  } else if (st_lower.includes('sẵn sàng')) {
    st_key = 'ready';
    st_badge = 'bg-blue-100 text-blue-800 border border-blue-200';
  } else if (st_lower.includes('chờ duyệt')) {
    st_key = 'pending';
    st_badge = 'bg-amber-100 text-amber-800 border border-amber-200';
  }

  return {
    id: `POST_2026_09_${day_val < 10 ? '0' + day_val : day_val}_${plat_key}`,
    sheetRowIndex: idx + 1,
    month: parseInt(month, 10) || 9,
    week: parseInt(week, 10) || 1,
    day: day_val,
    date: date_str || `${day_val < 10 ? '0' + day_val : day_val}/09/2026`,
    isoDate: iso_date,
    platformKey: plat_key,
    platform: plat_name,
    platformIcon: plat_icon,
    platformStyle: plat_color,
    platformBadge: badge_color,
    title: title,
    content: content,
    tags: tags,
    format: format_type,
    mediaLink: media_link,
    status: status,
    statusKey: st_key,
    statusBadge: st_badge,
    postLink: post_link
  };
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
      throw new Error('No data rows found in Google Sheet calendar export');
    }

    const posts = [];
    for (let idx = 1; idx < rows.length; idx++) {
      const r = rows[idx];
      if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;
      if (!r[4] && !r[2]) continue;
      posts.push(mapRowToPost(r, idx));
    }

    return res.status(200).json({
      success: true,
      source: 'Google Sheet (Live)',
      gid: CALENDAR_WORKSHEET_ID,
      sheetUrl: CALENDAR_SHEET_URL,
      posts: posts,
      count: posts.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Vercel Serverless /api/calendar error]', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      source: 'Client Fallback Cache',
      posts: []
    });
  }
};
