// ==========================================
// 檔案 2: 聖心小一專屬模組 (app-sh.js)
// 包含：單字聽力測驗、數字 1-100 是非題
// ==========================================

// --- 聖心單字聽力測驗變數 ---
let shVocabCategory = ''; let shVocabPool = []; let shVocabCurrent = null;
let shVocabScore = 0; let shVocabTotal = 0; let isShVocabActive = false;

// --- 聖心數字是非題變數 ---
let shNumScore = 0; let shNumCurrentIdx = 0; let shNumTotal = 10;
let shNumSpoken = 0; let shNumDisplayed = 0; let isShNumActive = false;

// 🏆 單字聽力測驗 (Cat 1~3)
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
    document.getElementById('sh-vocab-title').innerText = titleText;
}

function startShVocab() {
    isShVocabActive = true; shVocabScore = 0;
    shVocabPool = [...sacredHeartData[shVocabCategory]].sort(() => 0.5 - Math.random());
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
    document.getElementById('sh-vocab-zh').innerText = `(${shVocabCurrent.zh})`;
    document.getElementById('sh-vocab-feedback').innerText = '請選出正確的圖案與單字：';
    document.getElementById('sh-vocab-feedback').style.color = '#7f8c8d';

    let wrongAnswers = sacredHeartData[shVocabCategory].filter(item => item.en !== shVocabCurrent.en).sort(() => 0.5 - Math.random());
    let options = [shVocabCurrent, wrongAnswers[0], wrongAnswers[1]].sort(() => 0.5 - Math.random());
    
    const optsDiv = document.getElementById('sh-vocab-options'); 
    optsDiv.innerHTML = '';
    
    options.forEach(optObj => {
        const btn = document.createElement('button'); 
        btn.className = 'game-opt-btn'; 
        btn.innerHTML = `
            <div class="card-img">${optObj.img}</div>
            <div class="card-text">${optObj.en}</div>
        `;
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

// 🏆 數字聽力是非題 (Cat 4)
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
    
    if (isTrueQuestion) { shNumDisplayed = shNumSpoken; } 
    else { do { shNumDisplayed = Math.floor(Math.random() * 100) + 1; } while (shNumDisplayed === shNumSpoken); }

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
