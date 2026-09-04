// ==========================================
// 檔案 2: 聖心小一專屬模組 (app-sh.js)
// 包含：單字聽力測驗、數字是非題
// ==========================================

// --- 聖心模組專屬變數 ---
let shVocabCategory = ''; let shVocabPool = []; let shVocabCurrent = null;
let shVocabScore = 0; let shVocabTotal = 0; let isShVocabActive = false;

let shNumScore = 0; let shNumCurrentIdx = 0; let shNumTotal = 10;
let shNumSpoken = 0; let shNumDisplayed = 0; let isShNumActive = false;

// ------------------------------------------
// 🏆 單字聽力測驗邏輯
// ------------------------------------------
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
    if(category === 'comprehensive') titleText = '🌟 聖心小一綜合模擬大考';
    document.getElementById('sh-vocab-title').innerText = titleText;
}

function startShVocab() {
    isShVocabActive = true; shVocabScore = 0;
    
    let fullPool = [];
    
    // 如果是綜合考試，將 1~6 項（家人、天氣、蔬果、AZ、形狀）全部打包
    if (shVocabCategory === 'comprehensive') {
        let masterPool = [
            ...sacredHeartData.family,
            ...sacredHeartData.weather,
            ...sacredHeartData.food,
            ...sacredHeartData.az,
            ...sacredHeartData.shapes
        ];
        masterPool.sort(() => 0.5 - Math.random());
        
        // 算出全部總題數，然後「抽出一半」（無條件進位或四捨五入）
        let halfCount = Math.ceil(masterPool.length / 2);
        fullPool = masterPool.slice(0, halfCount);
        
    } else {
        fullPool = [...sacredHeartData[shVocabCategory]].sort(() => 0.5 - Math.random());
        fullPool = fullPool.length > 10 ? fullPool.slice(0, 10) : fullPool;
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

    // 抓取錯誤選項：如果是綜合考試，從全部題庫中找錯誤選項；否則從當前類別找
    let allItems = (shVocabCategory === 'comprehensive') ? [
        ...sacredHeartData.family, ...sacredHeartData.weather, ...sacredHeartData.food, ...sacredHeartData.az, ...sacredHeartData.shapes
    ] : sacredHeartData[shVocabCategory];

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
function playShVocabHint() { if(shVocabCurrent && isShVocabActive) speak(shVocabCurrent.en, 'en-US', 0.8); }


// ------------------------------------------
// 🏆 數字聽力是非題邏輯
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
    
    // 隨機決定要唸的數字與顯示的數字
    shNumSpoken = Math.floor(Math.random() * 100) + 1;
    let isTrueQuestion = Math.random() > 0.5; // 50% 機率是正確的
    
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
function playShNumberHint() { if(isShNumActive) speak(shNumSpoken.toString(), 'en-US', 0.8); }
