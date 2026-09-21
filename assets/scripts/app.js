/* Scene rendering and interactions. All editable wording is in content.js. */
(() => {
  'use strict';
  const { slides, artists } = window.presentationContent;
  const root = document.querySelector('#scenes');
  const overview = document.querySelector('#overview');
  const notes = document.querySelector('#notes');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let chessTimer;
  let audio;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const photo = slide => `<figure class="photo photo--${slide.kind}"><img src="assets/images/${slide.image}" alt="${escape(slide.alt)}"><figcaption>${escape(slide.caption)}</figcaption></figure>`;
  const visual = slide => {
    switch (slide.kind) {
      case 'intro': case 'code': case 'projects': return photo(slide);
      case 'music': return `<div class="music-list" aria-label="Artists I listen to">${artists.map((name,i)=>`<button class="artist ${i===0?'selected':''}" aria-pressed="${i===0}" data-artist="${i}"><span class="track-number">0${i+1}</span><span>${escape(name)}</span><span class="track-mark" aria-hidden="true">↗</span></button>`).join('')}<p class="small-note">A few names from my listening rotation</p></div>`;
      case 'languages': return `<div class="language-list">${[['French','Bonjour','Hello'],['Japanese','こんにちは','Hello'],['Russian','Привет','Hi']].map(([lang,greeting,meaning],i)=>`<div class="language" style="--delay:${i*180}ms"><span>${lang}</span><strong>${greeting}</strong><small>${meaning}</small></div>`).join('')}</div>`;
      case 'piano': return `<div class="piano-visual">${photo(slide)}<div class="keyboard-block"><div class="keyboard" aria-label="Playable piano keys">${['C','D','E','F','G','A','B'].map((note,i)=>`<button class="piano-key" data-key="${i}" aria-label="Play ${note}">${note}</button>`).join('')}</div><p class="small-note">Try a note <span>Sound only when you click</span></p></div></div>`;
      case 'chess': return `<div class="chess-visual"><div class="game-heading"><span>Scandinavian Defense · B01</span><strong>yaldapika <b>1–0</b> ovikc</strong></div><div class="chessboard" aria-label="Interactive replay of yaldapika versus ovikc"></div><div class="board-footer"><div><button data-action="chess-play">Play game</button><button data-action="chess-reset">Reset</button></div><span class="moves" aria-live="polite">Ready · 39 half-moves</span></div><div class="game-progress" aria-hidden="true"><i></i></div><div class="chess-stats"><div><strong>2116</strong><span>yaldapika · White</span></div><div><strong>2186</strong><span>ovikc · Black</span></div><p>10 min · Jul 3, 2026<br><a href="https://www.chess.com/game/live/171082694166?username=yaldapika" target="_blank" rel="noopener">Chess.com ↗</a></p></div></div>`;
      case 'finance': return `<div class="study-path"><div><span>Where I started</span><strong>Marketing</strong><p>Customers & markets</p></div><span class="path-arrow" aria-hidden="true">↓</span><div><span>What I study now</span><strong>Finance</strong><p>Business decisions & economics</p></div></div>`;
      case 'role': return `<div class="role-visual"><img class="bostik-logo" src="assets/images/bostik-logo.jpg" alt="Bostik"><strong>Durable<br>Goods</strong><div class="role-line"></div><p>PLM internship</p><span>Product Line Management</span></div>`;
      case 'closing': return `<div class="closing-index">${['Languages','Music','Piano','Chess','Finance','Programming'].map((name,i)=>`<span style="--delay:${i*70}ms">${name}</span>`).join('')}</div>`;
      default: return '';
    }
  };
  root.innerHTML = slides.map((slide,i)=>`<section class="scene scene--${slide.kind}" id="${slide.id}" aria-hidden="${i!==0}" ${i!==0?'inert':''}><div class="scene-layout"><div class="copy"><p class="eyebrow">${escape(slide.label)}</p><h1>${escape(slide.title).replace(/\n/g,'<br> ')}</h1><p class="description">${escape(slide.body)}</p>${slide.aside?`<p class="aside">${escape(slide.aside)}</p>`:''}</div><div class="visual">${visual(slide)}</div></div></section>`).join('');
  const scenes = [...root.querySelectorAll('.scene')];
  overview.querySelector('ol').innerHTML = slides.map((slide,i)=>`<li><button data-slide="${i}"><span>${String(i+1).padStart(2,'0')}</span>${escape(slide.label)}</button></li>`).join('');
  document.querySelector('#total').textContent = String(slides.length).padStart(2,'0');

  function show(index, updateHash=true) {
    const previous=active;
    active = Math.max(0, Math.min(slides.length-1,index));
    scenes.forEach((scene,i)=>{
      scene.classList.remove('replay');
      scene.classList.toggle('active',i===active);
      scene.setAttribute('aria-hidden', String(i!==active));
      scene.inert = i!==active;
    });
    document.querySelector('#current').textContent = String(active+1).padStart(2,'0');
    document.querySelector('.progress i').style.width = `${(active+1)/slides.length*100}%`;
    document.querySelector('[data-action="previous"]').disabled = active===0;
    document.querySelector('[data-action="next"]').disabled = active===slides.length-1;
    notes.querySelector('p').textContent = slides[active].notes;
    document.title = `${slides[active].label} · Alejandro Gallardo`;
    document.querySelector('#deck').dataset.direction=active>=previous?'forward':'backward';
    void scenes[active].offsetWidth;
    scenes[active].classList.add('replay');
    if(updateHash) history.replaceState(null,'',`#${slides[active].id}`);
    clearTimeout(chessTimer);
    chessPlaying=false;
    if(slides[active].kind==='chess') {
      resetChess();
      playChess();
    }
  }
  function toggleDialog(dialog) { dialog.open ? dialog.close() : dialog.showModal(); }
  async function fullscreen() {
    try { document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); } catch { /* Use browser fullscreen if unavailable in an embedded viewer. */ }
  }
  const actions = {previous:()=>show(active-1),next:()=>show(active+1),overview:()=>toggleDialog(overview),notes:()=>toggleDialog(notes),fullscreen,'chess-play':playChess,'chess-reset':resetChess};
  document.addEventListener('click',event=>{
    const target=event.target.closest('button'); if(!target) return;
    if(target.dataset.action) actions[target.dataset.action]?.();
    if(target.dataset.close) document.getElementById(target.dataset.close).close();
    if(target.dataset.slide!==undefined){overview.close();show(Number(target.dataset.slide));}
    if(target.dataset.artist!==undefined){document.querySelectorAll('.artist').forEach(button=>{const selected=button===target;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});}
    if(target.dataset.key!==undefined) playNote(Number(target.dataset.key),target);
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,input,textarea,select')) return;
    if(overview.open||notes.open) return;
    const key=event.key.toLowerCase();
    if(['arrowright','pagedown',' '].includes(key)){event.preventDefault();show(active+1);}
    else if(['arrowleft','pageup'].includes(key)){event.preventDefault();show(active-1);}
    else if(key==='home'){event.preventDefault();show(0);}
    else if(key==='end'){event.preventDefault();show(slides.length-1);}
    else if(key==='f') fullscreen();
    else if(key==='o') toggleDialog(overview);
    else if(key==='n') toggleDialog(notes);
  });
  let touch;
  root.addEventListener('touchstart',event=>{touch=event.touches[0];},{passive:true});
  root.addEventListener('touchend',event=>{if(!touch||event.target.closest('button'))return;const delta=event.changedTouches[0].clientX-touch.clientX;if(Math.abs(delta)>70)show(active+(delta<0?1:-1));touch=null;},{passive:true});

  // Seven playable natural notes: interaction explains the keyboard rather than decorating it.
  async function playNote(index,key) {
    key.classList.remove('pressed'); void key.offsetWidth; key.classList.add('pressed');
    setTimeout(()=>key.classList.remove('pressed'),550);
    try {
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      await audio.resume();
      const oscillator=audio.createOscillator(), gain=audio.createGain();
      oscillator.frequency.value=[261.63,293.66,329.63,349.23,392,440,493.88][index];
      oscillator.type='triangle';
      gain.gain.setValueAtTime(0,audio.currentTime);
      gain.gain.linearRampToValueAtTime(0.14,audio.currentTime+0.015);
      gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.9);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime+0.95);
    } catch { /* Key illumination remains available if audio is unsupported. */ }
  }

  // The exact 2026-07-03 rapid game supplied by Alejandro, encoded as legal source/destination squares.
  const board=document.querySelector('.chessboard');
  const starting=['rnbqkbnr','pppppppp','........','........','........','........','PPPPPPPP','RNBQKBNR'];
  const symbols={r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',p:'♟',R:'♖',N:'♘',B:'♗',Q:'♕',K:'♔',P:'♙'};
  const gameMoves=[
    ['e2','e4','1. e4'],['d7','d5','… d5'],['e4','d5','2. exd5'],['d8','d5','… Qxd5'],
    ['b1','c3','3. Nc3'],['d5','a5','… Qa5'],['d2','d4','4. d4'],['c7','c6','… c6'],
    ['g1','f3','5. Nf3'],['g8','f6','… Nf6'],['f1','c4','6. Bc4'],['c8','g4','… Bg4'],
    ['h2','h3','7. h3'],['g4','h5','… Bh5'],['g2','g4','8. g4'],['h5','g6','… Bg6'],
    ['c1','d2','9. Bd2'],['a5','d8','… Qd8'],['d1','e2','10. Qe2'],['e7','e6','… e6'],
    ['e1','c1','11. O-O-O',{rook:['a1','d1']}],['f8','b4','… Bb4'],['h3','h4','12. h4'],['h7','h6','… h6'],
    ['f3','e5','13. Ne5'],['g6','h7','… Bh7'],['g4','g5','14. g5'],['b4','c3','… Bxc3'],
    ['d2','c3','15. Bxc3'],['h6','g5','… hxg5'],['h4','g5','16. hxg5'],['f6','d5','… Nd5'],
    ['c4','d5','17. Bxd5'],['d8','d5','… Qxd5'],['e2','h5','18. Qh5'],['d5','e4','… Qe4'],
    ['h5','f7','19. Qxf7+'],['e8','d8','… Kd8'],['g5','g6','20. g6 · Black resigns']
  ];
  let chessMove=0;
  let chessPlaying=false;
  board.innerHTML=Array.from({length:64},(_,i)=>`<span class="square ${(Math.floor(i/8)+i%8)%2?'dark':''}" aria-hidden="true"></span>`).join('');
  const squarePosition=square=>({x:square.charCodeAt(0)-97,y:8-Number(square[1])});
  const setPiecePosition=(piece,square)=>{const {x,y}=squarePosition(square);piece.dataset.square=square;piece.style.setProperty('--x',x);piece.style.setProperty('--y',y);};
  const chessButton=()=>document.querySelector('[data-action="chess-play"]');
  function resetChess(){
    clearTimeout(chessTimer);
    chessMove=0;
    chessPlaying=false;
    board.querySelectorAll('.piece').forEach(piece=>piece.remove());
    starting.forEach((row,y)=>[...row].forEach((char,x)=>{if(char!=='.'){const piece=document.createElement('span');piece.className=`piece ${char===char.toUpperCase()?'white-piece':'black-piece'}`;piece.textContent=symbols[char];setPiecePosition(piece,`${String.fromCharCode(97+x)}${8-y}`);board.append(piece);}}));
    document.querySelector('.moves').textContent='Ready · 39 half-moves';
    document.querySelector('.game-progress i').style.width='0%';
    chessButton().textContent='Play game';
  }
  function applyChessMove(){
    if(!chessPlaying||chessMove>=gameMoves.length) return;
    const [from,to,label,extra]=gameMoves[chessMove];
    const piece=board.querySelector(`.piece[data-square="${from}"]`);
    const capture=board.querySelector(`.piece[data-square="${to}"]`);
    capture?.remove();
    if(!piece){resetChess();return;}
    setPiecePosition(piece,to);
    if(extra?.rook){const rook=board.querySelector(`.piece[data-square="${extra.rook[0]}"]`);if(rook)setPiecePosition(rook,extra.rook[1]);}
    chessMove+=1;
    document.querySelector('.moves').textContent=`${label} · ${chessMove}/${gameMoves.length}`;
    document.querySelector('.game-progress i').style.width=`${chessMove/gameMoves.length*100}%`;
    if(chessMove===gameMoves.length){chessPlaying=false;chessButton().textContent='Replay game';return;}
    chessTimer=setTimeout(applyChessMove,reduced.matches?30:410);
  }
  function playChess(){
    if(chessPlaying){chessPlaying=false;clearTimeout(chessTimer);chessButton().textContent='Resume game';return;}
    if(chessMove===gameMoves.length)resetChess();
    chessPlaying=true;
    chessButton().textContent='Pause';
    chessTimer=setTimeout(applyChessMove,reduced.matches?20:180);
  }
  resetChess();
  const initial=slides.findIndex(slide=>slide.id===location.hash.slice(1));
  const oldIndex=Number.parseInt(location.hash.slice(1),10)-1;
  show(initial>=0?initial:Number.isInteger(oldIndex)?oldIndex:0);
})();
