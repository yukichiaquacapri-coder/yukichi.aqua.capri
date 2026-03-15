export default function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    try {
        const d = new Date(`${date}T${time}:00Z`);
        const jd = (d.getTime() / 86400000) + 2440587.5;
        const t = (jd - 2451545.0) / 36525.0;
        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

        // 太陽
        let sunL = (280.466 + 36000.77 * t) % 360;
        let sunG = (357.528 + 35999.05 * t) % 360;
        let sunLong = (sunL + 1.915 * Math.sin(sunG * Math.PI / 180)) % 360;
        if (sunLong < 0) sunLong += 360;

        // 月
        let moonL = (218.32 + 481267.88 * t) % 360;
        let moonLong = (moonL + 6.29 * Math.sin((134.96 + 477198.87 * t) * Math.PI / 180)) % 360;
        if (moonLong < 0) moonLong += 360;

        // アセンダント (ASC) の簡易計算
        const ut = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
        const siderealTime = (100.46 + 0.985647 * jd + parseFloat(lng) + 15 * ut) % 360;
        const obliq = 23.439;
        const ascRad = Math.atan2(
            -Math.cos(siderealTime * Math.PI / 180),
            Math.sin(siderealTime * Math.PI / 180) * Math.cos(obliq * Math.PI / 180) + Math.tan(parseFloat(lat) * Math.PI / 180) * Math.sin(obliq * Math.PI / 180)
        );
        let ascLong = (ascRad * 180 / Math.PI + 360) % 360;

        const getSign = (long) => `${signs[Math.floor(long / 30)]} ${(long % 30).toFixed(2)}°`;

        res.status(200).json({
            sunPos: getSign(sunLong),
            moonPos: getSign(moonLong),
            ascPos: getSign(ascLong)
        });
    } catch (e) {
        res.status(500).json({ error: "計算失敗" });
    }
}
