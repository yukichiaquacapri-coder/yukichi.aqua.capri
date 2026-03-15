import swisseph from 'swisseph';

export default function handler(req, res) {
    const { date, time, lat, lng } = req.query;
    if (!date || !time || !lat || !lng) {
        return res.status(400).json({ error: "Required data missing" });
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 日本時間(GMT+9)を世界時(UT)に変換
    const utHour = hour + (minute / 60) - 9; 
    const julianDay = swisseph.swe_julday(year, month, day, utHour, swisseph.SE_GREG_CAL);

    const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
    const getSign = (long) => {
        const signIndex = Math.floor(long / 30);
        const degree = (long % 30).toFixed(2);
        return `${signs[signIndex]} ${degree}°`;
    };

    // 太陽の位置計算
    swisseph.swe_calc_ut(julianDay, swisseph.SE_SUN, swisseph.SEFLG_SPEED, (res_sun) => {
        const sunInfo = getSign(res_sun.longitude);

        // 月の位置計算
        swisseph.swe_calc_ut(julianDay, swisseph.SE_MOON, swisseph.SEFLG_SPEED, (res_moon) => {
            const moonInfo = getSign(res_moon.longitude);

            // ハウスとアセンダントの計算 ('P'はプラシーダス)
            swisseph.swe_houses(julianDay, latitude, longitude, 'P', (res_houses) => {
                const ascInfo = getSign(res_houses.ascendant);

                res.status(200).json({
                    sun: sunInfo,
                    moon: moonInfo,
                    asc: ascInfo
                });
            });
        });
    });
}
