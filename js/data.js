// --- AEIOU 字典區 ---
const longExamples = {
    'A': [ {en: 'maid', zh: '女僕', c: ['m','ai','d']}, {en: 'paint', zh: '畫畫', c: ['p','ai','n','t']}, {en: 'rain', zh: '雨', c: ['r','ai','n']}, {en: 'bay', zh: '海灣', c: ['b','ay']}, {en: 'hay', zh: '乾草', c: ['h','ay']}, {en: 'pay', zh: '支付', c: ['p','ay']}, {en: 'cake', zh: '蛋糕', c: ['c','a','k','e']}, {en: 'gate', zh: '大門', c: ['g','a','t','e']}, {en: 'tape', zh: '膠帶', c: ['t','a','p','e']} ],
    'E': [ {en: 'bean', zh: '豆子', c: ['b','ea','n']}, {en: 'leaf', zh: '葉子', c: ['l','ea','f']}, {en: 'seat', zh: '座位', c: ['s','ea','t']}, {en: 'jeep', zh: '吉普車', c: ['j','ee','p']}, {en: 'bee', zh: '蜜蜂', c: ['b','ee']}, {en: 'weed', zh: '雜草', c: ['w','ee','d']}, {en: 'alley', zh: '小巷', c: ['a','ll','ey']}, {en: 'hockey', zh: '曲棍球', c: ['h','o','ck','ey']}, {en: 'key', zh: '鑰匙', c: ['k','ey']} ],
    'I': [ {en: 'die', zh: '凋零', c: ['d','ie']}, {en: 'pie', zh: '派', c: ['p','ie']}, {en: 'tie', zh: '領帶', c: ['t','ie']}, {en: 'high', zh: '高的', c: ['h','igh']}, {en: 'knight', zh: '騎士', c: ['kn','igh','t']}, {en: 'light', zh: '燈光', c: ['l','igh','t']}, {en: 'vine', zh: '藤蔓', c: ['v','i','n','e']}, {en: 'ice', zh: '冰塊', c: ['i','c','e']}, {en: 'time', zh: '時間', c: ['t','i','m','e']} ],
    'O': [ {en: 'soap', zh: '肥皂', c: ['s','oa','p']}, {en: 'boat', zh: '小船', c: ['b','oa','t']}, {en: 'road', zh: '道路', c: ['r','oa','d']}, {en: 'toe', zh: '腳趾', c: ['t','oe']}, {en: 'doe', zh: '母鹿', c: ['d','oe']}, {en: 'hoe', zh: '鋤頭', c: ['h','oe']}, {en: 'bone', zh: '骨頭', c: ['b','o','n','e']}, {en: 'mole', zh: '鼴鼠', c: ['m','o','l','e']}, {en: 'rope', zh: '繩索', c: ['r','o','p','e']} ],
    'U': [ {en: 'pew', zh: '長椅', c: ['p','ew']}, {en: 'new', zh: '新的', c: ['n','ew']}, {en: 'stew', zh: '燉菜', c: ['s','t','ew']}, {en: 'hue', zh: '色彩', c: ['h','ue']}, {en: 'cue', zh: '提示', c: ['c','ue']}, {en: 'rescue', zh: '救援', c: ['r','e','s','c','ue']}, {en: 'huge', zh: '巨大的', c: ['h','u','g','e']}, {en: 'cute', zh: '可愛的', c: ['c','u','t','e']}, {en: 'tube', zh: '管子', c: ['t','u','b','e']} ]
};

const shortExamples = {
    'A': [ {en: 'pan', zh: '平底鍋', c: ['p','a','n']}, {en: 'can', zh: '罐頭', c: ['c','a','n']}, {en: 'fan', zh: '風扇', c: ['f','a','n']}, {en: 'map', zh: '地圖', c: ['m','a','p']}, {en: 'cap', zh: '帽子', c: ['c','a','p']}, {en: 'tap', zh: '輕敲', c: ['t','a','p']}, {en: 'hat', zh: '帽子', c: ['h','a','t']}, {en: 'bat', zh: '蝙蝠', c: ['b','a','t']}, {en: 'fat', zh: '胖的', c: ['f','a','t']} ],
    'E': [ {en: 'bed', zh: '床', c: ['b','e','d']}, {en: 'red', zh: '紅色', c: ['r','e','d']}, {en: 'Ted', zh: '泰德', c: ['T','e','d']}, {en: 'pen', zh: '筆', c: ['p','e','n']}, {en: 'hen', zh: '母雞', c: ['h','e','n']}, {en: 'ten', zh: '十', c: ['t','e','n']}, {en: 'jet', zh: '噴射機', c: ['j','e','t']}, {en: 'pet', zh: '寵物', c: ['p','e','t']}, {en: 'wet', zh: '濕的', c: ['w','e','t']} ],
    'I': [ {en: 'wig', zh: '假髮', c: ['w','i','g']}, {en: 'big', zh: '大的', c: ['b','i','g']}, {en: 'pig', zh: '豬', c: ['p','i','g']}, {en: 'pin', zh: '大頭針', c: ['p','i','n']}, {en: 'bin', zh: '垃圾桶', c: ['b','i','n']}, {en: 'fin', zh: '魚鰭', c: ['f','i','n']}, {en: 'rip', zh: '撕裂', c: ['r','i','p']}, {en: 'dip', zh: '沾', c: ['d','i','p']}, {en: 'hip', zh: '臀部', c: ['h','i','p']} ],
    'O': [ {en: 'top', zh: '頂部', c: ['t','o','p']}, {en: 'cop', zh: '警察', c: ['c','o','p']}, {en: 'mop', zh: '拖把', c: ['m','o','p']}, {en: 'dot', zh: '點', c: ['d','o','t']}, {en: 'hot', zh: '熱的', c: ['h','o','t']}, {en: 'pot', zh: '鍋子', c: ['p','o','t']}, {en: 'box', zh: '箱子', c: ['b','o','x']}, {en: 'fox', zh: '狐狸', c: ['f','o','x']}, {en: 'pox', zh: '痘', c: ['p','o','x']} ],
    'U': [ {en: 'rub', zh: '摩擦', c: ['r','u','b']}, {en: 'cub', zh: '幼獸', c: ['c','u','b']}, {en: 'tub', zh: '浴缸', c: ['t','u','b']}, {en: 'hug', zh: '擁抱', c: ['h','u','g']}, {en: 'bug', zh: '蟲', c: ['b','u','g']}, {en: 'mug', zh: '馬克杯', c: ['m','u','g']}, {en: 'run', zh: '跑', c: ['r','u','n']}, {en: 'bun', zh: '小圓麵包', c: ['b','u','n']}, {en: 'sun', zh: '太陽', c: ['s','u','n']} ]
};

const mixedExamples = { 'A':[], 'E':[], 'I':[], 'O':[], 'U':[] };
['A','E','I','O','U'].forEach(v => { mixedExamples[v] = [...longExamples[v], ...shortExamples[v]]; });

const longGameWords = [
    {w: 'maid', b: 'm ????? d', a: 'ai', zh: '女僕'}, {w: 'paint', b: 'p ????? n t', a: 'ai', zh: '畫畫'}, {w: 'rain', b: 'r ????? n', a: 'ai', zh: '雨'}, {w: 'bay', b: 'b ?????', a: 'ay', zh: '海灣'}, {w: 'hay', b: 'h ?????', a: 'ay', zh: '乾草'}, {w: 'pay', b: 'p ?????', a: 'ay', zh: '支付'}, {w: 'cake', b: 'c ????? k e', a: 'a', zh: '蛋糕'}, {w: 'gate', b: 'g ????? t e', a: 'a', zh: '大門'}, {w: 'tape', b: 't ????? p e', a: 'a', zh: '膠帶'},
    {w: 'bean', b: 'b ????? n', a: 'ea', zh: '豆子'}, {w: 'leaf', b: 'l ????? f', a: 'ea', zh: '葉子'}, {w: 'seat', b: 's ????? t', a: 'ea', zh: '座位'}, {w: 'jeep', b: 'j ????? p', a: 'ee', zh: '吉普車'}, {w: 'bee', b: 'b ?????', a: 'ee', zh: '蜜蜂'}, {w: 'weed', b: 'w ????? d', a: 'ee', zh: '雜草'}, {w: 'alley', b: 'a l l ?????', a: 'ey', zh: '小巷'}, {w: 'hockey', b: 'h o c k ?????', a: 'ey', zh: '曲棍球'}, {w: 'key', b: 'k ?????', a: 'ey', zh: '鑰匙'},
    {w: 'die', b: 'd ?????', a: 'ie', zh: '凋零'}, {w: 'pie', b: 'p ?????', a: 'ie', zh: '派'}, {w: 'tie', b: 't ?????', a: 'ie', zh: '領帶'}, {w: 'high', b: 'h ?????', a: 'igh', zh: '高的'}, {w: 'knight', b: 'k n ????? t', a: 'igh', zh: '騎士'}, {w: 'light', b: 'l ????? t', a: 'igh', zh: '燈光'}, {w: 'vine', b: 'v ????? n e', a: 'i', zh: '藤蔓'}, {w: 'ice', b: '????? c e', a: 'i', zh: '冰塊'}, {w: 'time', b: 't ????? m e', a: 'i', zh: '時間'},
    {w: 'soap', b: 's ????? p', a: 'oa', zh: '肥皂'}, {w: 'boat', b: 'b ????? t', a: 'oa', zh: '小船'}, {w: 'road', b: 'r ????? d', a: 'oa', zh: '道路'}, {w: 'toe', b: 't ?????', a: 'oe', zh: '腳趾'}, {w: 'doe', b: 'd ?????', a: 'oe', zh: '母鹿'}, {w: 'hoe', b: 'h ?????', a: 'oe', zh: '鋤頭'}, {w: 'bone', b: 'b ????? n e', a: 'o', zh: '骨頭'}, {w: 'mole', b: 'm ????? l e', a: 'o', zh: '鼴鼠'}, {w: 'rope', b: 'r ????? p e', a: 'o', zh: '繩索'},
    {w: 'pew', b: 'p ?????', a: 'ew', zh: '長椅'}, {w: 'new', b: 'n ?????', a: 'ew', zh: '新的'}, {w: 'stew', b: 's t ?????', a: 'ew', zh: '燉菜'}, {w: 'hue', b: 'h ?????', a: 'ue', zh: '色彩'}, {w: 'cue', b: 'c ?????', a: 'ue', zh: '提示'}, {w: 'rescue', b: 'r e s c ?????', a: 'ue', zh: '救援'}, {w: 'huge', b: 'h ????? g e', a: 'u', zh: '巨大的'}, {w: 'cute', b: 'c ????? t e', a: 'u', zh: '可愛的'}, {w: 'tube', b: 't ????? b e', a: 'u', zh: '管子'}
];
const longGameAnswers = ['ai','ay','a','ea','ee','ey','ie','igh','i','oa','oe','o','ew','ue','u'];

const shortGameWords = [
    {w: 'pan', b: 'p ????? n', a: 'a', zh: '平底鍋'}, {w: 'can', b: 'c ????? n', a: 'a', zh: '罐頭'}, {w: 'fan', b: 'f ????? n', a: 'a', zh: '風扇'}, {w: 'map', b: 'm ????? p', a: 'a', zh: '地圖'}, {w: 'cap', b: 'c ????? p', a: 'a', zh: '帽子'}, {w: 'tap', b: 't ????? p', a: 'a', zh: '輕敲'}, {w: 'hat', b: 'h ????? t', a: 'a', zh: '帽子'}, {w: 'bat', b: 'b ????? t', a: 'a', zh: '蝙蝠'}, {w: 'fat', b: 'f ????? t', a: 'a', zh: '胖的'},
    {w: 'bed', b: 'b ????? d', a: 'e', zh: '床'}, {w: 'red', b: 'r ????? d', a: 'e', zh: '紅色'}, {w: 'Ted', b: 'T ????? d', a: 'e', zh: '泰德'}, {w: 'pen', b: 'p ????? n', a: 'e', zh: '筆'}, {w: 'hen', b: 'h ????? n', a: 'e', zh: '母雞'}, {w: 'ten', b: 't ????? n', a: 'e', zh: '十'}, {w: 'jet', b: 'j ????? t', a: 'e', zh: '噴射機'}, {w: 'pet', b: 'p ????? t', a: 'e', zh: '寵物'}, {w: 'wet', b: 'w ????? t', a: 'e', zh: '濕的'},
    {w: 'wig', b: 'w ????? g', a: 'i', zh: '假髮'}, {w: 'big', b: 'b ????? g', a: 'i', zh: '大的'}, {w: 'pig', b: 'p ????? g', a: 'i', zh: '豬'}, {w: 'pin', b: 'p ????? n', a: 'i', zh: '大頭針'}, {w: 'bin', b: 'b ????? n', a: 'i', zh: '垃圾桶'}, {w: 'fin', b: 'f ????? n', a: 'i', zh: '魚鰭'}, {w: 'rip', b: 'r ????? p', a: 'i', zh: '撕裂'}, {w: 'dip', b: 'd ????? p', a: 'i', zh: '沾'}, {w: 'hip', b: 'h ????? p', a: 'i', zh: '臀部'},
    {w: 'top', b: 't ????? p', a: 'o', zh: '頂部'}, {w: 'cop', b: 'c ????? p', a: 'o', zh: '警察'}, {w: 'mop', b: 'm ????? p', a: 'o', zh: '拖把'}, {w: 'dot', b: 'd ????? t', a: 'o', zh: '點'}, {w: 'hot', b: 'h ????? t', a: 'o', zh: '熱的'}, {w: 'pot', b: 'p ????? t', a: 'o', zh: '鍋子'}, {w: 'box', b: 'b ????? x', a: 'o', zh: '箱子'}, {w: 'fox', b: 'f ????? x', a: 'o', zh: '狐狸'}, {w: 'pox', b: 'p ????? x', a: 'o', zh: '痘'},
    {w: 'rub', b: 'r ????? b', a: 'u', zh: '摩擦'}, {w: 'cub', b: 'c ????? b', a: 'u', zh: '幼獸'}, {w: 'tub', b: 't ????? b', a: 'u', zh: '浴缸'}, {w: 'hug', b: 'h ????? g', a: 'u', zh: '擁抱'}, {w: 'bug', b: 'b ????? g', a: 'u', zh: '蟲'}, {w: 'mug', b: 'm ????? g', a: 'u', zh: '馬克杯'}, {w: 'run', b: 'r ????? n', a: 'u', zh: '跑'}, {w: 'bun', b: 'b ????? n', a: 'u', zh: '小圓麵包'}, {w: 'sun', b: 's ????? n', a: 'u', zh: '太陽'}
];
const shortGameAnswers = ['a', 'e', 'i', 'o', 'u'];
const mixedGameWords = [...longGameWords, ...shortGameWords];
const mixedGameAnswers = [...new Set([...longGameAnswers, ...shortGameAnswers])];

// --- 動詞資料庫 ---
const verbData = [
    { v: 'read', s: 'I read a book.', zh: '我讀一本書' }, { v: 'write', s: 'I write a letter.', zh: '我寫一封信' }, { v: 'look', s: 'I look at an ant.', zh: '我看著一隻螞蟻' },
    { v: 'ride', s: 'I ride a bike.', zh: '我騎腳踏車' }, { v: 'open', s: 'I open the door.', zh: '我開門' }, { v: 'color', s: 'I color the picture.', zh: '我給圖片著色' },
    { v: 'listen', s: 'I listen to a bird.', zh: '我聽鳥叫聲' }, { v: 'eat', s: 'I eat a sandwich.', zh: '我吃三明治' }, { v: 'draw', s: 'I draw a bird.', zh: '我畫一隻鳥' }
];
const verbQuizData = verbData.map(d => ({ v: d.v, sentence: d.s, zh: d.zh }));
const allVerbsList = verbQuizData.map(d => d.v);

// --- 聖心小一檢定資料庫 (NEW) ---
// --- 聖心小一檢定資料庫 (加入 Emoji 圖像) ---
const sacredHeartData = {
    family: [
        {en: 'mother', zh: '媽媽', img: '👩'}, {en: 'father', zh: '爸爸', img: '👨'},
        {en: 'sister', zh: '姊妹', img: '👧'}, {en: 'brother', zh: '兄弟', img: '👦'},
        {en: 'grandmother', zh: '奶奶/外婆', img: '👵'}, {en: 'grandfather', zh: '爺爺/外公', img: '👴'}
    ],
    weather: [
        {en: 'sunny', zh: '晴天', img: '☀️'}, {en: 'cloudy', zh: '多雲', img: '☁️'},
        {en: 'rainy', zh: '雨天', img: '🌧️'}, {en: 'windy', zh: '刮風', img: '🌬️'}
    ],
    food: [
        {en: 'watermelon', zh: '西瓜', img: '🍉'}, {en: 'banana', zh: '香蕉', img: '🍌'},
        {en: 'strawberry', zh: '草莓', img: '🍓'}, {en: 'carrot', zh: '胡蘿蔔', img: '🥕'},
        {en: 'apple', zh: '蘋果', img: '🍎'}, {en: 'lemon', zh: '檸檬', img: '🍋'}
    ],

    az: [
        {en: 'apple', zh: '蘋果', img: '🍎'}, {en: 'ball', zh: '球', img: '⚽'},
        {en: 'cat', zh: '貓', img: '🐱'}, {en: 'duck', zh: '鴨子', img: '🦆'},
        {en: 'elephant', zh: '大象', img: '🐘'}, {en: 'fish', zh: '魚', img: '🐟'},
        {en: 'girl', zh: '女孩', img: '👧'}, {en: 'hand', zh: '手', img: '🖐️'},
        {en: 'ice cream', zh: '冰淇淋', img: '🍦'}, {en: 'jar', zh: '罐子', img: '🫙'},
        {en: 'key', zh: '鑰匙', img: '🔑'}, {en: 'leaf', zh: '葉子', img: '🍃'},
        {en: 'monkey', zh: '猴子', img: '🐒'}, {en: 'nest', zh: '鳥巢', img: '🪹'},
        {en: 'octopus', zh: '章魚', img: '🐙'}, {en: 'pig', zh: '豬', img: '🐷'},
        {en: 'queen', zh: '皇后', img: '👸'}, {en: 'ruler', zh: '尺', img: '📏'},
        {en: 'strawberry', zh: '草莓', img: '🍓'}, {en: 'umbrella', zh: '雨傘', img: '☂️'}, 
        {en: 'van', zh: '廂型車', img: '🚐'}, {en: 'wheel', zh: '輪子', img: '🛞'}, 
        {en: 'xylophone', zh: '木琴', img: '🎹'}, {en: 'yarn', zh: '毛線', img: '🧶'}, 
        {en: 'zebra', zh: '斑馬', img: '🦓'}
    ],
    shapes: [
        {en: 'circle', zh: '圓形', img: '🔴'},
        {en: 'square', zh: '正方形', img: '🟦'},
        {en: 'triangle', zh: '三角形', img: '🔺'},
        {en: 'oval', zh: '橢圓形', img: '🥚'},
        {en: 'diamond', zh: '菱形', img: '🔶'},
        {en: 'rectangle', zh: '長方形', img: '🎫'}
    ]
};