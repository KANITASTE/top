// ============================================
// chat.js - Character Chat (DISCOちゃん)
// To connect real API: replace handleUserMessage()
// ============================================

const CharacterChat = (() => {
  const AVATAR = '🐱';
  const NAME   = 'DISCOちゃん';

  // ---- Response dictionary ----
  const responses = {
    greet: [
      'ん〜……きてくれた！嬉しいよぉ〜！',
      'やっほー！今日も元気だね〜！',
      'あ、いらっしゃい！ゆっくりしてってねぇ〜',
      'こんにちは〜！何か話しかけてみて〜！',
    ],
    food: [
      'ん〜……食べ物の話は大好きだよぉ〜！何が好き？',
      'おいしいものって幸せだよねぇ〜',
      'みかんといえばコタツ！最高の組み合わせだよねぇ〜',
      'ん〜……最近パスタにはまっとるとよ〜！トマト系が好きだねぇ〜',
      'それ面白いね〜！おいしそう！教えてくれてありがとう〜',
    ],
    wine: [
      'ワイン好きだよぉ〜！赤と白どっちが好き？',
      'ん〜……ボルドーも好きだけど、最近はロワールにはまっとるとよ〜！',
      'それ面白いね〜！どこのワイン？ペアリングとか考えるの楽しいよねぇ〜',
      'ナチュラルワインも気になっとるよ〜！',
    ],
    cat: [
      'にゃ〜！猫は最高だよぉ〜！🐱',
      'ん〜……猫ってかわいいよねぇ〜。膝の上でゴロゴロされるの最高だよ〜',
      'うちの子も毎日コタツに入りよるとよ〜！のんびりしとる',
      '猫の話なら何時間でも話せるよぉ〜！どんな子いるの？',
      'ん〜……猫ってほんと不思議だよねぇ〜。目があうと幸せだよ〜',
    ],
    dog: [
      'え……犬はちょっとね……こわいんよ……',
      'わんこはね……苦手なんよぉ〜（ふるえ）',
      'ん〜……犬の話はちょっと……猫の話しよ？',
    ],
    stock: [
      'ん〜……株式投資は奥深いよねぇ〜！',
      'DISCO（6146）！半導体ウエハーの精密加工装置メーカーだよぉ〜！注目しとるとよ〜！',
      'そうだね〜、長期投資と短期トレード、どっちが好き？',
      'ん〜……インデックスも悪くないよねぇ〜。でもやっぱり個別株が面白いよ〜',
      'それ面白いね〜！どんな銘柄気になっとる？',
    ],
    art: [
      'ん〜……美術は大好きだよぉ〜！展覧会よく行くよ〜',
      'それ面白いね〜！どんな作家が好き？',
      'そうだね〜、現代美術って一見わからんけど、考えると面白いよねぇ〜',
      'ん〜……デザインも好きだよ〜。このサイトのレトロ感お気に入りだよ〜',
    ],
    manga: [
      'マンガ！好きだよぉ〜！何読んどる？',
      'ん〜……名作はたくさんあるよねぇ〜。おすすめある？',
      'それ面白いね〜！今度読んでみるよぉ〜！',
      'ん〜……マンガってほんと日本の宝だよねぇ〜',
    ],
    news: [
      'ん〜……最近のニュースって気になるよねぇ〜',
      'そうだね〜、世の中いろいろあるよねぇ〜',
      'それ面白いね〜！もっと教えて〜',
    ],
    hello: [
      'にゃ〜！',
      'ん〜……どうしたの？',
      'それ面白いね〜！',
    ],
    miyazaki: [
      'ん〜……宮崎ってよかとこだよ〜！チキン南蛮最高だよねぇ〜！',
      'そうそう！宮崎弁が時々出てしまうとよ〜ごめんね〜',
    ],
    kotatsu: [
      'コタツ最高だよぉ〜！みかんがあれば完璧だよね〜',
      'ん〜……コタツから出られなくなるんよぉ〜。わかる？',
    ],
    hypercard: [
      'ん〜……HyperCardって不思議な魅力があるよねぇ〜！',
      'そうそう！1993年のMacintoshって素敵だよね〜！',
    ],
    default: [
      'ん〜……そうだねぇ〜',
      'それ面白いね〜！',
      'ん〜……なるほどだよぉ〜',
      'そうそう！そういうの好きだよ〜！',
      'ん〜……もっと教えてくれる？',
      'いいねぇ〜！',
      'ん〜……そーなんだ！知らんやったとよ〜！',
      'なんかわかる気がするよぉ〜！',
      'そっかぁ〜。面白いね〜！',
    ],
  };

  const keywords = {
    greet:    ['こんにちは','こんばんは','おはよう','やあ','hello','hi','はじめ','よろしく','ねえ','ねえね'],
    food:     ['食べ','食事','ご飯','料理','ラーメン','うどん','パスタ','カレー','みかん','おいし','うまい','グルメ','食'],
    wine:     ['ワイン','シャンパン','ビール','ウイスキー','お酒','酒','飲み物','wine','sake'],
    cat:      ['猫','ねこ','ネコ','にゃ','cat','キャット','ねこちゃん','猫ちゃん','ニャン'],
    dog:      ['犬','いぬ','わんこ','ワンちゃん','dog','わん'],
    stock:    ['株','投資','銘柄','株式','DISCO','半導体','株価','証券','NISA','ポートフォリオ','配当','ETF'],
    art:      ['美術','芸術','絵','展覧会','博物館','美術館','アート','デザイン','展示'],
    manga:    ['マンガ','漫画','アニメ','コミック','週刊'],
    news:     ['ニュース','政治','経済','社会','世界','海外','時事'],
    miyazaki: ['宮崎','みやざき','チキン南蛮','日向','九州'],
    kotatsu:  ['コタツ','こたつ','炬燵','こたつむり'],
    hypercard:['HyperCard','hypercard','ハイパー','Mac','マック','レトロ','1993'],
    hello:    ['やっほ','おーい','もしもし'],
  };

  function detect(input) {
    const lower = input.toLowerCase().replace(/\s/g,'');
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(w => lower.includes(w.toLowerCase()))) return cat;
    }
    return 'default';
  }

  function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  // ---- API-ready handler ----
  async function handleUserMessage(msg) {
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 500 + Math.random()*900));
    const cat = detect(msg);
    return rand(responses[cat] || responses.default);

    /* --- SWAP ABOVE FOR REAL API --- *
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_KEY_HERE',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: `あなたはDISCOちゃん。人懐っこく天然で猫好き。宮崎出身。
口癖は「ん〜……〇〇だねぇ〜」「それ面白いね〜！」。犬が苦手。
得意：食べ物・ワイン・美術・株式・マンガ・猫。50文字以内で返答。`,
        messages: [{ role: 'user', content: msg }],
      }),
    });
    const data = await res.json();
    return data.content[0].text;
    * --------------------------------- */
  }

  // ---- UI ----
  function init(windowId) {
    const win  = document.getElementById(windowId);
    if (!win) return;
    const msgs  = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const btn   = document.getElementById('chat-send');
    if (!msgs || !input || !btn) return;

    // Prevent double-init
    if (win.dataset.chatInit) return;
    win.dataset.chatInit = '1';

    function escape(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function addMsg(text, isUser) {
      const d = document.createElement('div');
      if (isUser) {
        d.className = 'chat-msg-user';
        d.innerHTML = `<span class="chat-bubble-user">${escape(text)}</span>`;
      } else {
        d.className = 'chat-msg-char';
        d.innerHTML = `<span class="chat-avatar">${AVATAR}</span><span class="chat-bubble">${escape(text)}</span>`;
      }
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function addTyping() {
      const d = document.createElement('div');
      d.className = 'chat-msg-char'; d.id = 'chat-typing-row';
      d.innerHTML = `<span class="chat-avatar">${AVATAR}</span><span class="chat-bubble chat-typing">ん〜……考えとるよ</span>`;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    async function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg(text, true);

      btn.disabled = true;
      const typingEl = addTyping();
      try {
        const reply = await handleUserMessage(text);
        typingEl.remove();
        addMsg(reply, false);
      } catch(e) {
        typingEl.remove();
        addMsg('ん〜……ちょっとうまく話せんかった…ごめんね〜', false);
      }
      btn.disabled = false;
      input.focus();
    }

    btn.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

    // Greeting
    setTimeout(() => addMsg(rand(responses.greet), false), 350);
  }

  return { init };
})();
