app.get('/api/horoscope', (req, res) => {
    const { date, time, lat, lng, offset } = req.query;
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);
        
        // ブラウザの getTimezoneOffset は「UT - 現地時間」を分単位で返します
        // 例: 日本なら -540分。 これを時間に直して足すとUTになります。
        const ut = (hour + min / 60) + (parseFloat(offset) / 60);
        
        const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);
        
        // ハウス計算 ('P' = プラシーダス)
        const houses = swisseph.swe_houses(jd, parseFloat(lat), parseFloat(lng), 'P');
        const asc = houses.ascendant;

        // ...（中略：getPosなどの処理はそのまま）...

        res.json({
            sunPos: getPos(swisseph.SE_SUN),
            moonPos: getPos(swisseph.SE_MOON),
            marsPos: getPos(swisseph.SE_MARS),
            ascPos: `${signs[Math.floor(asc / 30)]} ${(asc % 30).toFixed(2)}°`
        });
    } catch (e) {
        res.json({ error: "計算エラー" });
    }
});
