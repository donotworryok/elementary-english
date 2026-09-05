// ==========================================
// 檔案 2: 聖心小一專屬模組 (app-sh.js)
// 包含：單字測驗、數字是非題、綜合大考、家長口讀測驗
// ==========================================

let shVocabCategory = ''; 
let shVocabPool = []; 
let shVocabCurrent = null;
let shVocabScore = 0; 
let shVocabTotal = 0; 
let isShVocabActive = false;

let shNumScore = 0; 
let shNumCurrentIdx = 0; 
let shNumTotal = 10;
let shNumSpoken = 0; 
let shNumDisplayed = 0; 
let isShNumActive = false;

// 口讀測驗變數
let isShOralActive = false;
let shOralPool = [];
let shOralCurrent = null;
let shOralPassCount = 0;
let shOralTotal = 0;

function setupShVocab(category) {
    shVocabCategory = category;
    isShVocabActive = false;
    document.getElementById('sh-vocab-board').style.display = 'none';
    document.getElementById('sh-vocab-start-screen').style.display = 'block';
    document.getElementById('sh-vocab-end-msg').style.display = 'none';
    
    let titleText = '';
    if(category === 'family') titleText = '👨‍👩‍👧‍👦 家人單字測驗';
    if(category === 'weather') titleText = '🌤️ 天氣單字測驗';
    if(category === 'food') titleText = '🍎 蔬果單字測驗';
    if(category === 'az') titleText = '🔤 A-Z 單字測驗';
    if(category === 'shapes') titleText = '🔺 形狀單字測驗';
    if(category === 'comprehensive') titleText = '🌟 1-6 綜合模擬大考 (隨機抽半)';
    
    document.getElementById('sh-vocab-title').innerText = titleText;
}

function startShVocab() {
    isShVocabActive = true; 
    shVocabScore = 0;
    let fullPool = [];
    
    if (shVocabCategory === 'comprehensive') {
        let masterPool = [
            ...sacredHeartData.family,
            ...sacredHeartData.weather,
            ...sacredHeartData.food,
            ...sacredHeartData.az,
            ...sacredHeartData.shapes
        ];
        masterPool.sort(() => 0.5 - Math.random());
        fullPool = masterPool.slice(0, Math.ceil(masterPool.length / 2));
    } else {
        if (sacredHeartData[shVocabCategory]) {
            fullPool = [...sacredHeartData[shVocabCategory]].sort(() => 0.5 - Math.random());
            fullPool = fullPool.length > 10 ? fullPool.slice(0, 10) : fullPool;
        }
    }
    
    shVocabPool = fullPool;
    shVocabTotal = shVocabPool.length;
    
    document.getElementById('sh-vocab-score').innerText = `🏆 得分: 0`;
    document.getElementById('sh-vocab-start-screen').style.display = 'none';
    document.getElementById('sh-vocab-board').style.display = 'block';
    nextShVocab();
}

function nextShVocab() {
    if(!isShVocabActive) return;
    if(shVocabPool.length === 0) {
        isShVocabActive = false;
        document.getElementById('sh-vocab-board').style.display = 'none';
        document.getElementById('sh-vocab-start-screen').style.display = 'block';
        document.getElementById('sh-vocab-end-msg').innerText = `🎉 測驗完成！\n答對了 ${shVocabScore} / ${shVocabTotal} 題！`;
        document.getElementById('sh-vocab-end-msg').style.display = 'block';
        return;
    }
    
    shVocabCurrent = shVocabPool.pop();
    let currentQNumber = shVocabTotal - shVocabPool.length;
    document.getElementById('sh-vocab-progress').innerText = `📊 第 ${currentQNumber} / ${shVocabTotal} 題`;
    document.getElementById('sh-vocab-zh').innerText = ''; 
    document.getElementById('sh-vocab-feedback').innerText = '請聽發音，選出正確的圖案：';
    document.getElementById('sh-vocab-feedback').style.color = '#7f8c8d';

    let allItems = (shVocabCategory === 'comprehensive') ? [
        ...sacredHeartData.family, 
        ...sacredHeartData.weather, 
        ...sacredHeartData.food, 
        ...sacredHeartData.az, 
        ...sacredHeartData.shapes
    ] : sacredHeartData[shVocabCategory] || [];

    let wrongAnswers = allItems.filter(item => item.en !== shVocabCurrent.en).sort(() => 0.5 - Math.random());
    let options = [shVocabCurrent, wrongAnswers[0], wrongAnswers[1]].sort(() => 0.5 - Math.random());
    
    const optsDiv = document.getElementById('sh-vocab-options'); 
    optsDiv.innerHTML = '';
    
    options.forEach(optObj => {
        const btn = document.createElement('button'); 
        btn.className = 'game-opt-btn'; 
        btn.innerHTML = `<div class="card-img">${optObj.img}</div>`;
        btn.onclick = function() { checkShVocabAnswer(optObj.en, this); }; 
        optsDiv.appendChild(btn);
    });
    
    setTimeout(() => { if(isShVocabActive) speak(shVocabCurrent.en, 'en-US', 0.8); }, 500);
}

function checkShVocabAnswer(ans, btn) {
    if(!isShVocabActive) return;
    const feedbackText = document.getElementById('sh-vocab-feedback');
    if (ans === shVocabCurrent.en) {
        btn.style.backgroundColor = '#2ecc71'; btn.style.color = 'white'; btn.style.borderColor = '#2ecc71';
        feedbackText.innerText = '🎉 答對了！'; feedbackText.style.color = '#27ae60';
        shVocabScore++; 
        document.getElementById('sh-vocab-score').innerText = `🏆 得分: ${shVocabScore}`;
        document.querySelectorAll('#sh-vocab-options .game-opt-btn').forEach(b => b.disabled = true);
        setTimeout(() => { nextShVocab(); }, 1200);
    } else {
        btn.style.backgroundColor = '#e74c3c'; btn.style.color = 'white'; btn.style.borderColor = '#e74c3c'; btn.disabled = true;
        feedbackText.innerText = '❌ 答錯囉，再試一次！'; feedbackText.style.color = '#e74c3c';
    }
}

function playShVocabHint() { 
    if(shVocabCurrent && isShVocabActive) speak(shVocabCurrent.en, 'en-US', 0.8); 
}

// ------------------------------------------
// 🏆 數字聽力是非題
// ------------------------------------------
function startShNumber() {
    isShNumActive = true; shNumScore = 0; shNumCurrentIdx = 0;
    document.getElementById('sh-num-score').innerText = `🏆 得分: 0 / ${shNumTotal}`;
    document.getElementById('sh-num-start-screen').style.display = 'none';
    document.getElementById('sh-num-board').style.display = 'block';
    nextShNumber();
}

function nextShNumber() {
    if(!isShNumActive) return;
    if(shNumCurrentIdx >= shNumTotal) {
        isShNumActive = false;
        document.getElementById('sh-num-board').style.display = 'none';
        document.getElementById('sh-num-start-screen').style.display = 'block';
        document.getElementById('sh-num-end-msg').innerText = `🎉 測驗完成！\n答對了 ${shNumScore} / ${shNumTotal} 題！`;
        document.getElementById('sh-num-end-msg').style.display = 'block';
        return;
    }
    
    shNumCurrentIdx++;
    document.getElementById('sh-num-progress').innerText = `📊 第 ${shNumCurrentIdx} / ${shNumTotal} 題`;
    document.getElementById('sh-num-feedback').innerText = '請判斷對錯：';
    document.getElementById('sh-num-feedback').style.color = '#7f8c8d';
    
    document.querySelectorAll('.tf-btn').forEach(b => b.disabled = false);
    
    shNumSpoken = Math.floor(Math.random() * 100) + 1;
    let isTrueQuestion = Math.random() > 0.5;
    
    if (isTrueQuestion) { 
        shNumDisplayed = shNumSpoken; 
    } else { 
        do { shNumDisplayed = Math.floor(Math.random() * 100) + 1; } while (shNumDisplayed === shNumSpoken); 
    }

    document.getElementById('sh-num-display').innerText = shNumDisplayed;
    setTimeout(() => { if(isShNumActive) speak(shNumSpoken.toString(), 'en-US', 0.8); }, 500);
}

function checkShNumber(userSaidTrue) {
    if(!isShNumActive) return;
    let actuallyTrue = (shNumSpoken === shNumDisplayed);
    const feedbackText = document.getElementById('sh-num-feedback');
    document.querySelectorAll('.tf-btn').forEach(b => b.disabled = true);
    
    if (userSaidTrue === actuallyTrue) {
        feedbackText.innerText = '🎉 答對了！就是 ' + shNumSpoken; 
        feedbackText.style.color = '#27ae60'; shNumScore++;
        document.getElementById('sh-num-score').innerText = `🏆 得分: ${shNumScore} / ${shNumTotal}`;
    } else {
        feedbackText.innerText = '❌ 答錯囉！其實是 ' + shNumSpoken; 
        feedbackText.style.color = '#e74c3c';
    }
    setTimeout(() => { nextShNumber(); }, 1200);
}

function playShNumberHint() { 
    if(isShNumActive) speak(shNumSpoken.toString(), 'en-US', 0.8); 
}

// ==========================================
// 🗣️ 第 8 項 家長口讀測驗邏輯
// ==========================================

function startShOral() {
    isShOralActive = true;
    shOralPassCount = 0;

    // 1. 形狀全部必出 (Shapes 6 題全出)
    let shapesPool = [...sacredHeartData.shapes];

    // 2. 1~5 項（家人、天氣、蔬果、AZ）混和抽出一半
    let otherMaster = [
        ...sacredHeartData.family,
        ...sacredHeartData.weather,
        ...sacredHeartData.food,
        ...sacredHeartData.az
    ];
    otherMaster.sort(() => 0.5 - Math.random());
    let halfOther = otherMaster.slice(0, Math.ceil(otherMaster.length / 2));

    // 3. 結合形狀全部 + 抽出一半的其他題庫，洗牌
    shOralPool = [...shapesPool, ...halfOther].sort(() => 0.5 - Math.random());
    shOralTotal = shOralPool.length;

    document.getElementById('sh-oral-score').innerText = `🏆 Pass: 0 / ${shOralTotal}`;
    document.getElementById('sh-oral-start-screen').style.display = 'none';
    document.getElementById('sh-oral-board').style.display = 'block';
    nextShOral();
}

function nextShOral() {
    if (!isShOralActive) return;

    if (shOralPool.length === 0) {
        isShOralActive = false;
        document.getElementById('sh-oral-board').style.display = 'none';
        document.getElementById('sh-oral-start-screen').style.display = 'block';
        document.getElementById('sh-oral-end-msg').innerText = `🎉 口讀測驗完成！\n通過題數：${shOralPassCount} / ${shOralTotal} 題！`;
        document.getElementById('sh-oral-end-msg').style.display = 'block';
        return;
    }

    shOralCurrent = shOralPool.pop();
    let currentIdx = shOralTotal - shOralPool.length;

    document.getElementById('sh-oral-progress').innerText = `📊 第 ${currentIdx} / ${shOralTotal} 題`;
    document.getElementById('sh-oral-display-img').innerText = shOralCurrent.img;
    document.getElementById('sh-oral-parent-hint').innerText = `(英文: ${shOralCurrent.en} / 中文: ${shOralCurrent.zh})`;
    document.getElementById('sh-oral-feedback').innerText = '請小孩看圖唸出單字：';
    document.getElementById('sh-oral-feedback').style.color = '#7f8c8d';

    document.querySelectorAll('#tab-sh-oral .tf-btn').forEach(b => b.disabled = false);

    // 關鍵：此處絕對不主動呼叫 speak()，讓小孩看圖自己唸
}

// 家長判定 Pass / Fail
function submitOralScore(isPass) {
    if (!isShOralActive) return;
    document.querySelectorAll('#tab-sh-oral .tf-btn').forEach(b => b.disabled = true);
    const feedback = document.getElementById('sh-oral-feedback');

    if (isPass) {
        shOralPassCount++;
        feedback.innerText = `🎉 Pass！唸得真棒：${shOralCurrent.en}`;
        feedback.style.color = '#27ae60';
    } else {
        feedback.innerText = `💪 再加油！正確發音是：${shOralCurrent.en}`;
        feedback.style.color = '#e74c3c';
        // 唸錯時播放一次標準發音示範
        speak(shOralCurrent.en, 'en-US', 0.8);
    }

    document.getElementById('sh-oral-score').innerText = `🏆 Pass: ${shOralPassCount} / ${shOralTotal}`;
    setTimeout(() => { nextShOral(); }, 1400);
}

// 家長或小孩主動按鍵聽示範
function playOralPronunciation() {
    if (shOralCurrent && isShOralActive) {
        speak(shOralCurrent.en, 'en-US', 0.8);
    }
}