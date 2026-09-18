const arena=document.getElementById('arena'),target=document.getElementById('target'),start=document.getElementById('start'),scoreEl=document.getElementById('score'),timeEl=document.getElementById('time'),hitsEl=document.getElementById('hits'),missesEl=document.getElementById('misses'),accEl=document.getElementById('accuracy'),avgEl=document.getElementById('avgReaction'),btn=document.getElementById('startBtn'),result=document.getElementById('result'),sensitivity=document.getElementById('sensitivity'),sensitivityValue=document.getElementById('sensitivityValue'),crosshair=document.getElementById('crosshair');
let score=0,hits=0,misses=0,shots=0,reactions=[],running=false,endAt,raf,targetShownAt,sensitivityLevel=1,mouseX=0,mouseY=0;

function spawn(){
  const r=35,x=r+Math.random()*(arena.clientWidth-r*2),y=r+Math.random()*(arena.clientHeight-r*2);
  target.style.left=x+'px';target.style.top=y+'px';targetShownAt=performance.now();
}
function updateStats(){
  scoreEl.textContent=score;hitsEl.textContent=hits;missesEl.textContent=misses;
  accEl.textContent=shots?Math.round(hits/shots*100):100;
  avgEl.textContent=reactions.length?Math.round(reactions.reduce((a,b)=>a+b,0)/reactions.length):'-';
}
function finish(){
  running=false;target.hidden=true;crosshair.hidden=true;
  if(document.pointerLockElement===arena)document.exitPointerLock();
  start.hidden=false;start.querySelector('h2').textContent='훈련 종료!';start.querySelector('p').textContent='훈련 결과';
  result.textContent='점수 '+score+'\n명중 '+hits+' · 빗나감 '+misses+'\n명중률 '+accEl.textContent+'% · 평균 '+avgEl.textContent+'ms';
  start.dataset.finished='true';btn.textContent='다시 시작';
}
function tick(){
  if(!running)return;
  const left=Math.max(0,endAt-performance.now())/1000;timeEl.textContent=left.toFixed(1);
  if(left<=0){finish();return}raf=requestAnimationFrame(tick);
}
function placeCrosshair(){
  crosshair.style.left=mouseX+'px';crosshair.style.top=mouseY+'px';
}
sensitivity.addEventListener('input',()=>{
  sensitivityLevel=Number(sensitivity.value);
  sensitivityValue.textContent=sensitivityLevel.toFixed(2);
});
arena.addEventListener('mousemove',e=>{
  if(!running||document.pointerLockElement!==arena)return;
  mouseX=Math.max(0,Math.min(arena.clientWidth,mouseX+e.movementX*sensitivityLevel));
  mouseY=Math.max(0,Math.min(arena.clientHeight,mouseY+e.movementY*sensitivityLevel));
  placeCrosshair();
});
arena.addEventListener('mousedown',e=>{
  if(!running)return;
  if(document.pointerLockElement!==arena)return;
  const rect=target.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const dx=(arena.getBoundingClientRect().left+mouseX)-cx,dy=(arena.getBoundingClientRect().top+mouseY)-cy;
  const radius=Math.min(rect.width,rect.height)/2;
  shots++;
  if(dx*dx+dy*dy<=radius*radius){
    hits++;const reaction=performance.now()-targetShownAt;reactions.push(reaction);
    score+=100+Math.max(0,Math.round(300-reaction));spawn();
  }else{misses++;score=Math.max(0,score-25)}
  updateStats();
});
document.addEventListener('pointerlockchange',()=>{
  if(running&&document.pointerLockElement!==arena)finish();
});
btn.addEventListener('click',()=>{
  score=0;hits=0;misses=0;shots=0;reactions=[];
  updateStats();result.textContent='';delete start.dataset.finished;
  start.querySelector('h2').textContent='30초 에임 연습';start.querySelector('p').textContent='타겟을 최대한 빠르게 클릭하세요.';
  timeEl.textContent='30.0';running=true;start.hidden=true;target.hidden=false;crosshair.hidden=false;
  mouseX=arena.clientWidth/2;mouseY=arena.clientHeight/2;placeCrosshair();spawn();
  endAt=performance.now()+30000;cancelAnimationFrame(raf);tick();arena.requestPointerLock();
});