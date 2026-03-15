import { Origin, Chart } from 'astrology-js';

export default async function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const origin = new Origin({
            year, month, day, hour, minute,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
        });

        const chart = new Chart(origin);
        const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];

        // 天体データを取得する関数（逆行対応）
        const getPlanetData = (planet) => {
            const signName = signs[planet.sign - 1];
            const deg = planet.longitudeInSign.toFixed(2);
            // 逆行(Retrograde)の判定
            const retro = planet.isRetrograde ? " (R)" : "";
            return `${signName} ${deg}°${retro}`;
        };

        res.status(200).json({
            sunPos: getPlanetData(chart.sun),
            moonPos: getPlanetData(chart.moon),
            // あなたの蟹座の火星もこれで(R)が出るはずです
            marsPos: getPlanetData(chart.mars), 
            ascPos: signs[chart.ascendant.sign - 1] + " " + chart.ascendant.longitudeInSign.toFixed(2) + "°"
        });
    } catch (e) {
        res.status(500).json({ error: "精密計算の実行に失敗しました" });
    }
}
