export default function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    
    // 計算の代わりに、受け取った値をそのまま返すテストです
    res.status(200).json({
        sunPos: `テスト成功: ${date} 生まれ`,
        moonPos: `緯度 ${lat}`,
        ascPos: `経度 ${lng}`
    });
}
