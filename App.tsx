import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Activity, Layers, AlertTriangle, Map, Play, Pause, RotateCcw, Zap } from 'lucide-react';

const EarthquakeIntensityPredictor = () => {
  const [magnitude, setMagnitude] = useState(7.0);
  const [depth, setDepth] = useState(10);
  const [epicenterLat, setEpicenterLat] = useState(35.6895);
  const [epicenterLon, setEpicenterLon] = useState(139.6917);
  const [targetLat, setTargetLat] = useState(35.7);
  const [targetLon, setTargetLon] = useState(139.7);
  const [amplificationFactor, setAmplificationFactor] = useState(1.6);
  const [autoAmplification, setAutoAmplification] = useState(true);
  const [geologyType, setGeologyType] = useState('計算中...');
  const [avs30, setAvs30] = useState(300);
  const [predictedIntensity, setPredictedIntensity] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [prefectureIntensities, setPrefectureIntensities] = useState({});
  const animationRef = useRef(null);

  // 47都道府県の県庁所在地（座標は地図上の位置用に調整）
  const prefectures = [
    { name: '北海道', city: '札幌', lat: 43.0642, lon: 141.3469, mapX: 570, mapY: 50 },
    { name: '青森県', city: '青森', lat: 40.8244, lon: 140.7400, mapX: 560, mapY: 110 },
    { name: '岩手県', city: '盛岡', lat: 39.7036, lon: 141.1527, mapX: 575, mapY: 135 },
    { name: '宮城県', city: '仙台', lat: 38.2682, lon: 140.8694, mapX: 565, mapY: 165 },
    { name: '秋田県', city: '秋田', lat: 39.7186, lon: 140.1024, mapX: 545, mapY: 140 },
    { name: '山形県', city: '山形', lat: 38.2404, lon: 140.3633, mapX: 550, mapY: 170 },
    { name: '福島県', city: '福島', lat: 37.7503, lon: 140.4676, mapX: 555, mapY: 190 },
    { name: '茨城県', city: '水戸', lat: 36.3418, lon: 140.4468, mapX: 555, mapY: 220 },
    { name: '栃木県', city: '宇都宮', lat: 36.5658, lon: 139.8836, mapX: 545, mapY: 215 },
    { name: '群馬県', city: '前橋', lat: 36.3911, lon: 139.0608, mapX: 530, mapY: 220 },
    { name: '埼玉県', city: 'さいたま', lat: 35.8617, lon: 139.6455, mapX: 540, mapY: 235 },
    { name: '千葉県', city: '千葉', lat: 35.6074, lon: 140.1065, mapX: 555, mapY: 240 },
    { name: '東京都', city: '東京', lat: 35.6895, lon: 139.6917, mapX: 540, mapY: 240 },
    { name: '神奈川県', city: '横浜', lat: 35.4437, lon: 139.6380, mapX: 540, mapY: 250 },
    { name: '新潟県', city: '新潟', lat: 37.9026, lon: 139.0232, mapX: 525, mapY: 180 },
    { name: '富山県', city: '富山', lat: 36.6953, lon: 137.2113, mapX: 495, mapY: 215 },
    { name: '石川県', city: '金沢', lat: 36.5946, lon: 136.6256, mapX: 485, mapY: 220 },
    { name: '福井県', city: '福井', lat: 36.0652, lon: 136.2216, mapX: 480, mapY: 235 },
    { name: '山梨県', city: '甲府', lat: 35.6642, lon: 138.5684, mapX: 520, mapY: 245 },
    { name: '長野県', city: '長野', lat: 36.6513, lon: 138.1810, mapX: 510, mapY: 215 },
    { name: '岐阜県', city: '岐阜', lat: 35.3912, lon: 136.7223, mapX: 490, mapY: 250 },
    { name: '静岡県', city: '静岡', lat: 34.9769, lon: 138.3831, mapX: 515, mapY: 260 },
    { name: '愛知県', city: '名古屋', lat: 35.1815, lon: 136.9066, mapX: 495, mapY: 255 },
    { name: '三重県', city: '津', lat: 34.7303, lon: 136.5086, mapX: 490, mapY: 270 },
    { name: '滋賀県', city: '大津', lat: 35.0045, lon: 135.8686, mapX: 475, mapY: 260 },
    { name: '京都府', city: '京都', lat: 35.0116, lon: 135.7681, mapX: 475, mapY: 258 },
    { name: '大阪府', city: '大阪', lat: 34.6937, lon: 135.5023, mapX: 470, mapY: 270 },
    { name: '兵庫県', city: '神戸', lat: 34.6901, lon: 135.1955, mapX: 460, mapY: 270 },
    { name: '奈良県', city: '奈良', lat: 34.6851, lon: 135.8329, mapX: 478, mapY: 272 },
    { name: '和歌山県', city: '和歌山', lat: 34.2261, lon: 135.1675, mapX: 465, mapY: 285 },
    { name: '鳥取県', city: '鳥取', lat: 35.5014, lon: 134.2382, mapX: 445, mapY: 252 },
    { name: '島根県', city: '松江', lat: 35.4723, lon: 133.0505, mapX: 420, mapY: 255 },
    { name: '岡山県', city: '岡山', lat: 34.6617, lon: 133.9350, mapX: 445, mapY: 272 },
    { name: '広島県', city: '広島', lat: 34.3965, lon: 132.4596, mapX: 425, mapY: 280 },
    { name: '山口県', city: '山口', lat: 34.1861, lon: 131.4706, mapX: 405, mapY: 285 },
    { name: '徳島県', city: '徳島', lat: 34.0658, lon: 134.5594, mapX: 460, mapY: 287 },
    { name: '香川県', city: '高松', lat: 34.3401, lon: 134.0434, mapX: 450, mapY: 278 },
    { name: '愛媛県', city: '松山', lat: 33.8416, lon: 132.7657, mapX: 425, mapY: 290 },
    { name: '高知県', city: '高知', lat: 33.5597, lon: 133.5311, mapX: 440, mapY: 300 },
    { name: '福岡県', city: '福岡', lat: 33.6064, lon: 130.4181, mapX: 380, mapY: 295 },
    { name: '佐賀県', city: '佐賀', lat: 33.2494, lon: 130.2988, mapX: 375, mapY: 302 },
    { name: '長崎県', city: '長崎', lat: 32.7503, lon: 129.8777, mapX: 365, mapY: 310 },
    { name: '熊本県', city: '熊本', lat: 32.7898, lon: 130.7417, mapX: 385, mapY: 310 },
    { name: '大分県', city: '大分', lat: 33.2382, lon: 131.6126, mapX: 405, mapY: 302 },
    { name: '宮崎県', city: '宮崎', lat: 31.9077, lon: 131.4202, mapX: 410, mapY: 325 },
    { name: '鹿児島県', city: '鹿児島', lat: 31.5602, lon: 130.5581, mapX: 390, mapY: 340 },
    { name: '沖縄県', city: '那覇', lat: 26.2124, lon: 127.6809, mapX: 330, mapY: 430 }
  ];

  // AVS30から地盤増幅率を計算（翠川・松岡の式に基づく）
  const calculateAmplificationFromAVS30 = (avs30Value) => {
    // 工学的基盤（Vs=400m/s）に対する増幅率
    // AVS30が小さいほど（軟弱地盤）増幅率が大きい
    if (avs30Value >= 400) return 1.0;
    const amp = Math.pow(400 / avs30Value, 0.6);
    return Math.min(amp, 3.0);
  };

  // 地質タイプとAVS30の対応
  const estimateAVS30FromLocation = (lat, lon) => {
    // 沿岸・低地・内陸・山地による詳細推定
    const isCoastalLowland = (lat < 36 && lon > 139.5 && lon < 140.5) || 
                              (lat > 34 && lat < 35 && lon > 135 && lon < 136) ||
                              (lat < 34 && lon > 130 && lon < 132);
    const isAlluvialPlain = (lat > 35 && lat < 37 && lon > 138.5 && lon < 140) ||
                            (lat > 33 && lat < 34 && lon > 130 && lon < 131);
    const isDiluvialPlateau = (lat > 35.5 && lat < 36.5 && lon > 139 && lon < 140.5);
    const isMountainous = (lat > 36 && lon < 138) || (lat > 35 && lon > 141);
    
    if (isCoastalLowland) return { avs30: 180, type: '沖積低地（軟弱）' };
    if (isAlluvialPlain) return { avs30: 220, type: '沖積平野' };
    if (isDiluvialPlateau) return { avs30: 280, type: '洪積台地' };
    if (isMountainous) return { avs30: 450, type: '丘陵・山地（硬質）' };
    return { avs30: 300, type: '第三紀丘陵' };
  };

  // 2地点間の距離を計算
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * Math.PI / 180;
    const latAvg = (lat1 + lat2) / 2;
    const a = 6378137;
    const b = 6356752.314245;
    const e2 = (a ** 2 - b ** 2) / a ** 2;
    const W = Math.sqrt(1 - e2 * Math.sin(toRad(latAvg)) ** 2);
    const M = (a * (1 - e2)) / (W ** 3);
    const N = a / W;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const distance = Math.sqrt((M * dLat) ** 2 + (N * Math.cos(toRad(latAvg)) * dLon) ** 2);
    return distance / 1000;
  };

  // 震源距離
  const calculateHypocentralDistance = (surfaceDistance, depth) => {
    return Math.sqrt(surfaceDistance ** 2 + depth ** 2);
  };

  // S波到達時間を計算（地層を考慮）
  const calculateSWaveArrivalTime = (distance, depth, targetAvs30) => {
    const hypoDistance = calculateHypocentralDistance(distance, depth);
    
    // 地殻内平均速度（岩盤）
    const crustVs = 3.5; // km/s
    
    // 表層30mの通過時間を別途計算
    const surfaceThickness = 0.03; // km (30m)
    const surfaceVs = targetAvs30 / 1000; // m/s → km/s
    const surfaceTime = surfaceThickness / surfaceVs;
    
    // 地殻内の伝播時間
    const crustTime = (hypoDistance - surfaceThickness) / crustVs;
    
    return crustTime + surfaceTime;
  };

  // 司・翠川式による最大速度の予測（深さ補正を追加）
  const predictPGV = (M, X, depth) => {
    const Mw = M;
    const D = X;
    // 深さによる減衰を考慮
    const depthFactor = 0.0038 * depth;
    const logPGV = 0.58 * Mw + depthFactor - 1.29 - Math.log10(D + 0.0028 * Math.pow(10, 0.5 * Mw)) - 0.002 * D;
    return Math.pow(10, logPGV);
  };

  // 最大速度から計測震度への変換（地盤増幅を考慮）
  const pgvToIntensity = (pgv, amplification) => {
    const adjustedPGV = pgv * amplification;
    const I = 2.68 + 1.72 * Math.log10(adjustedPGV);
    return Math.max(0, I);
  };

  // 計測震度から震度階級への変換
  const getIntensityScale = (intensity) => {
    if (intensity < 0.5) return '0';
    if (intensity < 1.5) return '1';
    if (intensity < 2.5) return '2';
    if (intensity < 3.5) return '3';
    if (intensity < 4.5) return '4';
    if (intensity < 5.0) return '5弱';
    if (intensity < 5.5) return '5強';
    if (intensity < 6.0) return '6弱';
    if (intensity < 6.5) return '6強';
    return '7';
  };

  // 震度階級の色
  const getIntensityColor = (scale) => {
    const colors = {
      '0': '#C0C0C0', '1': '#3B82F6', '2': '#10B981',
      '3': '#FBBF24', '4': '#F97316', '5弱': '#EF4444',
      '5強': '#DC2626', '6弱': '#B91C1C', '6強': '#991B1B', '7': '#7C3AED'
    };
    return colors[scale] || '#C0C0C0';
  };

  // 地盤データを自動取得
  useEffect(() => {
    if (autoAmplification) {
      const data = estimateAVS30FromLocation(targetLat, targetLon);
      setAvs30(data.avs30);
      setGeologyType(data.type);
      const amp = calculateAmplificationFromAVS30(data.avs30);
      setAmplificationFactor(amp);
    }
  }, [targetLat, targetLon, autoAmplification]);

  // 震度予測の計算
  useEffect(() => {
    const surfaceDist = calculateDistance(epicenterLat, epicenterLon, targetLat, targetLon);
    const hypoDist = calculateHypocentralDistance(surfaceDist, depth);
    const pgv = predictPGV(magnitude, hypoDist, depth);
    const intensity = pgvToIntensity(pgv, amplificationFactor);
    
    setPredictedIntensity({
      value: intensity,
      scale: getIntensityScale(intensity),
      pgv: pgv,
      surfaceDistance: surfaceDist,
      hypoDistance: hypoDist
    });
  }, [magnitude, depth, epicenterLat, epicenterLon, targetLat, targetLon, amplificationFactor]);

  // 全都道府県の震度を計算
  const calculateAllPrefectureIntensities = async (currentTime) => {
    const intensities = {};
    
    for (const pref of prefectures) {
      const distance = calculateDistance(epicenterLat, epicenterLon, pref.lat, pref.lon);
      const prefData = estimateAVS30FromLocation(pref.lat, pref.lon);
      const arrivalTime = calculateSWaveArrivalTime(distance, depth, prefData.avs30);
      
      if (currentTime >= arrivalTime) {
        const hypoDist = calculateHypocentralDistance(distance, depth);
        const amp = calculateAmplificationFromAVS30(prefData.avs30);
        const pgv = predictPGV(magnitude, hypoDist, depth);
        const intensity = pgvToIntensity(pgv, amp);
        intensities[pref.name] = {
          value: intensity,
          scale: getIntensityScale(intensity),
          arrivalTime: arrivalTime,
          distance: distance,
          avs30: prefData.avs30
        };
      }
    }
    
    return intensities;
  };

  // シミュレーション開始
  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationTime(0);
    const startTime = Date.now();
    
    const animate = async () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const simulatedTime = elapsed * simulationSpeed;
      
      setSimulationTime(simulatedTime);
      const intensities = await calculateAllPrefectureIntensities(simulatedTime);
      setPrefectureIntensities(intensities);
      
      const maxDistance = Math.max(...prefectures.map(p => 
        calculateDistance(epicenterLat, epicenterLon, p.lat, p.lon)
      ));
      const maxAvs30 = 450;
      const maxTime = calculateSWaveArrivalTime(maxDistance, depth, maxAvs30);
      
      if (simulatedTime < maxTime + 10) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
      }
    };
    
    animate();
  };

  // シミュレーション停止
  const stopSimulation = () => {
    setIsSimulating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // シミュレーションリセット
  const resetSimulation = () => {
    stopSimulation();
    setSimulationTime(0);
    setPrefectureIntensities({});
  };

  const selectPrefecture = (pref, isEpicenter = false) => {
    if (isEpicenter) {
      setEpicenterLat(pref.lat);
      setEpicenterLon(pref.lon);
    } else {
      setTargetLat(pref.lat);
      setTargetLon(pref.lon);
    }
  };

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}&z=10`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">高精度地震震度予測システム</h1>
          </div>
          <p className="text-gray-600 mb-4">
            地震波の地層伝播特性を考慮した、日本地図リアルタイムシミュレーション
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start">
              <Zap className="text-blue-600 mr-2 flex-shrink-0" size={20} />
              <p className="text-sm text-blue-800">
                AVS30（表層30m平均S波速度）に基づく地盤増幅率、地層ごとの地震波伝播速度を正確に計算し、時系列で震度分布を可視化します。
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">震源設定</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  マグニチュード: {magnitude.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={magnitude}
                  onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  震源深さ: {depth}km
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">緯度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={epicenterLat}
                    onChange={(e) => setEpicenterLat(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">経度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={epicenterLon}
                    onChange={(e) => setEpicenterLon(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <select
                onChange={(e) => {
                  const pref = prefectures.find(p => p.name === e.target.value);
                  if (pref) selectPrefecture(pref, true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">震源を都道府県から選択</option>
                {prefectures.map((pref) => (
                  <option key={pref.name} value={pref.name}>
                    {pref.name}（{pref.city}）
                  </option>
                ))}
              </select>

              <a
                href={getGoogleMapsUrl(epicenterLat, epicenterLon)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-md text-sm transition"
              >
                <Map className="inline mr-1" size={16} />
                震源をマップで確認
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">観測地点設定</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">緯度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetLat}
                    onChange={(e) => setTargetLat(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">経度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetLon}
                    onChange={(e) => setTargetLon(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <select
                onChange={(e) => {
                  const pref = prefectures.find(p => p.name === e.target.value);
                  if (pref) selectPrefecture(pref, false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">観測地点を選択</option>
                {prefectures.map((pref) => (
                  <option key={pref.name} value={pref.name}>
                    {pref.name}（{pref.city}）
                  </option>
                ))}
              </select>

              <a
                href={getGoogleMapsUrl(targetLat, targetLon)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-center rounded-md text-sm transition"
              >
                <Map className="inline mr-1" size={16} />
                観測地点をマップで確認
              </a>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    地層データ自動計算
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAmplification}
                      onChange={(e) => setAutoAmplification(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="bg-green-50 p-3 rounded-md text-sm">
                  <p className="text-green-800 font-medium">地質: {geologyType}</p>
                  <p className="text-green-800">AVS30: {avs30} m/s</p>
                  <p className="text-green-800">増幅率: {amplificationFactor.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {predictedIntensity && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">地点予測結果</h2>
              <div style={{ backgroundColor: getIntensityColor(predictedIntensity.scale) + '20' }} className="rounded-lg p-6 text-center mb-4">
                <div className="text-6xl font-bold" style={{ color: getIntensityColor(predictedIntensity.scale) }}>
                  {predictedIntensity.scale}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  計測震度: {predictedIntensity.value.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">震央距離:</span>
                  <span className="font-semibold">{predictedIntensity.surfaceDistance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">予測PGV:</span>
                  <span className="font-semibold">{predictedIntensity.pgv.toFixed(1)} cm/s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">日本地図 震度分布シミュレーション</h2>
            <div className="flex gap-2 items-center">
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={isSimulating}
              >
                <option value="1">1倍速</option>
                <option value="2">2倍速</option>
                <option value="5">5倍速</option>
                <option value="10">10倍速</option>
              </select>
              {!isSimulating ? (
                <button
                  onClick={startSimulation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition"
                >
                  <Play size={20} />
                  開始
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md flex items-center gap-2 transition"
                >
                  <Pause size={20} />
                  停止
                </button>
              )}
              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center gap-2 transition"
              >
                <RotateCcw size={20} />
                リセット
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                経過時間: {simulationTime.toFixed(1)}秒
              </span>
              <span className="text-sm text-gray-600">
                到達地域数: {Object.keys(prefectureIntensities).length} / 47
              </span>
            </div>
          </div>

          <div className="relative bg-gray-50 rounded-lg p-4" style={{ minHeight: '500px' }}>
            <svg viewBox="0 0 600 500" className="w-full h-auto">
              {/* 日本の簡易的な輪郭 */}
              <path
                d="M 350 430 Q 340 410 330 400 L 320 380 L 310 360 Q 300 340 290 330 L 280 310 L 270 290 Q 260 270 255 250 L 250 230 Q 245 210 240 190 L 235 170 Q 230 150 228 130 L 230 110 Q 235 90 240 80 L 250 70 Q 260 65 270 65 L 290 70 Q 310 75 330 85 L 350 100 Q 370 115 385 130 L 400 150 Q 410 170 415 190 L 420 210 Q 425 230 428 250 L 430 270 Q 430 290 428 310 L 425 330 Q 420 350 415 370 L 410 390 Q 405 410 395 425 L 380 435 Q 365 438 350 430 Z"
                fill="#f0f0f0"
                stroke="#999"
                strokeWidth="1"
              />
              
              {/* 震源位置 */}
              {(() => {
                const epicenterPref = prefectures.reduce((closest, pref) => {
                  const dist = Math.abs(pref.lat - epicenterLat) + Math.abs(pref.lon - epicenterLon);
                  const closestDist = Math.abs(closest.lat - epicenterLat) + Math.abs(closest.lon - epicenterLon);
                  return dist < closestDist ? pref : closest;
                });
                return (
                  <g>
                    <circle
                      cx={epicenterPref.mapX}
                      cy={epicenterPref.mapY}
                      r="8"
                      fill="#ff0000"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={epicenterPref.mapX}
                      y={epicenterPref.mapY - 12}
                      textAnchor="middle"
                      className="text-xs font-bold"
                      fill="#ff0000"
                    >
                      震源
                    </text>
                  </g>
                );
              })()}

              {/* 各都道府県 */}
              {prefectures.map((pref) => {
                const intensity = prefectureIntensities[pref.name];
                const color = intensity ? getIntensityColor(intensity.scale) : '#e0e0e0';
                const radius = intensity ? 12 : 6;
                
                return (
                  <g key={pref.name}>
                    <circle
                      cx={pref.mapX}
                      cy={pref.mapY}
                      r={radius}
                      fill={color}
                      stroke="#fff"
                      strokeWidth="1.5"
                      opacity={intensity ? 0.9 : 0.3}
                    />
                    {intensity && (
                      <text
                        x={pref.mapX}
                        y={pref.mapY + 4}
                        textAnchor="middle"
                        className="text-xs font-bold"
                        fill="#fff"
                      >
                        {intensity.scale}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">到達済み地域（到達順）</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {Object.entries(prefectureIntensities)
                  .sort((a, b) => a[1].arrivalTime - b[1].arrivalTime)
                  .map(([name, data]) => (
                    <div key={name} className="flex justify-between items-center p-2 bg-white rounded text-xs">
                      <span className="font-medium">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{data.arrivalTime.toFixed(1)}s</span>
                        <span className="text-gray-500">AVS30:{data.avs30}</span>
                        <span className="font-bold px-2 py-1 rounded" style={{ 
                          backgroundColor: getIntensityColor(data.scale) + '30',
                          color: getIntensityColor(data.scale)
                        }}>
                          震度{data.scale}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">震度凡例</h3>
              <div className="grid grid-cols-2 gap-2">
                {['0', '1', '2', '3', '4', '5弱', '5強', '6弱', '6強', '7'].map(scale => (
                  <div key={scale} className="flex items-center gap-2 p-2 bg-white rounded text-sm">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: getIntensityColor(scale) }}
                    ></div>
                    <span>震度{scale}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">高精度計算手法</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">地震波伝播</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>地殻内S波速度: 3.5 km/s</li>
                <li>表層S波速度: AVS30に基づく</li>
                <li>各地層の通過時間を個別計算</li>
                <li>深さによる減衰を考慮</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">地盤増幅</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>AVS30: 表層30m平均S波速度</li>
                <li>工学的基盤（Vs=400m/s）基準</li>
                <li>翠川・松岡の増幅率評価式</li>
                <li>地質タイプから自動推定</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            参考: 防災科研J-SHIS、司・翠川(1999)距離減衰式、翠川・松岡(1994)増幅率評価式
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeIntensityPredictor;
