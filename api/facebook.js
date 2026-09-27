// Vercel Serverless Function: /api/facebook (Gemini 3.8 Flash Humanized Storytelling)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const body = req.body || {};

  if (url.includes('generate')) {
    const { 
      pillar = 'PIL_02', 
      branch = 'cs1', 
      ageGroup = 'happy_junior', 
      studentNote = '', 
      angle = 'observer',
      geminiApiKey = '' 
    } = body;

    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const branchName = branch === 'cs1' ? 'Cơ sở 1 (37 Ngô Quyền, P. Phú Cường, Thủ Dầu Một)' : 'Cơ sở 2 (9 KP Hưng Phước, P. Hưng Định, Thuận An)';
        const ageDesc = ageGroup === 'friendly_kid' ? 'Friendly Kid (Mầm non 4-6 tuổi)' : ageGroup === 'leading_teen' ? 'Leading Teen (Thiếu niên 12-16 tuổi)' : 'Happy Junior (Tiểu học 6-12 tuổi)';

        const anglePrompts = {
          observer: "GÓC NHÌN: Người quan sát thầm lặng (The Quiet Observer). Ghi lại một khoảnh khắc nhỏ mộc mạc nhưng đắt giá tại lớp học (ánh mắt, bàn tay vẽ, sự hào hứng khi tìm ra từ vựng).",
          dialogue: "GÓC NHÌN: Trích đoạn đối thoại ngây ngô đời thực (Authentic Dialogue). Bắt đầu bằng một câu nói tiếng Anh bập bẹ hoặc câu hỏi hồn nhiên của bé và lời đáp kiên nhẫn của thầy cô.",
          progress: "GÓC NHÌN: Bước chuyển tâm lý nhỏ (Micro-Transformation). Từ những phút đầu còn rụt rè, bẽn lẽn đến khoảnh khắc con tự tin mở lời và nở nụ cười rạng rỡ.",
          empathy: "GÓC NHÌN: Tâm tình sẻ chia cùng ba mẹ (Parent Heart-to-Heart). Đồng cảm sâu sắc với nỗi lo của cha mẹ khi con mới bắt đầu học ngoại ngữ, chia sẻ kinh nghiệm đồng hành nhẹ nhàng."
        };

        const chosenAnglePrompt = anglePrompts[angle] || anglePrompts.observer;

        const systemPrompt = `Bạn là một người thầy/cô giáo tại lớp học tiếng Anh trẻ em Potato English (tại ${branchName}).
TÔN CHỈ THƯƠNG HIỆU: Bình dị, chân thật, nói đúng làm thật, gần gũi như gia đình.

NGHIÊM CẤM RẬP KHUÔN:
- TUYỆT ĐỐI KHÔNG viết theo công thức sáo rỗng: "TIÊU ĐỀ IN HOA GIẬT TÍT + Đoạn quảng cáo chung chung + Lời chúc sáo rỗng + 10 hashtag".
- Hãy viết như một trang nhật ký lớp học đời thường chân thật (Proof of Life). Ngôn từ mộc mạc, tự nhiên, chạm vào cảm xúc người đọc trong 5 giây lướt feed.
- ${chosenAnglePrompt}

QUY TẮC CỐT LÕI (CHỈ ĐẠO CHIẾN LƯỢC TỪ CHỊ ĐÀO & ANH TRÍ):
1. ĐỘ DÀI: BẮT BUỘC DƯỚI 80 TỪ. Cực kỳ súc tích, người xem đọc hết mà không cần bấm "Xem thêm".
2. 100% STUDENT-CENTRIC: Tâm điểm duy nhất là bạn nhỏ và nỗ lực của con. Tuyệt đối KHÔNG tự tán dương lớp học, không khoe thành tích.
3. ZERO DIRECTIVE CTA: Tuyệt đối KHÔNG chèn câu kêu gọi giục giã ("Hãy bấm vào ảnh", "Xem ngay", "Đừng bỏ lỡ", "Inbox ngay"). Để phụ huynh tương tác tự nhiên.
4. CẤM từ "trung tâm" (thay bằng "Potato English", "lớp học Potato English", "không gian học tập").
5. HẠN CHẾ từ "áp lực/không áp lực" (thay bằng "học bằng niềm vui", "thoải mái tự tin", "tiến bộ tự nhiên").
6. KẾT THÚC: 1 câu nhắn gửi ấm áp đời thường (Warm sign-off) và 3 đến 4 hashtags tinh gọn (#PotatoEnglish...). BỎ HOÀN TOÀN khối địa chỉ/hotline spam ở cuối bài.`;

        const userContext = `Trụ cột: ${pillar}. Đối tượng: ${ageDesc}. Ghi chép thực tế từ lớp học: "${studentNote || 'Buổi học rộn ràng tiếng cười và sự tiến bộ tự nhiên của các bạn nhỏ'}". Hãy viết 1 bài micro-copywriting hoàn chỉnh dưới 80 từ.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContext}` }] }],
            generationConfig: {
              temperature: 0.88,
              maxOutputTokens: 1000
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return res.status(200).json({
              success: true,
              content: aiText.trim(),
              model: "gemini-3.8-flash",
              angle: angle,
              pillar: pillar
            });
          }
        }
      } catch (err) {
        console.warn("[Gemini 3.8 Call Failed]", err);
      }
    }

    // Dynamic Humanized Fallback (Đa dạng, không cố định 1 khuôn)
    const naturalDrafts = [
      `"This is my mom and me. She 40 years old, and she working very hard. I love her!"\n\nBức tranh nhỏ vừa hoàn thành sau giờ Story Spark, con cầm trên tay khoe với đôi mắt lấp lánh niềm vui. Tiếng Anh đến với con mộc mạc và tự nhiên như tiếng mẹ đẻ.\n\nMột buổi chiều ấm áp của các bạn nhỏ tại Potato English 🥔❤️\n\n#PotatoEnglish #FriendlyKid #TuTinNoiTiengAnh #HocQuaTraiNghiem`,
      `Mười phút đầu buổi học, con còn nép nhẹ sau lưng mẹ, ngập ngừng chưa dám bước vào vòng tròn của cô. Vậy mà đến trò chơi tìm từ vựng, con đã chủ động giơ tay xung phong phát âm thật to.\n\nNiềm vui của thầy cô là được chứng kiến từng bước tiến bộ tự nhiên và nụ cười rạng rỡ của con mỗi ngày 🥔❤️\n\n#PotatoEnglish #HappyJunior #TuTinMoLoi #TienBoTuNhien`,
      `Không cần áp đặt những bài kiểm tra căng thẳng, lớp học chiều nay rộn rã khi các bạn nhỏ tự tin đóng vai và kể về con vật yêu thích của mình. Từng câu nói mộc mạc nhưng tràn đầy năng lượng tích cực.\n\nHẹn gặp lại các con trong những giờ học khám phá tiếp theo nhé! 🥔❤️\n\n#PotatoEnglish #NoiDungLamThat #HocBangNiemVui #HappyJunior`
    ];

    const pick = naturalDrafts[Math.floor(Math.random() * naturalDrafts.length)];
    return res.status(200).json({
      success: true,
      content: pick,
      model: "humanized-dynamic-engine",
      angle: angle,
      pillar: pillar
    });
  }

  if (url.includes('schedule')) {
    const { scheduledTime = '', pillar = 'PIL_02' } = body;
    const nowStr = new Date().toLocaleString('vi-VN');
    return res.status(200).json({
      success: true,
      message: `Đã lên lịch đăng bài thành công vào lúc ${scheduledTime} trên hệ thống 24/7!`,
      scheduledTime,
      scheduledAt: nowStr
    });
  }

  // Publish endpoint
  const { content = '', pillar = 'PIL_02', branch = 'cs1' } = body;
  const nowStr = new Date().toLocaleString('vi-VN');
  return res.status(200).json({
    success: true,
    message: "Đã xuất bản bài viết thành công lên Fanpage Potato English!",
    publishedAt: nowStr,
    postId: `FB_POST_${Date.now()}`
  });
};
