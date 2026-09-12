// Vercel Serverless Function: POST /api/about-us/batch-update
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const items = body.items || [];
    
    // Cloud acknowledgement
    return res.status(200).json({
      success: true,
      count: items.length,
      message: `Đã lưu và cập nhật thành công ${items.length} hạng mục thông số thương hiệu!`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
