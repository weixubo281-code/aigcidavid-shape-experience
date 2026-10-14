import {createScenes,clamp,mix,smooth} from './scene.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const story=$('.intro-story'),work=$('#work'),process=$('#studio'),header=$('#header');
let scenes=null,frame=0,lastTime=0,pointerX=0,pointerY=0,storyCurrent=0,storyInitialized=false,introStartedAt=Infinity,revealTimer=null,pointerActive=false;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
// Preserve geometric marks while revealing the manifesto one letter at a time.
const letters=[];for(const line of $$('.manifesto-text>div')){for(const node of [...line.childNodes]){if(node.nodeType!==Node.TEXT_NODE)continue;const fragment=document.createDocumentFragment();for(const char of node.textContent){const s=document.createElement('span');s.className='letter';s.textContent=char;fragment.append(s);letters.push(s);}node.replaceWith(fragment);}}
const heroLetters=[];
for(const line of $$('.hero-type h1>span')){const text=line.textContent;line.textContent='';line.classList.add('hero-line');for(const ch of text){const s=document.createElement('span');s.className='hero-letter';s.textContent=ch===' '?'\u00a0':ch;line.append(s);heroLetters.push({el:s,line,x:0,y:0,r:0,vx:0,vy:0,vr:0});}}
function animateHeroType(dt,opening,intro){
 const enabled=pointerActive&&!reduced&&opening<.14&&intro>.95&&matchMedia('(pointer:fine)').matches;
 const lineBounds=new Map();
 heroLetters.forEach((c,index)=>{
  if(!lineBounds.has(c.line))lineBounds.set(c.line,c.line.getBoundingClientRect());
  const b=lineBounds.get(c.line),cx=b.left+c.el.offsetLeft+c.el.offsetWidth/2,cy=b.top+c.el.offsetHeight*.5,dx=pointerX-cx,dy=pointerY-cy;
  const radius=Math.max(65,c.el.offsetHeight*.75),d=Math.hypot(dx,dy*.85),force=enabled?Math.pow(clamp(1-d/radius),1.7):0;
  const tx=-dx*force*.085,ty=(-10-dy*.055)*force,tr=dx/radius*force*20;
  const spring=(value,velocity,target)=>{velocity+=(175*(target-value)-15*velocity)*dt;return[value+velocity*dt,velocity];};
  [c.x,c.vx]=spring(c.x,c.vx,tx);[c.y,c.vy]=spring(c.y,c.vy,ty);[c.r,c.vr]=spring(c.r,c.vr,tr);
  const enter=reduced?1:smooth(.03+index*.015,.42+index*.015,intro);
  c.el.style.opacity=enter;
  c.el.style.transform='translate3d('+c.x+'px,'+(c.y+(1-enter)*c.el.offsetHeight*.65)+'px,0) rotate('+(c.r-(1-enter)*9)+'deg) skewX('+(-c.r*.2)+'deg)';
 });
}
const serviceMotion=$$('.service-card').map(card=>{
 const state={card,hover:0,v:0,x:0,y:0,vx:0,vy:0,tx:0,ty:0,inside:false,focused:false};
 const cta=document.createElement('button');cta.className='service-learn';cta.type='button';cta.innerHTML='LEARN MORE <span>+</span>';cta.setAttribute('aria-expanded','false');card.append(cta);
 card.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')state.inside=true;});
 card.addEventListener('pointermove',e=>{const b=card.getBoundingClientRect();state.tx=clamp((e.clientX-b.left)/b.width)*2-1;state.ty=clamp((e.clientY-b.top)/b.height)*2-1;});
 card.addEventListener('pointerleave',()=>{state.inside=false;state.tx=state.ty=0;});
 card.addEventListener('focusin',()=>state.focused=true);card.addEventListener('focusout',e=>{state.focused=card.contains(e.relatedTarget);});
 return state;
});
function animateServices(dt,handoff){serviceMotion.forEach((s,i)=>{
 const active=handoff>.9&&((s.inside&&pointerActive)||s.focused),target=active?1:0;
 const spring=(key,vel,to)=>{s[vel]+=(190*(to-s[key])-19*s[vel])*dt;s[key]+=s[vel]*dt;};
 if(reduced){s.hover=target;s.x=s.y=0;}else{spring('hover','v',target);spring('x','vx',active?s.tx:0);spring('y','vy',active?s.ty:0);}
 const land=smooth(.18+i*.055,.78+i*.055,handoff);
 s.card.style.transform='translate3d(0,'+((1-land)*160-s.hover*16)+'px,0)';
 s.card.style.opacity=smooth(.12+i*.055,.55+i*.055,handoff);
 s.card.classList.toggle('is-hovered',active);
 });}
const loading=$('#loading-screen');let ready=0,shown=0,loadingActive=true,started=performance.now(),assetsReady=false;
function finishLoading(){
 if(!loadingActive)return;loadingActive=false;introStartedAt=performance.now();
 $('#load-number').textContent='100';$('#load-line').style.width='100%';loading.classList.add('reveal-start');
 document.body.classList.add('intro-started');$('#intro-curtain').classList.add('playing');
 clearTimeout(revealTimer);revealTimer=setTimeout(()=>{loading.classList.add('complete');$('#intro-curtain').classList.remove('playing');document.body.classList.remove('loading');document.body.classList.add('entered');},reduced?50:1850);
}
$('#skip-loading').onclick=finishLoading;
const imageSources=[...new Set($$('img').map(img=>img.getAttribute('src')))];const total=imageSources.length+2;
const jobs=imageSources.map(src=>new Promise(resolve=>{const img=new Image();img.onload=img.onerror=()=>{ready++;resolve();};img.src=src;}));jobs.push(Promise.resolve(document.fonts.ready).then(()=>ready++));
try{scenes=createScenes();ready++;$('.model-fallback').style.display='none';}catch(error){console.error('3D initialization:',error);ready++;document.body.classList.add('no-webgl');toast('当前设备未能启动三维渲染，页面将显示静态标识。');}
Promise.allSettled(jobs).then(()=>assetsReady=true);
$('#replay-loading').onclick=()=>{scrollTo({top:0,behavior:'instant'});loadingActive=true;loading.classList.remove('complete','reveal-start');$('#intro-curtain').classList.remove('playing');document.body.classList.remove('intro-started','entered');document.body.classList.add('loading');introStartedAt=Infinity;pointerActive=false;heroLetters.forEach(c=>{c.x=c.y=c.r=c.vx=c.vy=c.vr=0;});shown=0;ready=total;assetsReady=true;started=performance.now();};
const progress=element=>{const r=element.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight));};
function sectionTheme(){const all=$$('main>[data-section]');let active=all[0];for(const el of all){const b=el.getBoundingClientRect();if(b.top<innerHeight*.35&&b.bottom>innerHeight*.35)active=el;}const stage=progress(story);$('#section-index').textContent=active===story?(stage>.64?'03':stage>.15?'02':'01'):active.dataset.section;const atHeader=document.elementFromPoint(innerWidth*.9,80);let themeEl=atHeader?.closest('[data-theme]');if(!themeEl)themeEl=active;const dark=themeEl.dataset.theme==='dark';header.classList.toggle('dark',dark);$('.section-indicator').classList.toggle('dark',active.dataset.theme==='dark');for(const a of $$('#header nav a'))a.classList.toggle('active',a.dataset.nav===(active===story&&stage>.64?'services':active.id));const y=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);$('.scroll-line i').style.transform='translateY('+(y*$('.scroll-line').clientHeight*.8)+'px)';}
function updateLayout(time,dt){const intro=reduced?1:clamp((time*1000-introStartedAt-470)/1300);const raw=progress(story);if(!storyInitialized){storyCurrent=raw;storyInitialized=true;}storyCurrent=mix(storyCurrent,raw,reduced?1:1-Math.exp(-dt*14));const opening=storyCurrent,p=clamp(opening/.64),handoff=smooth(.56,.80,opening),phase=progress(process);const heroExit=smooth(.025,.22,p);$('.hero-type').style.transform='translateY('+(-heroExit*110)+'px)';$('.hero-type').style.opacity=1-heroExit;$('.hero-scroll').style.opacity=1-heroExit;$('.model-label').style.opacity=(1-heroExit)*.65;
const explosion=smooth(.25,.66,p),mobile=innerWidth<=600;const pin=$('.story-pin');const base=mobile?{x:-.09,y:.50,w:1.1,h:.46}:{x:.39,y:.09,w:.61,h:.84};const slot=$('#hero-model');Object.assign(slot.style,{left:mix(base.x,0,explosion)*100+'%',top:mix(base.y,0,explosion)*100+'%',width:mix(base.w,1,explosion)*100+'%',height:mix(base.h,1,explosion)*100+'%',right:'auto',pointerEvents:p>.28?'none':'auto'});slot.tabIndex=p>.28?-1:0;
$('.manifesto-layer').style.opacity=smooth(.17,.35,p)*(1-smooth(.88,1,p));
const serviceLayer=$('.service-layer');serviceLayer.style.opacity=smooth(.05,.35,handoff);serviceLayer.style.pointerEvents=handoff>.7?'auto':'none';serviceLayer.setAttribute('aria-hidden',String(handoff<.05));serviceLayer.inert=handoff<.7;$('.service-wipe').style.clipPath='circle('+(handoff*155)+'% at 18% 78%)';serviceLayer.querySelector('h2').style.transform='translateY('+(1-handoff)*85+'px) rotate('+((1-handoff)*8)+'deg)';animateServices(dt,handoff);
const fill=smooth(.38,.79,p);letters.forEach((letter,i)=>letter.classList.toggle('filled',i/letters.length<=fill));
const wp=progress(work),track=$('.work-track'),windowEl=$('.work-window');const maxX=Math.max(0,track.scrollWidth-windowEl.clientWidth+innerWidth*.055);track.style.transform='translate3d('+(-wp*maxX)+'px,0,0)';$('.work-progress>span').style.width=(6+wp*94)+'%';$('#case-count').textContent=String(Math.min(4,1+Math.floor(wp*3.99))).padStart(2,'0');
const activePhase=Math.min(2,Math.floor(phase*2.999));$$('.process-step').forEach((b,i)=>{b.classList.toggle('active',i===activePhase);b.setAttribute('aria-pressed',String(i===activePhase));});$('#phase-label').textContent=['SKETCH','SCULPT','SHIP'][activePhase];
animateHeroType(dt,opening,intro);$('.hero-grid').style.opacity=smooth(0,.3,intro)*(1-smooth(.05,.30,p));if(frame%5===0)sectionTheme();scenes?.update({time,dt,story:p,handoff,phase,reduced,pointerX,pointerY,pointerActive,intro,serviceMotion});
if(frame%3===0&&matchMedia('(pointer:fine)').matches){let label='';if(pointerY>75)label=scenes?.hitTest(pointerX,pointerY)||'';const over=document.elementFromPoint(pointerX,pointerY);if(over?.closest('.case'))label='VIEW';if(over?.closest('button,a,input,textarea,select,.process-steps'))label='';const serviceDot=handoff>.9&&pointerActive&&over?.closest('.service-card')&&!over?.closest('button,a');$('#cursor').classList.toggle('service-dot',!!serviceDot);$('#cursor').style.opacity=(label||serviceDot)?'1':'0';$('#cursor span').textContent=label;$('#cursor').style.transform='translate3d('+(pointerX+7)+'px,'+(pointerY+7)+'px,0)';}
}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.032,(now-(lastTime||now))/1000);lastTime=now;frame++;if(document.hidden)return;if(loadingActive){const elapsed=now-started,target=Math.min(97,(ready/total)*97);shown=mix(shown,target,.075);if(assetsReady&&elapsed>2100)shown=mix(shown,100,.2);$('#load-number').textContent=String(Math.floor(shown)).padStart(2,'0');$('#load-line').style.width=shown+'%';if((shown>99.5&&elapsed>2400)||elapsed>11000)finishLoading();}updateLayout(now/1000,dt);}
requestAnimationFrame(animate);
addEventListener('pointermove',e=>{pointerX=e.clientX;pointerY=e.clientY;pointerActive=true;},{passive:true});
$('#showreel').onclick=()=>{scenes?.poke();toast('拖动旋转 · 点击回弹 · 双击复位 · 向下滚动拆解雕塑');};
const moveThrough=(el,p)=>{const r=el.getBoundingClientRect(),start=scrollY+r.top;scrollTo({top:start+(r.height-innerHeight)*p,behavior:reduced?'instant':'smooth'});};
$$('.process-step').forEach(b=>b.onclick=()=>moveThrough(process,[.08,.48,.92][+b.dataset.phase]));
$('#case-prev').onclick=()=>moveThrough(work,clamp(progress(work)-.32));$('#case-next').onclick=()=>moveThrough(work,clamp(progress(work)+.32));
let touchStart=null;$('.work-window').addEventListener('touchstart',e=>{touchStart=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});$('.work-window').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)moveThrough(work,clamp(progress(work)+(dx<0?.31:-.31)));touchStart=null;},{passive:true});
$$('.service-toggle,.service-learn').forEach(b=>b.onclick=()=>{const card=b.closest('.service-card'),open=card.classList.toggle('open');card.querySelectorAll('.service-toggle,.service-learn').forEach(toggle=>toggle.setAttribute('aria-expanded',String(open)));card.querySelector('.service-learn').innerHTML=(open?'LESS INFO':'LEARN MORE')+' <span>'+(open?'−':'+')+'</span>';});
$('.menu-button').onclick=()=>{const open=$('#header nav').classList.toggle('open');$('.menu-button').setAttribute('aria-expanded',String(open));};$$('#header nav a').forEach(a=>a.onclick=()=>{$('#header nav').classList.remove('open');$('.menu-button').setAttribute('aria-expanded','false');});
const caseData=[{title:'Quiet Orbit',type:'PRODUCT / 白噪声唤醒灯',image:'assets/quiet-orbit.png',description:'以温暖的环形灯光、中央圆形显示和浅灰织物底座，表达安静陪伴与自然唤醒的产品体验。'}, {title:'Temple of Heaven',type:'DIGITAL SPACE / 祈年殿',image:'assets/temple-of-heaven.png',description:'通过建筑结构、材质细节和电影式光影，重新发现祈年殿的空间秩序与文化气质。'}, {title:'Gravity Racing',type:'GAME / 未来赛车',image:'assets/gravity-racing.png',description:'云端城市、纵向赛道与发光轮廓，在速度与重力之间展开具有想象力的游戏视觉。'}, {title:'Beyond the Screen',type:'HMI / 智能座舱',image:'assets/automotive-hmi.png',description:'连接驾驶情境、导航和车内交互，以清晰的信息层级、一致的视觉语言，构建自然流畅的座舱体验。'}];
const modal=$('#case-modal');let returnFocus=null;function closeModal(){modal.close();document.body.style.overflow='';returnFocus?.focus({preventScroll:true});}
$('.modal-close').onclick=closeModal;modal.addEventListener('close',()=>document.body.style.overflow='');modal.addEventListener('click',e=>{const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();});
$$('.case').forEach(b=>b.onclick=()=>{returnFocus=b;const d=caseData[+b.dataset.case];$('.modal-body').innerHTML='<img src="'+d.image+'" alt="'+d.title+'"><div class="modal-copy"><div class="eyebrow">'+d.type+'</div><h2>'+d.title.toUpperCase()+'</h2><p>'+d.description+'</p><a href="#contact" class="button navy" id="case-contact">LET’S MAKE SOMETHING TOGETHER ⟶</a></div>';modal.showModal();document.body.style.overflow='hidden';$('#case-contact').onclick=closeModal;});
$$('.budget').forEach(b=>b.onclick=()=>{$$('.budget').forEach(other=>{other.classList.toggle('selected',other===b);other.setAttribute('aria-pressed',String(other===b));});});
$('#brief-form').onsubmit=async e=>{e.preventDefault();const data=new FormData(e.target),text='PROJECT BRIEF / AIGCIDAVID\n称呼：'+data.get('name')+'\n项目类型：'+data.get('type')+'\n预算：'+$('.budget.selected').textContent+'\n需求：'+data.get('idea');try{await navigator.clipboard.writeText(text);toast('项目简报已复制，请通过现有联系方式发给 David。');}catch{let out=$('.brief-result');if(!out){out=document.createElement('textarea');out.className='brief-result';out.readOnly=true;out.setAttribute('aria-label','生成的项目简报');e.target.append(out);}out.value=text;out.focus();out.select();toast('简报已生成，请复制下方文本。');}};
window.addEventListener('pagehide',()=>scenes?.dispose(),{once:true});

$$('a[href="#services"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();moveThrough(story,.88);}));

addEventListener('pointerout',e=>{if(!e.relatedTarget)pointerActive=false;});
addEventListener('blur',()=>pointerActive=false);
