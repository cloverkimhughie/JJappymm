const arena=document.getElementById('arena'),target=document.getElementById('target'),start=document.getElementById('start'),scoreEl=document.getElementById('score'),timeEl=document.getElementById('time'),hitsEl=document.getElementById('hits'),missesEl=document.getElementById('misses'),accEl=document.getElementById('accuracy'),avgEl=document.getElementById('avgReaction'),btn=document.getElementById('startBtn');
let score=0,hits=0,misses=0,shots=0,reactions=[],running=false,endAt,raf,targetShownAt;

function spawn(){
  const r=35;
  const x=r+Math.random()*(arena.clientWidth-r*2);
  const y=r+Math.random()*(arena.clientHeight-r*2);
  target.style.left=x+'px';
  target.style.top=y+'px';
  targetShownAt=performance.now();
}

function updateStats(){
  scoreEl.textContent=score;
  hitsEl.textContent=hits;
  missesEl.textContent=misses;
  accEl.textContent=shots?Math.round(hits/shots*100):100;
  avgEl.textContent=reactions.length?Math.round(reactions.reduce((a,b)=>a+b,0)/reactions.length):'-';
}

function finish(){
  running=false;
  target.hidden=true;
  start.hidden=false;
  start.querySelector('h2').textContent='훈련 종료!';
  start.querySelector('p').textContent='점수 '+score+' · 명중 '+hits+' · 빗나감 '+misses+' · 평균 '+avgEl.textContent+'ms · 명중률 '+accEl.textContent+'%';
  btn.textContent='다시 시작';
}

function tick(){
  if(!running)return;
  const left=Math.max(0,endAt-performance.now())/1000;
  timeEl.textContent=left.toFixed(1);
  if(left<=0){finish();return;}
  raf=requestAnimationFrame(tick);
}

arena.addEventListener('pointerdown',e=>{
  if(!running)return;

  const rect=target.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  const dx=e.clientX-cx;
  const dy=e.clientY-cy;
  const radius=Math.min(rect.width,rect.height)/2;
  const isHit=(dx*dx+dy*dy)<=radius*radius;

  e.preventDefault();
  shots++;

  if(isHit){
    hits++;
    const reaction=performance.now()-targetShownAt;
    reactions.push(reaction);
    score+=100+Math.max(0,Math.round(300-reaction));
    updateStats();
    spawn();
  }else{
    misses++;
    score=Math.max(0,score-25);
    updateStats();
  }
});

btn.addEventListener('click',()=>{
  score=0;
  hits=0;
  misses=0;
  shots=0;
  reactions=[];
  updateStats();
  timeEl.textContent='30.0';
  running=true;
  start.hidden=true;
  target.hidden=false;
  spawn();
  endAt=performance.now()+30000;
  cancelAnimationFrame(raf);
  tick();
});