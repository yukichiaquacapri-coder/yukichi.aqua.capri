// server.js の該当箇所を以下に書き換え
app.get('/api/horoscope', (req, res) => {
    const { date, time, lat, lng } = req.query;
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);
        
        // 緯度・経度を数値に変換（ここがズレるとASCが激変します）
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        const ut = hour + min / 60;
        const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);
        
        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

        const getPos = (body) => {
            const result = swisseph.swe_calc_ut(jd, body, swisseph.SEFLG_SPEED);
            const long = result.longitude;
            return `${signs[Math.floor(long / 30)]} ${(long % 30).toFixed(2)}°`;
        };

        // ハウス計算（'P' はプラシーダス法）
        // 緯度と経度の引数の順番に注意：swe_houses(jd, lat, lng, hsys)
        const houses = swisseph.swe_houses(jd, latitude, longitude, 'P');
        const asc = houses.ascendant;

        res.json({
            sunPos: getPos(swisseph.SE_SUN),
            moonPos: getPos(swisseph.SE_MOON),
            marsPos: getPos(swisseph.SE_MARS),
            ascPos: `${signs[Math.floor(asc / 30)]} ${(asc % 30).toFixed(2)}°`
        });
    } catch (e) {
        console.error(e);
        res.json({ error: "計算エラーが発生しました" });
    }
});
