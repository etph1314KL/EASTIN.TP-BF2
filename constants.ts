
import { MenuCategory, MenuItem, RoomConfig, RoomType, Language } from './types';

// --- UI Translations ---
export const UI_TEXT: Record<string, Record<Language, string>> = {
  mainTitle: {
    zh: '主餐',
    en: 'Main Course',
    jp: 'メインディッシュ',
    ko: '메인 메뉴'
  },
  drinkTitle: {
    zh: '飲品',
    en: 'Drinks',
    jp: 'お飲み物',
    ko: '음료'
  },
  westernLabel: {
    zh: '麥當勞 (隔天07:00)',
    en: 'McDonald Set (07:00 AM)',
    jp: 'マクドナルド (翌朝 07:00)',
    ko: '맥도날드 (내일 07:00)'
  },
  chineseLabel: {
    zh: '傳統中式 (隔天08:00)',
    en: 'Traditional Chinese Set (08:00 AM)',
    jp: '伝統中華式 (翌朝 08:00)',
    ko: '전통 중식 (내일 08:00)'
  },
  selectMain: {
    zh: '選擇主餐...',
    en: 'Select Main Course...',
    jp: 'メインをお選びください...',
    ko: '메인 메뉴 선택...'
  },
  selectDrink: {
    zh: '選擇飲品...',
    en: 'Select Drink...',
    jp: 'お飲み物をお選びください...',
    ko: '음료 선택...'
  },
  none: {
    zh: '不需要',
    en: 'No Need',
    jp: '必要ありません',
    ko: '필요 없습니다'
  },
  normalSugar: {
    zh: '正常',
    en: 'Regular',
    jp: '甘さあり',
    ko: '기본 당도'
  },
  noSugar: {
    zh: '無糖',
    en: 'Sugar-Free',
    jp: '無糖',
    ko: '무설탕'
  },
  addOnBtn: {
    zh: '我想加點！',
    en: 'I want to add an order!',
    jp: '追加注文したい！',
    ko: '추가 주문하기!'
  },
  addOnPrice: {
    zh: '加購1份 NT.150元 (含主餐*1 + 飲品*1) ，請先於櫃台結帳！',
    en: 'Extra Order: NT$150 (Main*1 + Drink*1) - Please pay at front desk first!',
    jp: '追加料金: NT$150 (メイン*1 + 飲み物*1) - 先にフロントでお支払いください！',
    ko: '추가 요금: NT$150 (메인*1 + 음료*1) - 프론트에서 먼저 결제해 주세요!'
  },
  hashBrownNote: {
    zh: '附薯餅1塊',
    en: 'With 1 Hash Brown',
    jp: 'ハッシュブラウン1個付き',
    ko: '해시브라운 1개 포함'
  },
  callTitle: {
    zh: '餐點抵達櫃台-取餐通知',
    en: 'Meal Pickup Notification',
    jp: 'お食事受取通知',
    ko: '음식 도착 안내 알림'
  },
  callNote: {
    zh: '若勾選則標示為 C (Call)，若有點餐但不勾選則標示為 NC (No Call)。若不需要CALL 我們會協助保留餐點到中午12點，您12點前過來取餐即可！',
    en: 'Check to request a "Call" (C). Unchecked means "No Call" (NC). If unchecked, meals will be held until 12:00 PM.',
    jp: 'チェックを入れると『C（Call）』、チェックを入れない場合は『NC（No Call）』として扱われます。チェックを入れない場合、食事は正午12時までお預かりいたします。',
    ko: '체크하시면 전화 알림(C)을 드립니다. 체크하지 않으시면 알림 없음(NC)입니다. 알림이 필요 없으신 경우, 식사는 12:00까지 보관해 드립니다.'
  },
  roomNotePlaceholder: {
    zh: '請注意餐點是合作夥伴大量製作，恕無法客製！',
    en: 'Please be aware that the meals are mass-produced by our partner and cannot be customized.',
    jp: 'お食事は提携パートナーによる大量調理のため、カスタマイズはできかねます。',
    ko: '식사는 협력 업체에서 대량으로 준비되므로 맞춤 제공은 불가합니다.'
  },
  noteLabel: {
    zh: '備註',
    en: 'Notes',
    jp: '備考',
    ko: '비고'
  },
  combineLabel: {
    zh: '和其他房間放一起',
    en: 'Group the meals together',
    jp: 'お食事を一緒にまとめてご用意',
    ko: '식사를 함께 모아 주세요'
  },
  combineDesc: {
    zh: '輸入房號 (例如: 101)',
    en: 'Enter Room No.',
    jp: '部屋番号を入力',
    ko: '객실 번호 입력'
  },
  roomNoPlaceholder: {
    zh: '房號',
    en: 'Room No.',
    jp: '部屋番号',
    ko: '객실 번호'
  },
  cancel: { zh: '取消', en: 'Cancel', jp: 'キャンセル', ko: '취소' },
  confirm: { zh: '確認餐點', en: 'Confirm Order', jp: '注文確定', ko: '주문 확인' },
  clear: { zh: '清除', en: 'Clear', jp: 'クリア', ko: '초기화' },
  mealSet: { zh: '餐點', en: 'Set', jp: 'セット', ko: '세트' },
  addOnLabel: { zh: '加點1份餐', en: 'Order one additional meal', jp: '1人前追加注文', ko: '추가 주문 1세트' },
  
  mcdonalds: { zh: '麥當勞', en: "McDonald's", jp: 'マクドナルド', ko: '맥도날드' },
  chineseSimple: { zh: '傳統中式', en: 'Traditional Chinese', jp: '伝統中華式', ko: '전통 중식' },
  
  // Payment Alert
  paymentAlertMsg: {
    zh: '請先和櫃檯人員結帳，謝謝！',
    en: 'Please settle the payment with the front desk staff first, thank you!',
    jp: '先にフロントでのお支払いをお願い致します。',
    ko: '프론트 데스크에서 먼저 결제해 주십시오. 감사합니다!'
  },
  iUnderstand: {
    zh: '我知道了！',
    en: 'I understand!',
    jp: '了解しました！',
    ko: '알겠습니다!'
  },

  // Voucher Alert
  voucherAlertMsg: {
    zh: '餐券兌換時間為06:00-10:30麥當勞早餐時段，使用只限戳章日期逾期無效！',
    en: 'Redemption time: 06:00-10:30 (Breakfast hours). Valid only on stamped date, expired invalid!',
    jp: '引換時間：06:00-10:30（朝食時間帯）。スタンプの日付のみ有効、期限切れは無効です！',
    ko: '교환 시간: 06:00-10:30 (조식 시간). 스탬프 날짜에만 유효하며, 기간 만료 시 무효입니다!'
  },

  // New Status Options
  noBreakfast: { 
    zh: '明天不需要早餐', 
    en: 'No Need Breakfast Tomorrow', 
    jp: '明日の朝食は不要', 
    ko: '내일 조식 필요 없음' 
  },
  voucher: { 
    zh: '麥當勞餐券', 
    en: "McDonald's Voucher", 
    jp: 'マクドナルドクーポン', 
    ko: '맥도날드 쿠폰' 
  },
  
  // Visual Menu
  viewMenu: {
    zh: '查看菜單圖',
    en: 'View Menu',
    jp: 'メニューを見る',
    ko: '메뉴 보기'
  },
  clickToSelect: {
    zh: '點擊圖片選項可直接填入',
    en: 'Click on image items to select',
    jp: '画像をタップして選択',
    ko: '이미지를 클릭하여 선택하세요'
  },

  // Guest View Translations
  guestEntryBtn: {
    zh: '我要點早餐！',
    en: "Order Breakfast！",
    jp: '朝食を注文する',
    ko: '조식 주문하기'
  },
  guestEntrySub: {
    zh: '( 早餐需於前一日23:00前下訂)',
    en: '( Placed before 11:00 PM on the previous day. )',
    jp: '( 朝食のご予約は前日23:00までにお願いいたします )',
    ko: '( 조식은 전날 23:00까지 예약해 주셔야 합니다. )'
  },
  enterRoom: {
    zh: '請輸入房號',
    en: 'Enter Room No.',
    jp: '部屋番号を入力',
    ko: '객실 번호 입력'
  },
  invalidRoom: {
    zh: '無效的房號',
    en: 'Invalid Room',
    jp: '無効な部屋番号',
    ko: '잘못된 객실 번호'
  },
  // New Error for No Breakfast Authorization
  noBreakfastAuth: {
    zh: '您的訂單沒有包含早餐，要加購請洽工作人員！加購1份 NT.150元 (含主餐*1 + 飲品*1)',
    en: 'Your order does not include breakfast, please contact staff to add it! Extra Order: NT$150 (Main*1 + Drink*1)',
    jp: '朝食が含まれていません。追加についてはスタッフにお問い合わせください。追加料金: NT$150 (メイン*1 + 飲み物*1)',
    ko: '조식이 포함되어 있지 않습니다. 추가하려면 직원에게 문의하십시오!추가 요금: NT$150 (메인*1 + 음료*1)'
  },
  // Concise title for the popup
  noBreakfastWarn: {
    zh: '此房號不含早餐',
    en: 'No Breakfast Included',
    jp: '朝食は含まれていません',
    ko: '조식이 포함되어 있지 않습니다'
  },

  // Staff Name Input
  staffNameLabel: {
    zh: '服務人員姓名',
    en: 'Staff Name',
    jp: 'スタッフ名',
    ko: '직원 이름'
  },
  enterName: {
    zh: '請輸入您的名字',
    en: 'Enter your name',
    jp: '名前を入力してください',
    ko: '이름을 입력하세요'
  },

  // Availability Warnings
  mcdonaldsClosedMsg: {
    zh: '麥當勞因假期無提供，請見諒！',
    en: "McDonald's is unavailable due to holiday. Sorry for the inconvenience.",
    jp: '休日のため、マクドナルドの提供はございません。',
    ko: '휴일로 인해 맥도날드는 제공되지 않습니다. 양해 부탁드립니다.'
  },
  chineseClosedMsg: {
    zh: '中式餐點因假期無提供，請見諒！',
    en: "Traditional Chinese breakfast is unavailable due to holiday. Sorry for the inconvenience.",
    jp: '休日のため、中華式朝食の提供はございません。',
    ko: '휴일로 인해 중식 조식은 제공되지 않습니다. 양해 부탁드립니다.'
  },
  itemUnavailable: {
    zh: '(暫停供應)',
    en: '(Sold Out)',
    jp: '(売り切れ)',
    ko: '(품절)'
  }
};

// --- Menu Data (Updated to match images) ---

export const WESTERN_MAINS: MenuItem[] = [
  { 
    id: 'w1', code: '(01)', name: '麥香魚', category: MenuCategory.WESTERN, type: 'main',
    translations: { en: 'Filet-O-Fish', jp: 'フィレオフィッシュ', ko: '맥 피쉬버거' }
  },
  { 
    id: 'w2', code: '(02)', name: '豬肉滿福堡', category: MenuCategory.WESTERN, type: 'main',
    translations: { en: 'Pork McMuffin', jp: 'ポークマフィン', ko: '포크 맥머핀' }
  },
  { 
    id: 'w3', code: '(03)', name: '番茄嫩蛋焙果堡', category: MenuCategory.WESTERN, type: 'main',
    translations: { en: 'Bagel Burger with Cheese', jp: 'トマトと卵のベーグル', ko: '토마토 치즈계란 베이글' }
  },
  { 
    id: 'w4', code: '(04)', name: '現烤焙果+乳酪起司抹醬及草莓醬', category: MenuCategory.WESTERN, type: 'main',
    translations: { en: 'Bagel (incl. Butter & Strawberry Jam)', jp: 'ベーグル (クリームチーズ＆イチゴジャム)', ko: '베이글 (크림치즈 & 딸기잼)' }
  },
];

export const WESTERN_DRINKS: MenuItem[] = [
  { 
    id: 'wa', code: '(A)', name: '冰檸檬紅茶', category: MenuCategory.WESTERN, type: 'drink',
    translations: { en: 'Iced Tea', jp: 'アイスティー', ko: '아이스티 ' }
  },
  { 
    id: 'wb', code: '(B)', name: '冰咖啡', category: MenuCategory.WESTERN, type: 'drink',
    translations: { en: 'Americano(Iced)', jp: 'アイスコーヒー', ko: '아이스 아메리카노' }
  },
  { 
    id: 'wc', code: '(C)', name: '柳橙汁', category: MenuCategory.WESTERN, type: 'drink',
    translations: { en: 'Orange Juice', jp: 'オレンジジュース', ko: '오렌지 주스' }
  },
];

export const CHINESE_MAINS: MenuItem[] = [
  { 
    id: 'c6', code: '(06)', name: '里肌肉飯糰', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Rice Ball with Pork', jp: '豚ロースおにぎり', ko: '돼지고기 주먹밥' }
  },
  { 
    id: 'c7', code: '(07)', name: '燒餅油條', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Baked Wheat Cake with Fried Bread Stick', jp: '焼きパンと揚げパン', ko: '샤오빙(구운 빵) & 요우티아오' }
  },
  { 
    id: 'c8', code: '(08)', name: '蘿蔔糕+蛋', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Turnip Cake with Fried Egg', jp: '大根餅と卵', ko: '무떡과 계란' }
  },
  { 
    id: 'c9', code: '(09)', name: '小籠包', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Dumplings with Pork', jp: '小籠包', ko: '샤오롱바오' }
  },
  { 
    id: 'c10', code: '(10)', name: '素飯糰', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Vegetarian Rice Ball', jp: 'ベジタリアンおにぎり', ko: '채식 주먹밥' }
  },
  { 
    id: 'c11', code: '(11)', name: '饅頭夾蔥蛋', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Steamed Bread with Green Onions&Egg', jp: 'ネギ卵入り饅頭', ko: '파계란 찐빵' }
  },
  { 
    id: 'c12', code: '(12)', name: '起司蛋餅', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Cheese Egg Cake', jp: 'チーズ卵クレープ', ko: '치즈 딴빙(계란전병)' }
  },
  { 
    id: 'c13', code: '(13)', name: '燒餅蔥爆豬', category: MenuCategory.CHINESE, type: 'main',
    translations: { en: 'Baked Wheat Cake with Fried Pork', jp: 'ネギ豚焼きパン', ko: '파볶음돼지고기 샤오빙(구운 빵)' }
  },
];

export const CHINESE_DRINKS: MenuItem[] = [
  { 
    id: 'ce', code: '(E)', name: '冰豆漿', category: MenuCategory.CHINESE, type: 'drink', hasSugarOption: true,
    translations: { en: 'Iced Soybean Milk', jp: 'アイス豆乳', ko: '아이스 또우장(두유)' }
  },
  { 
    id: 'cf', code: '(F)', name: '冰米漿', category: MenuCategory.CHINESE, type: 'drink',
    translations: { en: 'Iced Rice & Peanut Milk', jp: 'アイス花生入り米ドリンク', ko: '아이스 미장(미숫가루)' }
  },
  { 
    id: 'cg', code: '(G)', name: '熱豆漿', category: MenuCategory.CHINESE, type: 'drink', hasSugarOption: true,
    translations: { en: 'Hot Soybean Milk', jp: 'ホット豆乳', ko: '따뜻한 또우장(두유)' }
  },
  { 
    id: 'ch', code: '(H)', name: '熱米漿', category: MenuCategory.CHINESE, type: 'drink',
    translations: { en: 'Hot Rice & Peanut Milk', jp: 'ホッ花生入り米ドリンク', ko: '따뜻한 미장(미숫가루)' }
  },
];

// --- Room Generation Logic ---

const ROOM_EXCLUSIONS = [
  104, 114, 124, 134,
  204, 214,
  234,
  254, 264
];

const QUAD_ROOMS = [117, 118, 119, 207, 212];
const SINGLE_ROOMS_RANGES = [
  { start: 231, end: 239 },
  { start: 251, end: 268 }
];

const isInSingleRange = (num: number) => {
  return SINGLE_ROOMS_RANGES.some(r => num >= r.start && num <= r.end);
};

const getRoomType = (roomNum: number): RoomType => {
  if (QUAD_ROOMS.includes(roomNum)) return RoomType.QUAD;
  if (isInSingleRange(roomNum)) return RoomType.SINGLE;
  return RoomType.DOUBLE;
};

const getRoomQuota = (type: RoomType): number => {
  switch (type) {
    case RoomType.QUAD: return 4;
    case RoomType.SINGLE: return 1;
    default: return 2;
  }
};

const generateRooms = (): RoomConfig[] => {
  const rooms: RoomConfig[] = [];
  const ranges = [
    { start: 100, end: 139 },
    { start: 200, end: 222 },
    { start: 231, end: 239 },
    { start: 251, end: 268 }
  ];

  ranges.forEach(range => {
    for (let i = range.start; i <= range.end; i++) {
      if (!ROOM_EXCLUSIONS.includes(i)) {
        const type = getRoomType(i);
        const prefix = Math.floor(i / 100);
        // Logic: 1xx is 14F, 2xx is 13F
        const floor = prefix === 1 ? 14 : 13;

        rooms.push({
          id: i.toString(),
          type: type,
          defaultQuota: getRoomQuota(type),
          floor: floor
        });
      }
    }
  });

  return rooms;
};

export const ALL_ROOMS = generateRooms();
export const ALL_MENU_ITEMS = [...WESTERN_MAINS, ...WESTERN_DRINKS, ...CHINESE_MAINS, ...CHINESE_DRINKS];

// --- Visual Menu Configuration ---

interface Hotspot {
    itemId: string | 'none_main' | 'none_drink';
    top: number; // Percentage
    left: number; // Percentage
    width: number; // Percentage
    height: number; // Percentage
}

export const VISUAL_MENU_CONFIG = {
    western: {
        image: 'https://www.eastin-taipei.com.tw/upload/fac_b/253a22bcfaad09d46a1a27b26d41f19a.jpg',
        hotspots: [
            // Mains Row
            { itemId: 'w1', top: 32, left: -10, width: 22, height: 25 },
            { itemId: 'w2', top: 32, left: 12, width: 22, height: 25 },
            { itemId: 'w3', top: 32, left: 50, width: 22, height: 25 },
            { itemId: 'w4', top: 32, left: 82, width: 22, height: 25 },
            // Drinks Row
            { itemId: 'wa', top: 72, left: 5, width: 28, height: 25 },
            { itemId: 'wb', top: 72, left: 36, width: 28, height: 25 },
            { itemId: 'wc', top: 72, left: 67, width: 28, height: 25 },
        ] as Hotspot[],
        // Button positions for 'None'
        noneButtons: [
            { type: 'main', top: 25, left: 40 }, // Above Main Title
            { type: 'drink', top: 65, left: 40 }  // Above Drink Title
        ]
    },
    chinese: {
        image: 'https://www.eastin-taipei.com.tw/upload/fac_b/3662c2875fb2a3c7e0c56c204b13dd0c.jpg',
        hotspots: [
            // Row 1 (6-9)
            { itemId: 'c6', top: 18, left: 21, width: 19, height: 22 },
            { itemId: 'c7', top: 18, left: 40, width: 19, height: 22 },
            { itemId: 'c8', top: 18, left: 59, width: 19, height: 22 },
            { itemId: 'c9', top: 18, left: 78, width: 19, height: 22 },
            // Row 2 (10-13)
            { itemId: 'c10', top: 45, left: 21, width: 19, height: 22 },
            { itemId: 'c11', top: 45, left: 40, width: 19, height: 22 },
            { itemId: 'c12', top: 45, left: 59, width: 19, height: 22 },
            { itemId: 'c13', top: 45, left: 78, width: 19, height: 22 },
            // Drinks (E, F, G, H) - Approximate 2 columns
            { itemId: 'ce', top: 73, left: 25, width: 20, height: 8 }, // Iced Soy
            { itemId: 'cg', top: 82, left: 25, width: 20, height: 8 }, // Hot Soy
            { itemId: 'cf', top: 73, left: 55, width: 20, height: 8 }, // Iced Rice
            { itemId: 'ch', top: 82, left: 55, width: 20, height: 8 }, // Hot Rice
        ] as Hotspot[],
        noneButtons: [
            { type: 'main', top: 40, left: 2 }, // Left of Main Area
            { type: 'drink', top: 80, left: 2 }  // Left of Drink Area
        ]
    }
};
