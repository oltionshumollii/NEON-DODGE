const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
const $=id=>document.getElementById(id);let state="ready",score=0,level=1,time=0,spawn=0,core=0,slow=0,last=performance.now();
let best=+(localStorage.getItem("neonDodgeBest")||0),keys={},hazards=[],cores=[],particles=[],stars=[];
const player={x:W/2,y:H-65,r:13,speed:430};
for(let i=0;i<110;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:.3+Math.random()*1.5});
$("bestTop").textContent=String(best).padStart(6,"0");
function boot(){score=0;level=1;time=0;spawn=.1;core=2;slow=0;hazards=[];cores=[];particles=[];player.x=W/2;state="play";$("menu").classList.add("hidden");$("pause").classList.add("hidden");$("over").classList.add("hidden");$("stateText").textContent="LIVE"}
function pause(){if(state==="play"){state="pause";$("pause").classList.remove("hidden");$("stateText").textContent="PAUSED"}else if(state==="pause"){state="play";$("pause").classList.add("hidden");$("stateText").textContent="LIVE"}}
function end(){state="over";best=Math.max(best,score|0);localStorage.setItem("neonDodgeBest",best);$("bestTop").textContent=String(best).padStart(6,"0");$("finalScore").textContent=(score|0).toLocaleString();$("finalBest").textContent=best.toLocaleString();$("endLevel").textContent="LEVEL "+String(level).padStart(2,"0")+".";$("over").classList.remove("hidden");$("stateText").textContent="OFFLINE";burst(player.x,player.y,38,"#ff4fd8")}
function burst(x,y,n,col){for(let i=0;i<n;i++){let a=Math.random()*6.28,s=50+Math.random()*230;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.35+Math.random()*.7,col})}}
function collide(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r}
function update(dt){time+=dt;level=1+(time/13|0);let sm=slow>0?.43:1;slow=Math.max(0,slow-dt);
let dir=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0);player.x=Math.max(18,Math.min(W-18,player.x+dir*player.speed*dt));
spawn-=dt;if(spawn<=0){let s=9+Math.random()*15;hazards.push({x:25+Math.random()*(W-50),y:-30,s,r:s*.52,sp:155+level*27+Math.random()*100,a:Math.random()*6.28,rot:(Math.random()-.5)*5});spawn=Math.max(.2,.68-level*.045)*(.65+Math.random()*.55)}
core-=dt;if(core<=0){cores.push({x:35+Math.random()*(W-70),y:-20,r:7,a:0,sp:125+level*8});core=4+Math.random()*3.5}
hazards.forEach(h=>{h.y+=h.sp*dt*sm;h.a+=h.rot*dt;if(collide(player,h)){end()}});hazards=hazards.filter(h=>h.y<H+50);
cores.forEach(o=>{o.y+=o.sp*dt*sm;o.a+=dt*5;if(Math.hypot(player.x-o.x,player.y-o.y)<player.r+o.r+4){score+=120;slow=5;burst(o.x,o.y,20,"#5cf5ff");o.dead=1}});cores=cores.filter(o=>o.y<H+30&&!o.dead);
score+=dt*(11+level*2.3);
particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;p.l-=dt});particles=particles.filter(p=>p.l>0);
$("score").textContent=(score|0).toString().padStart(6,"0");$("level").textContent=String(level).padStart(2,"0");$("mult").textContent="x"+(1+level*.1).toFixed(1);$("charge").style.width=(slow/5*100)+"%";$("chargeText").textContent=slow>0?"SLOW-MO":"READY"}
function draw(){ctx.fillStyle="#020309";ctx.fillRect(0,0,W,H);
let bg=ctx.createRadialGradient(W*.5,H*.7,20,W*.5,H*.7,H*.8);bg.addColorStop(0,"#10202b");bg.addColorStop(1,"#020309");ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
stars.forEach(s=>{ctx.globalAlpha=.15+s.s/4;ctx.fillStyle="#a8b5ff";ctx.fillRect(s.x,s.y,s.s,s.s);s.y+=s.s*.16;if(s.y>H)s.y=0});ctx.globalAlpha=1;
ctx.strokeStyle="#5cf5ff0b";ctx.lineWidth=1;for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
hazards.forEach(h=>{ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a);ctx.shadowBlur=24;ctx.shadowColor="#ff4fd8";ctx.fillStyle="#ff4fd8";ctx.beginPath();ctx.moveTo(0,-h.s);ctx.lineTo(h.s*.72,h.s*.6);ctx.lineTo(-h.s*.72,h.s*.6);ctx.closePath();ctx.fill();ctx.restore()});
cores.forEach(o=>{ctx.save();ctx.shadowBlur=30;ctx.shadowColor="#5cf5ff";ctx.fillStyle="#5cf5ff";ctx.beginPath();ctx.arc(o.x,o.y,o.r+Math.sin(o.a)*1.7,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(o.x-2,o.y-2,2,0,7);ctx.fill();ctx.restore()});
ctx.save();ctx.translate(player.x,player.y);ctx.shadowBlur=35;ctx.shadowColor="#9b6cff";ctx.fillStyle="#9b6cff";ctx.beginPath();ctx.arc(0,0,player.r,0,7);ctx.fill();ctx.strokeStyle="#5cf5ff";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,player.r+8+Math.sin(time*7)*2,0,7);ctx.stroke();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-4,-4,3.5,0,7);ctx.fill();ctx.restore();
particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.col;ctx.shadowBlur=12;ctx.shadowColor=p.col;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1}
function loop(t){let dt=Math.min(.032,(t-last)/1000);last=t;if(state==="play")update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
addEventListener("keydown",e=>{keys[e.key]=1;if(["ArrowLeft","ArrowRight","a","d","p"," "].includes(e.key))e.preventDefault();if(e.key.toLowerCase()=="p")pause();if(e.key==" "&&state=="ready")boot()});addEventListener("keyup",e=>keys[e.key]=0);
$("start").onclick=boot;$("resume").onclick=pause;$("again").onclick=boot;
