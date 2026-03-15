// ライブラリを使わない自前計算モード
export default function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    
    try {
        const d = new Date(`${date}T${time}:00Z`);
        const jd = (d.getTime() / 86400000) + 2440587.5;
        const t = (jd - 2451545.0) / 36525.0;

        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

        // 簡易的な太陽の計算（誤差±1度程度）
        let sunL = (280.466 + 36000.77 * t) % 360;
        let sunG = (357.528 + 35999.05 * t) % 360;
        let sunLong = (sunL + 1.915 * Math.sin(sunG * Math.PI / 180)) % 360;
        if (sunLong < 0) sunLong += 360;

        // 簡易的な月の計算（誤差±1度程度）
        let moonL = (218.32 + 481267.88 * t) % 360;
        let moonLong = (moonL + 6.29 * Math.sin((134.96 + 477198.87 * t) * Math.PI / 180)) % 360;
        if (moonLong < 0) moonLong += 360;

        const getSign = (long) => {
            const s = signs[Math.floor(long / 30)];
            const deg = (long % 30).toFixed(2);
            return `${s} ${deg}°`;
        };

        res.status(200).json({
            sunPos: getSign(sunLong),
            moonPos: getSign(moonLong),
            ascPos: "計算準備中（太陽と月はOK！）"
        });
    } catch (e) {
        res.status(500).json({ error: "計算に失敗しました" });
    }
}
