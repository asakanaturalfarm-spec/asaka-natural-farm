// ============================================
// 配送・送料計算システム
// index.htmlの配送情報に基づく実装
// ============================================

// ============================================
// 配送設定（index.htmlの情報を基準）
// ============================================
const SHIPPING_CONFIG = {
    // 配送業者
    carrier: 'ヤマト運輸クール便（冷蔵）',
    
    // 送料
    fee: 500,  // 全国一律 ¥500
    
    // 送料無料ライン（未設定の場合はnull）
    freeShippingThreshold: null,
    
    // 最低購入金額
    minimumOrder: 4500,
    
    // 発送日
    shippingDays: ['月曜日', '水曜日', '金曜日'],
    shippingDayNumbers: [1, 3, 5], // 0=日曜, 1=月曜, ..., 6=土曜
    
    // 配送日時指定
    timeSlots: [
        { value: '', label: '指定なし' },
        { value: 'morning', label: '午前中（8:00〜12:00）' },
        { value: '14-16', label: '14:00〜16:00' },
        { value: '16-18', label: '16:00〜18:00' },
        { value: '18-20', label: '18:00〜20:00' },
        { value: '19-21', label: '19:00〜21:00' }
    ],
    
    // 配達可能エリア
    deliveryAreas: {
        '全国': { regions: '全国', fee: 500, isAvailable: true }
    },
    
    // 配送除外地域（離島など）
    excludedAreas: [
        '沖縄県一部離島',
        '北海道一部離島'
    ],
    
    // 注意事項
    notes: [
        'より新鮮な野菜をお届けするために、すべての野菜は水洗いをしていません。',
        '収穫状況により発送日が前後する場合がございます。',
        '配送日時指定をご希望の場合は、ご注文時の備考欄にご記入ください。',
        '天候や収穫状況により、一部商品の変更や欠品が発生する場合がございます。'
    ]
};

// ============================================
// 送料計算
// ============================================
function calculateShippingFee(subtotal, prefecture = null, items = []) {
    const result = {
        fee: 0,
        freeShipping: false,
        message: '',
        breakdown: {
            baseFee: SHIPPING_CONFIG.fee,
            discount: 0,
            finalFee: 0
        }
    };
    
    // 1. 最低注文金額チェック
    if (subtotal < SHIPPING_CONFIG.minimumOrder) {
        result.fee = 0;
        result.message = `最低注文金額（¥${SHIPPING_CONFIG.minimumOrder.toLocaleString()}）に達していません`;
        result.cannotShip = true;
        return result;
    }
    
    // 2. 送料無料ラインチェック
    if (SHIPPING_CONFIG.freeShippingThreshold && subtotal >= SHIPPING_CONFIG.freeShippingThreshold) {
        result.fee = 0;
        result.freeShipping = true;
        result.message = `送料無料（¥${SHIPPING_CONFIG.freeShippingThreshold.toLocaleString()}以上）`;
        result.breakdown.discount = SHIPPING_CONFIG.fee;
        result.breakdown.finalFee = 0;
        return result;
    }
    
    // 3. 基本送料
    result.fee = SHIPPING_CONFIG.fee;
    result.breakdown.finalFee = SHIPPING_CONFIG.fee;
    result.message = `${SHIPPING_CONFIG.carrier} - 全国一律`;
    
    // 4. 除外地域チェック（都道府県情報がある場合）
    if (prefecture) {
        const isExcluded = SHIPPING_CONFIG.excludedAreas.some(area => 
            prefecture.includes(area) || area.includes(prefecture)
        );
        
        if (isExcluded) {
            result.cannotShip = true;
            result.message = `申し訳ございません。${prefecture}は配送対象外地域です。`;
        }
    }
    
    return result;
}

// ============================================
// 発送日計算
// ============================================
function calculateShippingDate(orderDate = new Date()) {
    const nextShippingDates = [];
    const today = new Date(orderDate);
    
    // 次の3回の発送日を計算
    for (let i = 0; i < 14; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        if (SHIPPING_CONFIG.shippingDayNumbers.includes(dayOfWeek)) {
            nextShippingDates.push({
                date: checkDate,
                dayName: SHIPPING_CONFIG.shippingDays[SHIPPING_CONFIG.shippingDayNumbers.indexOf(dayOfWeek)],
                formatted: formatDate(checkDate)
            });
            
            if (nextShippingDates.length >= 3) break;
        }
    }
    
    return {
        nextShipping: nextShippingDates[0],
        upcomingDates: nextShippingDates,
        note: '収穫後、当日発送'
    };
}

// ============================================
// 配達予定日計算
// ============================================
function calculateDeliveryDate(shippingDate, prefecture = null) {
    const shipping = new Date(shippingDate);
    
    // 地域別の配達日数（ヤマトクール便の標準日数）
    const deliveryDays = {
        '北海道': 2,
        '青森県': 2, '岩手県': 2, '宮城県': 2, '秋田県': 2, '山形県': 2, '福島県': 1,
        '茨城県': 1, '栃木県': 1, '群馬県': 1, '埼玉県': 1, '千葉県': 1, '東京都': 1, '神奈川県': 1,
        '新潟県': 1, '富山県': 1, '石川県': 2, '福井県': 2, '山梨県': 1, '長野県': 1,
        '岐阜県': 1, '静岡県': 1, '愛知県': 1, '三重県': 1,
        '滋賀県': 1, '京都府': 1, '大阪府': 1, '兵庫県': 1, '奈良県': 1, '和歌山県': 1,
        '鳥取県': 2, '島根県': 2, '岡山県': 2, '広島県': 2, '山口県': 2,
        '徳島県': 2, '香川県': 2, '愛媛県': 2, '高知県': 2,
        '福岡県': 2, '佐賀県': 2, '長崎県': 3, '熊本県': 2, '大分県': 2, '宮崎県': 2, '鹿児島県': 2,
        '沖縄県': 3
    };
    
    const daysToAdd = prefecture ? (deliveryDays[prefecture] || 2) : 2;
    
    const delivery = new Date(shipping);
    delivery.setDate(shipping.getDate() + daysToAdd);
    
    return {
        date: delivery,
        formatted: formatDate(delivery),
        daysFromShipping: daysToAdd,
        estimatedTimeRange: `${formatDate(delivery)} - ${formatDate(new Date(delivery.getTime() + 86400000))}`
    };
}

// ============================================
// 配送情報の検証
// ============================================
function validateShippingInfo(shippingInfo) {
    const errors = [];
    
    // 必須項目チェック
    if (!shippingInfo.postalCode || !shippingInfo.postalCode.match(/^\d{7}$/)) {
        errors.push('郵便番号が正しくありません（7桁の数字）');
    }
    
    if (!shippingInfo.prefecture) {
        errors.push('都道府県を選択してください');
    }
    
    if (!shippingInfo.city || shippingInfo.city.length < 2) {
        errors.push('市区町村を入力してください');
    }
    
    if (!shippingInfo.address || shippingInfo.address.length < 3) {
        errors.push('番地・建物名を入力してください');
    }
    
    // 配送除外地域チェック
    if (shippingInfo.prefecture) {
        const isExcluded = SHIPPING_CONFIG.excludedAreas.some(area => 
            shippingInfo.prefecture.includes(area) || 
            (shippingInfo.city && shippingInfo.city.includes('離島'))
        );
        
        if (isExcluded) {
            errors.push(`${shippingInfo.prefecture}は配送対象外地域です`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ============================================
// 注文金額の総合計算（税込・送料込）
// ============================================
function calculateOrderTotal(cartItems, shippingInfo = null) {
    // 商品小計（税抜）
    let subtotal = 0;
    let totalTax = 0;
    
    const itemDetails = cartItems.map(item => {
        // DBから商品情報を取得（改ざん防止）
        const product = typeof getProductPriceFromDatabase === 'function' 
            ? getProductPriceFromDatabase(item.id)
            : item;
        
        const itemSubtotal = product.price * item.quantity;
        const taxRate = product.taxRate || 0.08; // 軽減税率8%
        const itemTax = Math.floor(itemSubtotal * taxRate);
        const itemTotal = itemSubtotal + itemTax;
        
        subtotal += itemSubtotal;
        totalTax += itemTax;
        
        return {
            ...product,
            quantity: item.quantity,
            subtotal: itemSubtotal,
            tax: itemTax,
            total: itemTotal
        };
    });
    
    // 送料計算
    const shippingCalc = calculateShippingFee(
        subtotal, 
        shippingInfo?.prefecture,
        cartItems
    );
    
    // 送料の消費税（標準税率10%）
    const shippingTax = shippingCalc.fee > 0 ? Math.floor(shippingCalc.fee * 0.10) : 0;
    const shippingTotal = shippingCalc.fee + shippingTax;
    
    // 最終合計
    const finalTotal = subtotal + totalTax + shippingTotal;
    
    return {
        items: itemDetails,
        subtotal: subtotal,
        tax: totalTax,
        subtotalWithTax: subtotal + totalTax,
        shipping: {
            fee: shippingCalc.fee,
            tax: shippingTax,
            total: shippingTotal,
            freeShipping: shippingCalc.freeShipping,
            message: shippingCalc.message,
            cannotShip: shippingCalc.cannotShip
        },
        total: finalTotal,
        canCheckout: !shippingCalc.cannotShip && subtotal >= SHIPPING_CONFIG.minimumOrder
    };
}

// ============================================
// ユーティリティ関数
// ============================================
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[d.getDay()];
    
    return `${year}年${month}月${day}日（${weekday}）`;
}

// 次の営業日を取得（土日を除く）
function getNextBusinessDay(date = new Date(), daysToAdd = 1) {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < daysToAdd) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        
        // 土日をスキップ
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }
    
    return result;
}

// ============================================
// 配送情報表示用データ生成
// ============================================
function getShippingDisplayInfo() {
    return {
        carrier: SHIPPING_CONFIG.carrier,
        fee: `¥${SHIPPING_CONFIG.fee.toLocaleString()}`,
        feeRaw: SHIPPING_CONFIG.fee,
        minimumOrder: `¥${SHIPPING_CONFIG.minimumOrder.toLocaleString()}`,
        minimumOrderRaw: SHIPPING_CONFIG.minimumOrder,
        shippingDays: SHIPPING_CONFIG.shippingDays.join('・'),
        timeSlots: SHIPPING_CONFIG.timeSlots,
        notes: SHIPPING_CONFIG.notes,
        freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold 
            ? `¥${SHIPPING_CONFIG.freeShippingThreshold.toLocaleString()}`
            : null
    };
}

// ============================================
// グローバル公開
/**
 * shipping-calculator.js
 * 安積自然農園 配送・送料計算システム
 * - 配送業者・送料・配送日・エリア等の設定と送料計算
 * - index.htmlの配送情報に基づく実装
 *
 * 【編集・拡張方針】
 * - 配送仕様変更やエリア追加時は本ファイルを編集
 * - 共通化できる処理は asaka-hub.js へ
 */

// ============================================
if (typeof window !== 'undefined') {
    window.ShippingCalculator = {
        config: SHIPPING_CONFIG,
        calculateShippingFee,
        calculateShippingDate,
        calculateDeliveryDate,
        validateShippingInfo,
        calculateOrderTotal,
        getShippingDisplayInfo,
        getNextBusinessDay
    };
    
    console.log('[配送システム] 初期化完了');
    console.log('[配送設定]', {
        carrier: SHIPPING_CONFIG.carrier,
        fee: SHIPPING_CONFIG.fee,
        minimumOrder: SHIPPING_CONFIG.minimumOrder,
        shippingDays: SHIPPING_CONFIG.shippingDays
    });
}

// Node.js環境での export（開発用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SHIPPING_CONFIG,
        calculateShippingFee,
        calculateShippingDate,
        calculateDeliveryDate,
        validateShippingInfo,
        calculateOrderTotal,
        getShippingDisplayInfo
    };
}
