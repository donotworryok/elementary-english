// ==========================================
// 檔案 1: 共用核心模組 (app.js)
// 包含：密碼鎖、動態視圖載入、發音引擎
// ==========================================

const delay = ms => new Promise(res => setTimeout(res, ms));
const SECRET_PIN = "88888"; 
let currentSubMenu = ''; 

function checkPin() {
    const input = document.getElementById('pin-input').value;
    const errorMsg = document.getElementById('lock-error');
    if (input === SECRET_PIN) {
        document.getElementById('lock-screen').style.display = 'none';
        sessionStorage.setItem('isUnlocked', 'true');
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('pin-input').value = '';
    }
}

function formatTime(seconds) { 
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; 
}

window.onload = function() {
    const topMenu = document.getElementById('top-level-menu');
    if (topMenu) topMenu.style.display = 'flex';
    
    if (sessionStorage.getItem('isUnlocked') === 'true') {
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) lockScreen.style.display = 'none';
    }
};

function openSubMenu(subMenuId) {
    document.getElementById('top-level-menu').style.display = 'none';
    document.querySelectorAll('.submenu-container').forEach(el => el.style.display = 'none');
    document.getElementById(subMenuId).style.display = 'block';
    currentSubMenu = subMenuId; 
}

function backToTopMenu() {
    document.querySelectorAll('.submenu-container').forEach(el => el.style.display = 'none');
    document.getElementById('top-level-menu').style.display = 'flex';
    currentSubMenu = '';
}

// 動態載入外部 HTML 視圖
async function loadView(viewName, tabId, subCategory = null) {
    const contentBox = document.getElementById('app-content');
    
    try {
        const response = await fetch(`views/${viewName}.html`);
        if (!response.ok) throw new Error(`找不到視圖: ${viewName}.html`);
        
        contentBox.innerHTML = await response.text();
        contentBox.style.display = 'block';
        
        document.getElementById('top-level-menu').style.display = 'none';
        document.querySelectorAll('.submenu-container').forEach(el => el.style.display = 'none');
        document.getElementById('main-header').style.display = 'none';
        
        // 隱藏剛載入的所有 tab，只顯示目標 tab
        document.querySelectorAll('#app-content .tab-content').forEach(tab => tab.style.display = 'none');
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.style.display = 'block';

        // 觸發模組 UI 初始化
        if(typeof updateGameRecordUI === 'function') updateGameRecordUI();
        if(typeof updateSpellRecordUI === 'function') updateSpellRecordUI();
        if(typeof updateVerbRecordUI === 'function') updateVerbRecordUI();
        
        let qCountEl = document.getElementById('phonics-q-count');
        if(qCountEl && typeof updatePhonicsText === 'function') updatePhonicsText();
        let sCountEl = document.getElementById('spell-q-count');
        if(sCountEl && typeof updateSpellText === 'function') updateSpellText();

        if (tabId === 'tab-sh-vocab' && subCategory && typeof setupShVocab === 'function') {
            setupShVocab(subCategory);
        }
    } catch (error) {
        console.error("載入視圖失敗:", error);
        alert("載入失敗！請確認你是在 Live Server 環境下執行。");
    }
}

function backToMenu() {
    if (typeof isGameActive !== 'undefined' && isGameActive && typeof forceEndGame === 'function') forceEndGame();
    if (typeof isSpellActive !== 'undefined' && isSpellActive && typeof forceEndSpellGame === 'function') forceEndSpellGame(false);
    if (typeof isShVocabActive !== 'undefined') isShVocabActive = false; 
    if (typeof isShNumActive !== 'undefined') isShNumActive = false;
    
    // 清空並隱藏載入區
    const contentBox = document.getElementById('app-content');
    contentBox.style.display = 'none';
    contentBox.innerHTML = '';
    
    document.getElementById('main-header').style.display = 'block';
    if (currentSubMenu) { document.getElementById(currentSubMenu).style.display = 'block'; } 
    else { document.getElementById('top-level-menu').style.display = 'flex'; }
    if (synth.speaking) synth.cancel();
}

function resetCurrentTab(tabName) {
    if (tabName === 'phonics') {
        if(typeof forceEndGame === 'function') forceEndGame();
        document.getElementById('example-display').innerText = '請點擊上方字母！';
        document.getElementById('drill-display').innerText = '準備練習 A！';
        if(typeof setMode === 'function') setMode('long');
        document.getElementById('hide-main-toggle').checked = false;
        if(typeof toggleMainSequence === 'function') toggleMainSequence();
    } else if (tabName === 'verbs') {
        document.getElementById('verb-board').style.display = 'none';
        document.getElementById('verb-start-screen').style.display = 'block';
        localStorage.removeItem('verb_state');
    } else if (tabName === 'spelling') {
        if(typeof forceEndSpellGame === 'function') forceEndSpellGame(true);
        if(typeof setSpellMode === 'function') setSpellMode('long');
        document.getElementById('az-toggle').checked = false;
    } else if (tabName === 'custom') {
        document.getElementById('custom-word').value = '';
        document.getElementById('translation-display').innerText = '';
    }
}

const synth = window.speechSynthesis;
function getFemaleUSVoice() {
    const voices = synth.getVoices();
    return voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira')) || voices.find(v => v.lang.startsWith('en'));
}

function speak(text, lang, customRate = 0.8) {
    if (synth.speaking) synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; utterance.rate = Math.max(0.2, customRate); 
    if (lang === 'en-US') { const voice = getFemaleUSVoice(); if (voice) utterance.voice = voice; }
    synth.speak(utterance);
}

function speakBilingual(enText, zhText, enRate = 0.5, zhRate = 0.8) {
    if (synth.speaking) synth.cancel();
    if (enText) {
        const enUtterance = new SpeechSynthesisUtterance(enText);
        enUtterance.lang = 'en-US'; enUtterance.rate = Math.max(0.2, enRate);
        const enVoice = getFemaleUSVoice(); if (enVoice) enUtterance.voice = enVoice;
        synth.speak(enUtterance);
    }
    if (zhText) {
        const zhUtterance = new SpeechSynthesisUtterance(zhText);
        zhUtterance.lang = 'zh-TW'; zhUtterance.rate = zhRate;
        synth.speak(zhUtterance);
    }
}

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