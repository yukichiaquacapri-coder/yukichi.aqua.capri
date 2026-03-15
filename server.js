import express from 'express';
import swisseph from 'swisseph';
import cors from 'cors';

const app = express();

// GitHub Pagesからのアクセスを許可
app.use(cors());

app.get('/api/horoscope', (req, res) => {
    const { date, time, lat, lng, offset } = req.query;
    
    try {
        // データの欠落チェック
        if (!date || !time || !lat || !lng) {
            return res.status(400).json({ error: "入力データが足りません" });
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);
        
        // 時差(UT)の計算：日本なら offset は -540
        const ut = (hour + min / 60) + (parseFloat(offset || 0) / 60);
        
        const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);
        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

        // ハウス計算（プラシーダス法）
        const houses = swisseph.swe_houses(jd, parseFloat(lat), parseFloat(lng), 'P');
        const asc = houses.ascendant;

        const getPos = (body) => {
            const result = swisseph.swe_calc_ut(jd, body, swisseph.SEFLG_SPEED);
            const long = result.longitude;
            const retro = result.distanceSpeed < 0 ? " (R)" : "";
            return `${signs[Math.floor(long / 30)]} ${(long % 30).toFixed(2)}°${retro}`;
        };

        res.json({
            sunPos: getPos(swisseph.SE_SUN),
            moonPos: getPos(swisseph.SE_MOON),
            marsPos: getPos(swisseph.SE_MARS),
            ascPos: `${signs[Math.floor(asc / 30)]} ${(asc % 30).toFixed(2)}°`
        });
    } catch (e) {
        console.error("Calculation Error:", e);
        res.status(500).json({ error: "計算エラーが発生しました" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
