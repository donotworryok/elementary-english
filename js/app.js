// --- 密碼鎖邏輯 ---
const SECRET_PIN = "88888"; // ✏️ 在這裡設定你的 5 位數密碼

function checkPin() {
    const input = document.getElementById('pin-input').value;
    const errorMsg = document.getElementById('lock-error');
    
    if (input === SECRET_PIN) {
        // 密碼正確，隱藏鎖定畫面
        document.getElementById('lock-screen').style.display = 'none';
        // 紀錄在 sessionStorage，這樣按 F5 重新整理就不會被要求重輸
        sessionStorage.setItem('isUnlocked', 'true');
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('pin-input').value = '';
    }
}

// 網頁載入時檢查是否已經解鎖過
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isUnlocked') === 'true') {
        document.getElementById('lock-screen').style.display = 'none';
    }
});

// ... 下面是你原本 app.js 的其他變數宣告與程式碼 ...

// --- 狀態變數 ---
let currentMode = 'long'; 
let mainIndex = { 'long': { A: 0, E: 0, I: 0, O: 0, U: 0 }, 'short': { A: 0, E: 0, I: 0, O: 0, U: 0 }, 'mixed': { A: 0, E: 0, I: 0, O: 0, U: 0 } };
let drillIndex = { 'long': { A: 0, E: 0, I: 0, O: 0, U: 0 }, 'short': { A: 0, E: 0, I: 0, O: 0, U: 0 }, 'mixed': { A: 0, E: 0, I: 0, O: 0, U: 0 } };
let currentDrillVowel = 'A'; 
let isCooldown = false; 

// 發音遊戲變數
let gameScore = 0; let gameTimerInterval = null;
let isGameActive = false; let currentGameObj = null; 
let gameWordsPool = []; let gameElapsed = 0; let gameTotalQuestions = 45;

// 動詞遊戲變數
let verbListShuffled = []; let verbCurrentIdx = 0; let verbScoreCount = 0; let currentVerbObj = null;

// 拼字遊戲變數
let spellMode = 'long'; let spellScore = 0; let spellTimerInterval = null;
let isSpellActive = false; let currentSpellObj = null; let spellCorrectChunks = []; let spellCurrentIndex = 0; 
let spellPool = []; let spellElapsed = 0; let spellTotalQuestions = 45; 

// 新增：延遲小工具 (用來做動畫停頓)
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- 初始化載入 ---
window.onload = function() {
    updateGameRecordUI();
    updateSpellRecordUI();
    updateVerbRecordUI();
    updatePhonicsText();
    updateSpellText();
};

// --- 存檔系統 LocalStorage ---
function saveTimeRecord(key, timeElapsed, score, total) {
    if (score !== total) return false; 
    let currentBest = localStorage.getItem(key);
    if (!currentBest || timeElapsed < parseInt(currentBest)) {
        localStorage.setItem(key, timeElapsed);
        return true; 
    }
    return false;
}

function getRecordText(key) {
    let val = localStorage.getItem(key);
    return val ? formatTime(parseInt(val)) : '無';
}

function updateGameRecordUI() {
    document.getElementById('game-best-record').innerText = `👑 最快通關紀錄: ${getRecordText('phonics_' + currentMode)}`;
}

function updateSpellRecordUI() {
    document.getElementById('spell-best-record').innerText = `👑 最快通關紀錄: ${getRecordText('spell_' + spellMode)}`;
}

function updateVerbRecordUI() {
    let best = localStorage.getItem('verb_best');
    document.getElementById('verb-best-record').innerText = `👑 最高得分紀錄: ${best ? best + ' / 9' : '無'}`;
}

function savePhonicsState() {
    if (!isGameActive) { localStorage.removeItem('phonics_state'); return; }
    localStorage.setItem('phonics_state', JSON.stringify({ mode: currentMode, score: gameScore, elapsed: gameElapsed, pool: gameWordsPool, curr: currentGameObj }));
}

function saveVerbState() {
    if (document.getElementById('verb-board').style.display === 'none') { localStorage.removeItem('verb_state'); return; }
    localStorage.setItem('verb_state', JSON.stringify({ score: verbScoreCount, idx: verbCurrentIdx, pool: verbListShuffled, curr: currentVerbObj }));
}

function saveSpellState() {
    if (!isSpellActive) { localStorage.removeItem('spell_state'); return; }
    localStorage.setItem('spell_state', JSON.stringify({ mode: spellMode, score: spellScore, elapsed: spellElapsed, pool: spellPool, curr: currentSpellObj, chunks: spellCorrectChunks, cIdx: spellCurrentIndex }));
}

// --- UI 切換邏輯 ---
function toggleMainSequence() {
    const section = document.getElementById('main-sequence-section');
    section.style.display = document.getElementById('hide-main-toggle').checked ? 'none' : 'block';
}

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => { tab.style.display = 'none'; });
    document.querySelectorAll('.tab-btn').forEach(btn => { btn.classList.remove('active'); });
    document.getElementById(tabId).style.display = 'block';
    btnElement.classList.add('active');

    if (tabId !== 'tab-phonics' && isGameActive) forceEndGame();
    if (tabId !== 'tab-spelling' && isSpellActive) forceEndSpellGame();
}

function resetCurrentTab(tabName) {
    if (tabName === 'phonics') {
        forceEndGame();
        document.getElementById('example-display').innerText = '請點擊上方字母！';
        document.getElementById('drill-display').innerText = '準備練習 A！';
        setMode('long');
        document.getElementById('hide-main-toggle').checked = false;
        toggleMainSequence();
    } else if (tabName === 'verbs') {
        document.getElementById('verb-board').style.display = 'none';
        document.getElementById('verb-start-screen').style.display = 'block';
        localStorage.removeItem('verb_state');
    } else if (tabName === 'spelling') {
        forceEndSpellGame(true);
        setSpellMode('long');
        document.getElementById('az-toggle').checked = false;
    } else if (tabName === 'custom') {
        document.getElementById('custom-word').value = '';
        document.getElementById('translation-display').innerText = '';
    }
}

// --- 發音控制邏輯 ---
const synth = window.speechSynthesis;
function getFemaleUSVoice() {
    const voices = synth.getVoices();
    return voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira')) || voices.find(v => v.lang.startsWith('en'));
}

function speak(text, lang, customRate = 0.8) {
    if (synth.speaking) synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; 
    // 放寬下限到 0.2，才能達成我們需要的「極慢速拉長音」效果
    utterance.rate = Math.max(0.2, customRate); 
    if (lang === 'en-US') { 
        const voice = getFemaleUSVoice(); 
        if (voice) utterance.voice = voice; 
    }
    synth.speak(utterance);
}

function speakBilingual(enText, zhText, enRate = 0.5, zhRate = 0.8) {
    if (synth.speaking) synth.cancel();
    if (enText) {
        const enUtterance = new SpeechSynthesisUtterance(enText);
        enUtterance.lang = 'en-US'; enUtterance.rate = Math.max(0.2, enRate);
        const enVoice = getFemaleUSVoice();
        if (enVoice) enUtterance.voice = enVoice;
        synth.speak(enUtterance);
    }
    
    if (zhText) {
        const zhUtterance = new SpeechSynthesisUtterance(zhText);
        zhUtterance.lang = 'zh-TW'; zhUtterance.rate = zhRate;
        synth.speak(zhUtterance);
    }
}

function getActiveExamples() { 
    if(currentMode === 'long') return longExamples;
    if(currentMode === 'short') return shortExamples;
    return mixedExamples;
}

function formatTime(seconds) { 
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; 
}

// --- 第一章：發音填空與視覺拼讀邏輯 ---
function updatePhonicsText() {
    let q = parseInt(document.getElementById('phonics-q-count').value);
    document.getElementById('start-btn-text').innerText = `▶️ 開始 ${q} 題挑戰`;
    document.getElementById('game-score').innerText = `🏆 答對: 0 / ${q}`;
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#tab-phonics .mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    
    const modeTexts = { 'long': '長母音', 'short': '短母音', 'mixed': '綜合挑戰' };
    const mText = modeTexts[mode];
    document.getElementById('title-main').innerText = `🎲 綜合順序 (${mText})`;
    document.getElementById('title-drill').innerText = `🎯 單一字母特訓 (${mText})`;
    document.getElementById('title-game').innerText = `🎮 ${mText} 填空挑戰`;

    document.getElementById('example-display').innerText = '請點擊上方字母！';
    document.getElementById('drill-display').innerText = `準備練習 ${currentDrillVowel}！`;
    updateGameRecordUI(); 
    forceEndGame(); 
}

// ★ 升級版：動態視覺拼讀 + 慢速拉長音
async function playVowel(vowel, btnElement) {
    if (isCooldown) return; 
    isCooldown = true; btnElement.classList.add('cooldown');
    
    const words = getActiveExamples()[vowel];
    const currentWord = words[mainIndex[currentMode][vowel]];
    const display = document.getElementById('example-display');

    // 1. 清空畫面準備動畫
    display.innerHTML = `<span class="spell-text" style="opacity: 0.5;">...聽發音...</span>`;
    
    // 2. 極慢速發音 (0.2倍速)，讓系統自動把聲音拉長 (模擬拼音過程)
    speak(currentWord.en, 'en-US', 0.2); 

    // 3. 配合慢速拉長音的節奏，在畫面上「動態逐塊浮現」
    let chunkText = '';
    for (let i = 0; i < currentWord.c.length; i++) {
        chunkText += (i === 0 ? '' : ' - ') + currentWord.c[i];
        display.innerHTML = `<span class="spell-text" style="color: #e67e22; transform: scale(1.1); display: inline-block;">${chunkText}</span>`;
        await delay(1200 / currentWord.c.length); // 依據字塊數量動態停頓
    }

    await delay(400);

    // 4. 原速唸出單字，並顯示完整資訊
    display.innerHTML = `<span class="spell-text">${currentWord.c.join(' - ')}</span> <br> ➔ ${currentWord.en} (${currentWord.zh})`;
    speak(currentWord.en, 'en-US', 0.8);
    
    // 5. 唸出中文
    await delay(1000);
    speakBilingual(null, currentWord.zh, 0, 1.0);

    mainIndex[currentMode][vowel] = (mainIndex[currentMode][vowel] + 1) % words.length;
    
    // 等待動畫全部結束後才解除冷卻
    setTimeout(() => { isCooldown = false; btnElement.classList.remove('cooldown'); }, 800);
}

function setDrillVowel(vowel) {
    currentDrillVowel = vowel;
    document.querySelectorAll('.drill-vowel-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('drill-' + vowel.toLowerCase()).classList.add('active');
    document.getElementById('drill-display').innerText = `準備練習 ${vowel}！`;
}

function playDrillWord(btnElement) {
    if (isCooldown) return; 
    isCooldown = true; btnElement.classList.add('cooldown');
    
    const words = getActiveExamples()[currentDrillVowel];
    const currentWord = words[drillIndex[currentMode][currentDrillVowel]];
    
    // 直接顯示單字與中文
    document.getElementById('drill-display').innerHTML = `${currentWord.en} (${currentWord.zh})`;
    
    // 正常發音：英文速度0.8(稍微清晰)，中文速度0.8
    speakBilingual(currentWord.en, currentWord.zh, 0.8, 0.8);

    drillIndex[currentMode][currentDrillVowel] = (drillIndex[currentMode][currentDrillVowel] + 1) % words.length;
    
    // 等待發音結束後解除按鈕冷卻 (約1.5秒)
    setTimeout(() => { isCooldown = false; btnElement.classList.remove('cooldown'); }, 1500);
}

// --- 以下為原本的遊戲邏輯 (不變，直接沿用) ---
function forceEndGame() {
    isGameActive = false; clearInterval(gameTimerInterval);
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('game-start-screen').style.display = 'block';
    document.getElementById('game-end-msg').style.display = 'none';
    document.getElementById('game-timer').innerText = `⏳ 00:00`;
    updatePhonicsText();
    localStorage.removeItem('phonics_state');
}

function startGame() {
    let saved = localStorage.getItem('phonics_state');
    if (saved && confirm("發現上次玩到一半的發音測驗進度，要繼續嗎？\n(按「取消」則重新開始)")) {
        let st = JSON.parse(saved);
        setMode(st.mode);
        gameScore = st.score; gameElapsed = st.elapsed; gameWordsPool = st.pool; currentGameObj = st.curr;
        isGameActive = true;
        gameTotalQuestions = gameScore + gameWordsPool.length + 1;
        
        document.getElementById('game-score').innerText = `🏆 答對: ${gameScore} / ${gameTotalQuestions}`;
        document.getElementById('game-start-screen').style.display = 'none';
        document.getElementById('game-board').style.display = 'block';
        
        if(gameTimerInterval) clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(() => {
            gameElapsed++; document.getElementById('game-timer').innerText = `⏳ ${formatTime(gameElapsed)}`;
            if(gameElapsed % 3 === 0) savePhonicsState();
        }, 1000);
        
        renderCurrentGameQuestion();
        return;
    }

    gameScore = 0; isGameActive = true;
    if (currentMode === 'short') { gameWordsPool = [...shortGameWords]; }
    else if (currentMode === 'mixed') { gameWordsPool = [...mixedGameWords]; }
    else { gameWordsPool = [...longGameWords]; }
    
    gameWordsPool.sort(() => 0.5 - Math.random());
    let q = parseInt(document.getElementById('phonics-q-count').value);
    if (gameWordsPool.length > q) gameWordsPool = gameWordsPool.slice(0, q);
    gameTotalQuestions = gameWordsPool.length;

    document.getElementById('game-score').innerText = `🏆 答對: 0 / ${gameTotalQuestions}`;
    document.getElementById('game-start-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';

    if(gameTimerInterval) clearInterval(gameTimerInterval);
    gameElapsed = 0;
    document.getElementById('game-timer').innerText = `⏳ 00:00`;
    gameTimerInterval = setInterval(() => {
        gameElapsed++; document.getElementById('game-timer').innerText = `⏳ ${formatTime(gameElapsed)}`;
        if(gameElapsed % 3 === 0) savePhonicsState();
    }, 1000);

    nextGameQuestion();
}

function endGame(isCompleted = false) {
    isGameActive = false; clearInterval(gameTimerInterval);
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('game-start-screen').style.display = 'block';
    localStorage.removeItem('phonics_state');
    
    if (isCompleted) {
        const finalTime = formatTime(gameElapsed);
        const mText = currentMode === 'mixed' ? '綜合' : (currentMode === 'long' ? '長母音' : '短母音');
        let isNewRecord = saveTimeRecord('phonics_' + currentMode, gameElapsed, gameScore, gameTotalQuestions);
        
        let msg = `🎉 太棒了！\n你完成了 ${gameTotalQuestions} 題${mText}挑戰！\n總花費時間：${finalTime}`;
        if(isNewRecord) msg += `\n🌟 恭喜打破最快紀錄！`;
        document.getElementById('game-end-msg').innerText = msg;
    } else {
        document.getElementById('game-end-msg').innerText = `停止測驗！\n總共答對了 ${gameScore} 題！`;
    }
    
    document.getElementById('game-end-msg').style.display = 'block';
    document.getElementById('start-btn-text').innerText = '🔄 再挑戰一次';
    updateGameRecordUI();
}

function nextGameQuestion() {
    if(!isGameActive) return;
    if (gameWordsPool.length === 0) { endGame(true); return; }
    currentGameObj = gameWordsPool.pop(); 
    savePhonicsState();
    renderCurrentGameQuestion();
}

function renderCurrentGameQuestion() {
    let gAnswers = longGameAnswers;
    if (currentMode === 'short') { gAnswers = shortGameAnswers; }
    if (currentMode === 'mixed') { gAnswers = mixedGameAnswers; }

    let wrongAnswers = gAnswers.filter(v => v !== currentGameObj.a).sort(() => 0.5 - Math.random());
    let options = [currentGameObj.a, wrongAnswers[0], wrongAnswers[1]].sort(() => 0.5 - Math.random()); 

    document.getElementById('game-word').innerText = currentGameObj.b;
    document.getElementById('game-zh').innerText = `(${currentGameObj.zh})`;
    document.getElementById('game-feedback').innerText = '請選擇缺少的母音：';
    document.getElementById('game-feedback').style.color = '#7f8c8d';
    
    const optsDiv = document.getElementById('game-options'); optsDiv.innerHTML = ''; 
    options.forEach(opt => {
        const btn = document.createElement('button'); btn.className = 'game-opt-btn'; btn.innerText = opt;
        btn.onclick = function() { checkGameAnswer(opt, this); }; optsDiv.appendChild(btn);
    });
    setTimeout(() => { if(isGameActive) speak(currentGameObj.w, 'en-US', 0.8); }, 500);
}

function checkGameAnswer(ans, btn) {
    if(!isGameActive) return;
    const feedbackText = document.getElementById('game-feedback');
    if (ans === currentGameObj.a) {
        btn.style.backgroundColor = '#2ecc71'; btn.style.color = 'white'; btn.style.borderColor = '#2ecc71';
        feedbackText.innerText = '🎉 答對了！'; feedbackText.style.color = '#27ae60';
        
        gameScore++; 
        document.getElementById('game-score').innerText = `🏆 答對: ${gameScore} / ${gameTotalQuestions}`;
        document.getElementById('game-word').innerText = currentGameObj.w;
        speak(currentGameObj.w, 'en-US', 0.8); 
        document.querySelectorAll('#game-options .game-opt-btn').forEach(b => b.disabled = true);
        
        savePhonicsState();
        setTimeout(() => { if(isGameActive) nextGameQuestion(); }, 1500);
    } else {
        btn.style.backgroundColor = '#e74c3c'; btn.style.color = 'white'; btn.style.borderColor = '#e74c3c'; btn.disabled = true; 
        feedbackText.innerText = '❌ 答錯囉，再試一次！'; feedbackText.style.color = '#e74c3c';
        speak(currentGameObj.w, 'en-US', 0.8); 
    }
}

function playGameHint() { if(currentGameObj && isGameActive) speak(currentGameObj.w, 'en-US', 0.8); }

// --- 第二章：動詞測驗邏輯 ---
function playVerb(index, btnElement) {
    if (isCooldown) return; 
    isCooldown = true; btnElement.classList.add('cooldown');
    const data = verbData[index];
    document.getElementById('verb-display').innerText = data.s;
    document.getElementById('verb-zh-display').innerText = data.zh;
    speakBilingual(`${data.v}. ${data.s}`, data.zh, 0.5, 0.8);
    setTimeout(() => { isCooldown = false; btnElement.classList.remove('cooldown'); }, 4000);
}

function startVerbQuiz() {
    let saved = localStorage.getItem('verb_state');
    if (saved && confirm("發現上次玩到一半的動詞測驗進度，要繼續嗎？\n(按「取消」則重新開始)")) {
        let st = JSON.parse(saved);
        verbScoreCount = st.score; verbCurrentIdx = st.idx; verbListShuffled = st.pool; currentVerbObj = st.curr;
        document.getElementById('verb-start-screen').style.display = 'none';
        document.getElementById('verb-board').style.display = 'block';
        renderCurrentVerbQuestion();
        return;
    }

    verbListShuffled = [...verbQuizData].sort(() => 0.5 - Math.random());
    verbCurrentIdx = 0; verbScoreCount = 0;
    document.getElementById('verb-start-screen').style.display = 'none';
    document.getElementById('verb-board').style.display = 'block';
    loadVerbQuestion();
}

function loadVerbQuestion() {
    if (verbCurrentIdx >= verbListShuffled.length) {
        document.getElementById('verb-board').style.display = 'none';
        document.getElementById('verb-start-screen').style.display = 'block';
        
        let savedBest = localStorage.getItem('verb_best') || 0;
        let isNewRecord = false;
        if (verbScoreCount > savedBest) { localStorage.setItem('verb_best', verbScoreCount); isNewRecord = true; }
        updateVerbRecordUI();
        localStorage.removeItem('verb_state');

        const endMsg = document.getElementById('verb-end-msg');
        let msg = `🎉 測驗完成！\n你總共答對了 ${verbScoreCount} / 9 題！`;
        if (isNewRecord) msg += `\n🌟 創造了新高分！`;
        endMsg.innerText = msg; endMsg.style.display = 'block';
        document.querySelector('#tab-verbs .game-start-btn').innerText = '🔄 再測驗一次';
        return;
    }
    currentVerbObj = verbListShuffled[verbCurrentIdx];
    saveVerbState();
    renderCurrentVerbQuestion();
}

function renderCurrentVerbQuestion() {
    document.getElementById('verb-progress').innerText = `📊 第 ${verbCurrentIdx + 1} 題 / 共 9 題`;
    document.getElementById('verb-score').innerText = `🏆 得分: ${verbScoreCount} / 9`;

    const blankSentence = currentVerbObj.sentence.replace(currentVerbObj.v, '?????');
    document.getElementById('verb-sentence').innerText = blankSentence;
    document.getElementById('verb-zh').innerText = `(${currentVerbObj.zh})`;
    document.getElementById('verb-feedback').innerText = '請選擇正確的動詞：';
    document.getElementById('verb-feedback').style.color = '#7f8c8d';

    let wrongAnswers = allVerbsList.filter(v => v !== currentVerbObj.v).sort(() => 0.5 - Math.random());
    let options = [currentVerbObj.v, wrongAnswers[0], wrongAnswers[1]].sort(() => 0.5 - Math.random());

    const optsDiv = document.getElementById('verb-options');
    optsDiv.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button'); btn.className = 'game-opt-btn'; btn.innerText = opt;
        btn.onclick = function() { checkVerbAnswer(opt, this); }; optsDiv.appendChild(btn);
    });
}

function checkVerbAnswer(ans, btn) {
    const feedbackText = document.getElementById('verb-feedback');
    if (ans === currentVerbObj.v) {
        btn.style.backgroundColor = '#2ecc71'; btn.style.color = 'white'; btn.style.borderColor = '#2ecc71';
        feedbackText.innerText = '🎉 答對了！'; feedbackText.style.color = '#27ae60';
        verbScoreCount++;
        document.getElementById('verb-score').innerText = `🏆 得分: ${verbScoreCount} / 9`;
        document.getElementById('verb-sentence').innerText = currentVerbObj.sentence;
        document.querySelectorAll('#verb-options .game-opt-btn').forEach(b => b.disabled = true);

        speakBilingual(currentVerbObj.sentence, currentVerbObj.zh, 0.5, 0.8);
        verbCurrentIdx++; saveVerbState();
        setTimeout(() => { loadVerbQuestion(); }, 3500);
    } else {
        btn.style.backgroundColor = '#e74c3c'; btn.style.color = 'white'; btn.style.borderColor = '#e74c3c'; btn.disabled = true;
        feedbackText.innerText = '❌ 答錯囉，再試一次！'; feedbackText.style.color = '#e74c3c';
    }
}
function playVerbHint() { if(currentVerbObj) speakBilingual(currentVerbObj.sentence, currentVerbObj.zh, 0.5, 0.8); }

// --- 第三章：拼字遊戲邏輯 ---
function updateSpellText() {
    let q = parseInt(document.getElementById('spell-q-count').value);
    document.getElementById('spell-start-btn-text').innerText = `▶️ 開始 ${q} 題挑戰`;
    document.getElementById('spell-score').innerText = `🏆 拼對: 0 / ${q}`;
}

function setSpellMode(mode) {
    spellMode = mode;
    document.querySelectorAll('#tab-spelling .mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('spell-btn-' + mode).classList.add('active');
    
    const modeTexts = { 'long': '長母音', 'short': '短母音', 'mixed': '綜合挑戰' };
    const mText = modeTexts[mode];
    document.getElementById('title-spell').innerText = `🧩 單字拼拼樂 (${mText})`;
    updateSpellRecordUI(); 
    forceEndSpellGame(true);
}

function forceEndSpellGame(clearState = false) {
    isSpellActive = false; clearInterval(spellTimerInterval);
    document.getElementById('spell-board').style.display = 'none';
    document.getElementById('spell-start-screen').style.display = 'block';
    document.getElementById('spell-end-msg').style.display = 'none';
    document.getElementById('spell-timer').innerText = `⏳ 00:00`;
    updateSpellText();
    if(clearState) localStorage.removeItem('spell_state');
}

function getSpellingWords(mode) {
    let pool = []; let dicts = [];
    if (mode === 'long') dicts = [longExamples];
    else if (mode === 'short') dicts = [shortExamples];
    else dicts = [longExamples, shortExamples];

    dicts.forEach(dict => { ['A','E','I','O','U'].forEach(v => { pool = pool.concat(dict[v]); }); });
    return pool;
}

function startSpellGame() {
    let saved = localStorage.getItem('spell_state');
    if (saved && confirm("發現上次玩到一半的拼字挑戰進度，要繼續嗎？\n(按「取消」則重新開始)")) {
        let st = JSON.parse(saved);
        setSpellMode(st.mode);
        spellScore = st.score; spellElapsed = st.elapsed; spellPool = st.pool;
        currentSpellObj = st.curr; spellCorrectChunks = st.chunks; spellCurrentIndex = st.cIdx;
        isSpellActive = true;
        spellTotalQuestions = spellScore + spellPool.length + (spellCurrentIndex < spellCorrectChunks.length ? 1 : 0);
        
        document.getElementById('spell-score').innerText = `🏆 拼對: ${spellScore} / ${spellTotalQuestions}`;
        document.getElementById('spell-start-screen').style.display = 'none';
        document.getElementById('spell-board').style.display = 'block';
        
        initSpellKeyboard();
        if(spellTimerInterval) clearInterval(spellTimerInterval);
        spellTimerInterval = setInterval(() => {
            spellElapsed++; document.getElementById('spell-timer').innerText = `⏳ ${formatTime(spellElapsed)}`;
            if(spellElapsed % 3 === 0) saveSpellState();
        }, 1000);
        
        renderCurrentSpellQuestion();
        return;
    }

    spellScore = 0; isSpellActive = true;
    spellPool = getSpellingWords(spellMode).sort(() => 0.5 - Math.random());
    
    let q = parseInt(document.getElementById('spell-q-count').value);
    if(spellPool.length > q) spellPool = spellPool.slice(0, q);
    spellTotalQuestions = spellPool.length;
    
    document.getElementById('spell-score').innerText = `🏆 拼對: 0 / ${spellTotalQuestions}`;
    document.getElementById('spell-start-screen').style.display = 'none';
    document.getElementById('spell-board').style.display = 'block';
    
    initSpellKeyboard();
    if (spellTimerInterval) clearInterval(spellTimerInterval);
    spellElapsed = 0;
    document.getElementById('spell-timer').innerText = `⏳ 00:00`;
    spellTimerInterval = setInterval(() => {
        spellElapsed++; document.getElementById('spell-timer').innerText = `⏳ ${formatTime(spellElapsed)}`;
        if(spellElapsed % 3 === 0) saveSpellState();
    }, 1000);
    
    nextSpellQuestion();
}

function endSpellGame(isCompleted = false) {
    isSpellActive = false; clearInterval(spellTimerInterval);
    document.getElementById('spell-board').style.display = 'none';
    document.getElementById('spell-start-screen').style.display = 'block';
    localStorage.removeItem('spell_state');

    if (isCompleted) {
        const finalTime = formatTime(spellElapsed);
        const mText = spellMode === 'mixed' ? '綜合' : (spellMode === 'long' ? '長母音' : '短母音');
        let isNewRecord = saveTimeRecord('spell_' + spellMode, spellElapsed, spellScore, spellTotalQuestions);
        
        let msg = `🎉 太棒了！\n你完成了 ${spellTotalQuestions} 題${mText}拼字挑戰！\n總花費時間：${finalTime}`;
        if(isNewRecord) msg += `\n🌟 恭喜打破最快紀錄！`;
        document.getElementById('spell-end-msg').innerText = msg;
    } else {
        document.getElementById('spell-end-msg').innerText = `停止挑戰！\n總共拼對了 ${spellScore} 個單字！`;
    }
    
    document.getElementById('spell-end-msg').style.display = 'block';
    document.querySelector('#tab-spelling .game-start-btn').innerText = '🔄 再挑戰一次';
    updateSpellRecordUI(); 
}

function initSpellKeyboard() {
    const kbContainer = document.getElementById('spell-keyboard');
    if(!kbContainer) return;
    kbContainer.innerHTML = '';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    alphabet.forEach(letter => {
        const btn = document.createElement('button'); btn.className = 'key-btn'; btn.innerText = letter;
        btn.onclick = function() { checkSpellLetter(letter, this); }; kbContainer.appendChild(btn);
    });
}

function nextSpellQuestion() {
    if (!isSpellActive) return;
    if (spellPool.length === 0) { endSpellGame(true); return; }
    currentSpellObj = spellPool.pop();
    const isAZMode = document.getElementById('az-toggle').checked;
    spellCorrectChunks = isAZMode ? currentSpellObj.en.split('') : [...currentSpellObj.c];
    spellCurrentIndex = 0;
    saveSpellState();
    renderCurrentSpellQuestion();
}

function renderCurrentSpellQuestion() {
    const isAZMode = document.getElementById('az-toggle').checked;
    if (isAZMode) {
        document.getElementById('spell-options').style.display = 'none';
        document.getElementById('spell-keyboard').style.display = 'flex';
        document.querySelectorAll('.key-btn').forEach(b => b.disabled = false);
    } else {
        document.getElementById('spell-options').style.display = 'flex';
        document.getElementById('spell-keyboard').style.display = 'none';
        
        let decoyChunks = [];
        let dicts = spellMode === 'mixed' ? [longExamples, shortExamples] : (spellMode === 'long' ? [longExamples] : [shortExamples]);
        let allDictWords = [];
        dicts.forEach(dict => { ['A','E','I','O','U'].forEach(v => { allDictWords = allDictWords.concat(dict[v]); }); });
        
        let attempts = 0;
        while (decoyChunks.length < 3 && attempts < 20) {
            let randWord = allDictWords[Math.floor(Math.random() * allDictWords.length)];
            let randChunk = randWord.c[Math.floor(Math.random() * randWord.c.length)];
            if (!spellCorrectChunks.includes(randChunk) && !decoyChunks.includes(randChunk)) decoyChunks.push(randChunk);
            attempts++;
        }
        
        let scrambled = [...spellCorrectChunks, ...decoyChunks].sort(() => 0.5 - Math.random());
        const optsDiv = document.getElementById('spell-options');
        optsDiv.innerHTML = '';
        scrambled.forEach((chunk) => {
            const btn = document.createElement('button'); btn.className = 'game-opt-btn'; btn.innerText = chunk;
            btn.onclick = function() { checkSpellChunk(chunk, this); }; optsDiv.appendChild(btn);
        });
    }

    document.getElementById('spell-zh').innerText = `(${currentSpellObj.zh})`;
    renderSpellSlots();
    setTimeout(() => { if(isSpellActive && spellCurrentIndex === 0) speak(currentSpellObj.en, 'en-US', 0.8); }, 500);
}

function renderSpellSlots() {
    const slotsDiv = document.getElementById('spell-slots');
    slotsDiv.innerHTML = '';
    spellCorrectChunks.forEach((chunk, index) => {
        const span = document.createElement('span'); span.className = 'spell-slot';
        if (index < spellCurrentIndex) { span.innerText = spellCorrectChunks[index]; span.style.borderBottomColor = '#27ae60'; } 
        else { span.innerText = ''; }
        slotsDiv.appendChild(span);
    });
}

function checkSpellChunk(chunk, btn) {
    if (!isSpellActive) return;
    const feedbackText = document.getElementById('spell-feedback');
    if (chunk === spellCorrectChunks[spellCurrentIndex]) {
        btn.style.visibility = 'hidden'; spellCurrentIndex++; renderSpellSlots();
        saveSpellState(); handleCorrectSpell(feedbackText, '請依序點擊拼出單字：');
    } else { wrongSpellFeedback(btn); }
}

function checkSpellLetter(letter, btn) {
    if (!isSpellActive) return;
    const feedbackText = document.getElementById('spell-feedback');
    const correctLetter = spellCorrectChunks[spellCurrentIndex].toLowerCase();

    if (letter.toLowerCase() === correctLetter) {
        const originalBg = btn.style.backgroundColor;
        btn.style.backgroundColor = '#2ecc71'; btn.style.color = 'white'; btn.style.borderColor = '#2ecc71';
        setTimeout(() => { btn.style.backgroundColor = ''; btn.style.color = ''; btn.style.borderColor = ''; }, 200);
        spellCurrentIndex++; renderSpellSlots();
        saveSpellState(); handleCorrectSpell(feedbackText, '請依序點擊鍵盤拼出單字：');
    } else { wrongSpellFeedback(btn); }
}

function handleCorrectSpell(feedbackText, nextMsg) {
    if (spellCurrentIndex === spellCorrectChunks.length) {
        feedbackText.innerText = '🎉 拼對了！'; feedbackText.style.color = '#27ae60';
        spellScore++;
        document.getElementById('spell-score').innerText = `🏆 拼對: ${spellScore} / ${spellTotalQuestions}`;
        speak(currentSpellObj.en, 'en-US', 0.8);
        
        const isAZMode = document.getElementById('az-toggle').checked;
        if (isAZMode) { document.querySelectorAll('.key-btn').forEach(b => b.disabled = true); } 
        else { document.querySelectorAll('#spell-options .game-opt-btn').forEach(b => b.style.visibility = 'hidden'); }
        
        saveSpellState();
        setTimeout(() => { 
            if(isSpellActive) { feedbackText.innerText = nextMsg; feedbackText.style.color = '#7f8c8d'; nextSpellQuestion(); }
        }, 1500);
    }
}

function wrongSpellFeedback(btn) {
    btn.style.backgroundColor = '#e74c3c'; btn.style.color = 'white'; btn.style.borderColor = '#e74c3c';
    setTimeout(() => { btn.style.backgroundColor = ''; btn.style.color = ''; btn.style.borderColor = ''; }, 400);
    speak(currentSpellObj.en, 'en-US', 0.8);
}

function playSpellHint() { if(currentSpellObj && isSpellActive) speak(currentSpellObj.en, 'en-US', 0.8); }

// --- 第四章：翻譯邏輯 ---
async function speakCustomWord() {
    const transDisplay = document.getElementById('translation-display');
    const word = document.getElementById('custom-word').value.trim();
    if (!word) { alert("請先輸入英文單字！"); return; }
    transDisplay.innerText = "正在翻譯中...";
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`);
        const data = await response.json();
        transDisplay.innerText = `中文: ${data.responseData.translatedText}`; speak(word, 'en-US');
    } catch (error) { transDisplay.innerText = "翻譯失敗，請檢查網路。"; speak(word, 'en-US'); }
}