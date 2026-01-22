import React, { useState } from 'react';
import { PRODUCTS_MASTER } from '../data/productsData';

/**
 * CultivationSchedule Component
 * - Displays cultivation schedule for each vegetable
 * - Shows growing months, harvest timing, etc.
 * - Scrolled to when product is clicked
 * - 注: 品目マスターデータ(productsData.js)と連携
 *   25品目すべての詳細スケジュールは段階的に追加予定
 */
function CultivationSchedule() {
  const [selectedVegetable, setSelectedVegetable] = useState(null);

  // Listen for product selection from Products component
  React.useEffect(() => {
    const handleSelectVegetable = (event) => {
      setSelectedVegetable(event.detail.productId);
    };

    window.addEventListener('selectVegetable', handleSelectVegetable);
    return () => window.removeEventListener('selectVegetable', handleSelectVegetable);
  }, []);

  const schedules = {
    v1: {
      name: 'ほうれん草',
      color: '#2d5016',
      months: [
        { month: '1月', status: 'harvest', label: '収穫期' },
        { month: '2月', status: 'harvest', label: '収穫期' },
        { month: '3月', status: 'harvest', label: '収穫期' },
        { month: '4月', status: 'off', label: '休止' },
        { month: '5月', status: 'off', label: '休止' },
        { month: '6月', status: 'off', label: '休止' },
        { month: '7月', status: 'off', label: '休止' },
        { month: '8月', status: 'planting', label: '播種' },
        { month: '9月', status: 'growing', label: '成長中' },
        { month: '10月', status: 'growing', label: '成長中' },
        { month: '11月', status: 'harvest', label: '収穫期' },
        { month: '12月', status: 'harvest', label: '収穫期' }
      ],
      description: '秋から冬にかけて収穫。寒冷地での栽培で甘みが増します。',
      characteristics: [
        '土壌温度：15℃～20℃が最適',
        '日光：1日6時間以上必要',
        '水分：土が常に湿った状態を維持',
        '生育期間：約45～60日'
      ]
    },
    v2: {
      name: '水菜',
      color: '#4caf50',
      months: [
        { month: '1月', status: 'harvest', label: '収穫期' },
        { month: '2月', status: 'harvest', label: '収穫期' },
        { month: '3月', status: 'off', label: '休止' },
        { month: '4月', status: 'off', label: '休止' },
        { month: '5月', status: 'planting', label: '播種' },
        { month: '6月', status: 'growing', label: '成長中' },
        { month: '7月', status: 'off', label: '休止' },
        { month: '8月', status: 'planting', label: '播種' },
        { month: '9月', status: 'growing', label: '成長中' },
        { month: '10月', status: 'harvest', label: '収穫期' },
        { month: '11月', status: 'harvest', label: '収穫期' },
        { month: '12月', status: 'harvest', label: '収穫期' }
      ],
      description: '春と秋に2期の栽培。シャキシャキの食感を保つため、収穫後は冷蔵保管推奨。',
      characteristics: [
        '土壌温度：10℃～25℃が最適',
        '日光：1日8時間以上推奨',
        '水分：毎日の水やりが重要',
        '生育期間：約30～45日'
      ]
    },
    v3: {
      name: 'たまねぎ',
      color: '#f4a460',
      months: [
        { month: '1月', status: 'growing', label: '成長中' },
        { month: '2月', status: 'growing', label: '成長中' },
        { month: '3月', status: 'growing', label: '成長中' },
        { month: '4月', status: 'growing', label: '成長中' },
        { month: '5月', status: 'harvest', label: '収穫期' },
        { month: '6月', status: 'off', label: '保存期' },
        { month: '7月', status: 'off', label: '保存期' },
        { month: '8月', status: 'off', label: '保存期' },
        { month: '9月', status: 'planting', label: '苗植え' },
        { month: '10月', status: 'growing', label: '成長中' },
        { month: '11月', status: 'growing', label: '成長中' },
        { month: '12月', status: 'growing', label: '成長中' }
      ],
      description: '長期保存可能で通年販売。完全に乾燥させ、冷暗所で保管。',
      characteristics: [
        '土壌温度：10℃～20℃が最適',
        '日光：1日10時間以上必要',
        '水分：控えめに管理',
        '生育期間：約150～180日'
      ]
    },
    c1: {
      name: '手作りピクルス（無添加）',
      color: '#8b4513',
      months: [
        { month: '1月', status: 'available', label: '販売中' },
        { month: '2月', status: 'available', label: '販売中' },
        { month: '3月', status: 'available', label: '販売中' },
        { month: '4月', status: 'available', label: '販売中' },
        { month: '5月', status: 'available', label: '販売中' },
        { month: '6月', status: 'available', label: '販売中' },
        { month: '7月', status: 'available', label: '販売中' },
        { month: '8月', status: 'available', label: '販売中' },
        { month: '9月', status: 'available', label: '販売中' },
        { month: '10月', status: 'available', label: '販売中' },
        { month: '11月', status: 'available', label: '販売中' },
        { month: '12月', status: 'available', label: '販売中' }
      ],
      description: '通年販売。農園産野菜を使用した無添加ピクルス。冷蔵で保管してください。',
      characteristics: [
        '保存期間：冷蔵で3～6ヶ月',
        '原材料：塩、砂糖、酢（農園産野菜100%）',
        '添加物：一切使用していません',
        '製造：毎月定期製造'
      ]
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planting':
        return '#87ceeb'; // Sky blue
      case 'growing':
        return '#ffd700'; // Gold
      case 'harvest':
        return '#ff6b6b'; // Red
      case 'off':
        return '#ddd'; // Gray
      case 'available':
        return '#90ee90'; // Light green
      default:
        return '#fff';
    }
  };

  const selectedSchedule = selectedVegetable ? schedules[selectedVegetable] : null;

  return (
    <section id="cultivation-schedule" className="cultivation-schedule">
      <div className="container">
        <h3 className="section-title">栽培スケジュール</h3>
        <p className="section-subtitle">
          各野菜の成長から収穫までの時系列をご確認いただけます
        </p>

        {/* Vegetable Selection */}
        <div className="vegetable-selector">
          {Object.entries(schedules).map(([id, schedule]) => (
            <button
              key={id}
              className={`vegetable-btn ${selectedVegetable === id ? 'active' : ''}`}
              onClick={() => setSelectedVegetable(id)}
              style={{
                borderColor: selectedVegetable === id ? schedule.color : '#ddd',
                color: selectedVegetable === id ? schedule.color : '#666'
              }}
            >
              {schedule.name}
            </button>
          ))}
        </div>

        {/* Schedule Display */}
        {selectedSchedule && (
          <div className="schedule-content">
            <article className="schedule-card">
              <div className="schedule-header">
                <h4 style={{ color: selectedSchedule.color }}>
                  {selectedSchedule.name}
                </h4>
                <p className="schedule-description">{selectedSchedule.description}</p>
              </div>

              {/* Timeline */}
              <div className="timeline-container">
                <div className="timeline-grid">
                  {selectedSchedule.months.map((item, index) => (
                    <div
                      key={index}
                      className="timeline-item"
                      style={{
                        backgroundColor: getStatusColor(item.status),
                        borderColor: selectedSchedule.color
                      }}
                    >
                      <div className="timeline-month">{item.month}</div>
                      <div className="timeline-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="timeline-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#87ceeb' }}></span>
                  <span>播種</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#ffd700' }}></span>
                  <span>成長中</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></span>
                  <span>収穫期</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#90ee90' }}></span>
                  <span>販売中</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#ddd' }}></span>
                  <span>休止</span>
                </div>
              </div>

              {/* Characteristics */}
              <div className="schedule-characteristics">
                <h5>栽培条件</h5>
                <ul>
                  {selectedSchedule.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        )}

        {/* Placeholder when no selection */}
        {!selectedSchedule && (
          <div className="schedule-placeholder">
            <p>上記の野菜を選択すると、詳細な栽培スケジュールが表示されます</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CultivationSchedule;
