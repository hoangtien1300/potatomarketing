// Vercel Serverless Function: POST /api/survey/submit
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const payload = req.body || {};
    const fullName = (payload.fullName || '').trim();
    const role = (payload.role || '').trim();

    if (!fullName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Họ và tên cùng Chức vụ'
      });
    }

    // Telegram notification
    try {
      const taboosStr = Array.isArray(payload.q9_taboos) ? payload.q9_taboos.join('; ') : (payload.q9_taboos || '');
      const tgMsg = `🥔 [WEBAPP ONLINE] PHIẾU KHẢO SÁT TONE OF VOICE MỚI!\n\n👤 Người gửi: ${fullName}\n💼 Chức vụ: ${role}\n⏰ Thời gian: ${payload.timestamp || new Date().toLocaleString('vi-VN')}\n\n1. Hình mẫu: ${payload.q1_archetype || ''}\n2. Vị thế: ${payload.q2_pov || ''}\n3. Thân mật: Mức ${payload.q3_intimacy || ''}/5\n4. Học thuật: Mức ${payload.q4_academic || ''}/5\n5. Độ dài FB: ${payload.q5_length || ''}\n6. Gọi PH: ${payload.q6_parents || ''}\n7. Xưng Potato: ${payload.q7_potato || ''}\n8. Gọi học sinh: ${payload.q8_students || ''}\n9. Ranh giới: ${taboosStr}\n10. Case Vinh danh: ${payload.q10_top_student || ''}\n11. Case Lời kết: ${payload.q11_signoff || ''}\n12. Ghi chú: ${payload.q12_notes || '(Không)'}\n\n📊 Google Sheet: https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=602562886`;

      await fetch('https://api.telegram.org/bot8840800690:AAEwV3rEULTmB2odH9nHRFEiTwEny4Mh1_E/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '1730306144',
          text: tgMsg
        })
      });
    } catch (tgErr) {}

    return res.status(200).json({
      success: true,
      gs_synced: false,
      message: `Đã ghi nhận thành công phiếu khảo sát của ${fullName} (${role})!`,
      submittedAt: payload.timestamp || new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
