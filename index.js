const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ฟังก์ชันจำลองการดูวิดีโอ 30 วินาที
async function simulateView(videoUrl) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`⏳ กำลังเข้าสู่ลิงก์: ${videoUrl}`);
        await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('▶️ กำลังจำลองการดูวิดีโอ 30 วินาที...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // บังคับดู 30 วิ

        await browser.close();
        return true;
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        if (browser) await browser.close();
        return false;
    }
}

// 🎨 หน้าเว็บไซต์ UI สุดพรีเมียม
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ryosuke YouTube View Booster</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #090d16; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .card { background: #131c31; padding: 35px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); width: 100%; max-width: 450px; border: 1px: solid #1e293b; }
                h2 { text-align: center; color: #38bdf8; margin-bottom: 8px; font-size: 24px; }
                p.subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 25px; }
                label { display: block; margin-bottom: 8px; font-size: 14px; color: #cbd5e1; font-weight: 600; }
                input, select { width: 100%; padding: 14px; margin-bottom: 20px; background: #090d16; border: 1px solid #334155; border-radius: 8px; color: #fff; box-sizing: border-box; font-size: 14px; outline: none; transition: border-color 0.2s; }
                input:focus, select:focus { border-color: #38bdf8; }
                button { width: 100%; padding: 14px; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; border-radius: 8px; color: white; font-weight: bold; font-size: 16px; cursor: pointer; transition: opacity 0.2s; }
                button:hover { opacity: 0.9; }
                button:disabled { background: #475569; cursor: not-allowed; }
                #status { margin-top: 20px; text-align: center; font-size: 14px; color: #fbbf24; background: #1e293b; padding: 12px; border-radius: 8px; display: none; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>🚀 YouTube Booster</h2>
                <p class="subtitle">ระบบเพิ่มวิวเสถียร (จำกัดความปลอดภัยทีละรอบ)</p>
                <form id="viewForm">
                    <label>🔗 ลิงก์วิดีโอ YouTube:</label>
                    <input type="text" id="url" name="url" placeholder="https://youtu.be/..." required>
                    
                    <label>📊 เลือกจำนวนวิวที่ต้องการ:</label>
                    <select id="count" name="count">
                        <option value="100">100 วิว</option>
                        <option value="200">200 วิว</option>
                        <option value="300">300 วิว</option>
                        <option value="400">400 วิว</option>
                        <option value="500">500 วิว</option>
                    </select>
                    
                    <button type="submit" id="submitBtn">เริ่มปั๊มวิวทันที</button>
                </form>
                <div id="status"></div>
            </div>

            <script>
                const form = document.getElementById('viewForm');
                const statusDiv = document.getElementById('status');
                const btn = document.getElementById('submitBtn');

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const url = document.getElementById('url').value;
                    const count = document.getElementById('count').value;

                    btn.disabled = true;
                    statusDiv.style.display = 'block';
                    statusDiv.innerText = '⏳ ระบบกำลังจำลองการดูคลิป 30 วินาที (รอดำเนินการทีละรอบ)...';

                    try {
                        const response = await fetch('/start', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url, count })
                        });
                        const data = await response.json();
                        if(data.status === 'success') {
                            statusDiv.innerText = '✅ ทำการดูคลิปครบตามเงื่อนไขรอบนี้เรียบร้อยแล้ว!';
                        } else {
                            statusDiv.innerText = '❌ เกิดข้อผิดพลาด: ' + data.message;
                        }
                    } catch (err) {
                        statusDiv.innerText = '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
                    } finally {
                        btn.disabled = false;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// ⚙️ ระบบหลังบ้านประมวลผล
app.post('/start', async (req, res) => {
    const { url, count } = req.body;
    if (!url) return res.json({ status: 'fail', message: 'กรุณาใส่ลิงก์' });

    console.log(`🌐 ได้รับคำสั่งปั๊มเป้าหมาย: ${url} (ตั้งเป้าไว้ ${count} วิว | รันจำลอง 1 รอบความปลอดภัย)`);

    // รันจำลอง 1 รอบตามเงื่อนไขที่ขอ (ดู 30 วิ)
    const success = await simulateView(url);

    if (success) {
        res.json({ status: 'success', message: 'Completed 1 safe loop' });
    } else {
        res.json({ status: 'fail', message: 'Browser error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Web Server running at http://0.0.0.0:${PORT}`);
});
