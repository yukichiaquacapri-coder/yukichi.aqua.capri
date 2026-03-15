import { createCuspWithCustomTime, Origin, Chart } from 'astrology-js';

export default function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    if (!date || !time || !lat || !lng) {
        return res.status(400).json({ error: "Data missing" });
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // 誕生データの設定
    const origin = new Origin({
        year, month, day, hour, minute,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
    });

    const chart = new Chart(origin);

    // 星座名リスト
    const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
    const getSignInfo = (body) => {
        const sign = signs[body.sign - 1];
        return `${sign} ${body.longitudeInSign.toFixed(2)}°`;
    };

    res.status(200).json({
        sun: getSignInfo(chart.sun),
        moon: getSignInfo(chart.moon),
        asc: signs[chart.ascendant.sign - 1] + ` ${chart.ascendant.longitudeInSign.toFixed(2)}°`
    });
}
