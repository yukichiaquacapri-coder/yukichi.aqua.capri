import express from 'express';
import swisseph from 'swisseph';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // corsをインポート

const app = express(); // 1. まず「app」を作る（これより上にapp.useは書けません）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 2. 「app」を作った直後に設定を入れる
app.use(cors()); 
app.use(express.static(__dirname));

app.get('/api/horoscope', (req, res) => {
    const { date, time, lat, lng, offset } = req.query;
    
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);
        
        // 時差計算
        const ut = (hour + min / 60) + (parseFloat(offset) / 60);
        const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);
        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

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
        console.error(e);
        res.status(500).json({ error: "計算エラー" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
