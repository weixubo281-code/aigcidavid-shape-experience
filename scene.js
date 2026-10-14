import * as T from './assets/three.module.js';
export const palette={blue:0x2855f4,cream:0xf2eee2,coral:0xe95e50,yellow:0xf4d53c,pink:0xe94ca4,navy:0x142e92};
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function clay(color){const material=new T.MeshStandardMaterial({color,roughness:.87,metalness:0});material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGrain;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGrain = position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGrain;').replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(vGrain.xyz,vec3(1429.31,2711.17,1943.73)))*43758.5453);\ndiffuseColor.rgb *= .975 + grain * .05;');};material.customProgramCacheKey=()=> 'clay-grain-v1';return material;}
function add(parent,g,color,xyz=[0,0,0],rot=[0,0,0]){const m=new T.Mesh(g,clay(color));m.position.fromArray(xyz);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function extrude(shape,depth,bevel=.06){const g=new T.ExtrudeGeometry(shape,{depth:depth-bevel*2,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:4,steps:1,curveSegments:48});g.translate(0,0,-(depth-bevel*2)/2);return g;}
function roundedBox(w,h,d){const r=Math.min(w,h)*.07,s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return extrude(s,d,.045);}
function halfRing(radius,inner){const s=new T.Shape();s.moveTo(0,radius);s.absarc(0,0,radius,Math.PI/2,-Math.PI/2,true);s.lineTo(0,-inner);s.absarc(0,0,inner,-Math.PI/2,Math.PI/2,false);s.closePath();return extrude(s,.72,.065);}
function arch(){const s=new T.Shape();s.moveTo(-.8,-1);s.lineTo(-.8,.2);s.absarc(0,.2,.8,Math.PI,0,true);s.lineTo(.8,-1);s.lineTo(.38,-1);s.lineTo(.38,.2);s.absarc(0,.2,.38,0,Math.PI,false);s.lineTo(-.38,-1);s.closePath();return extrude(s,.55,.055);}
function steps(){const s=new T.Shape();s.moveTo(-.8,-.9);s.lineTo(.8,-.9);s.lineTo(.8,-.3);s.lineTo(.25,-.3);s.lineTo(.25,.3);s.lineTo(-.28,.3);s.lineTo(-.28,.9);s.lineTo(-.8,.9);s.closePath();return extrude(s,.8,.035);}
export function sculpture(){const root=new T.Group(),parts=[];const put=(g,color,pos,rot=[0,0,0],drift=[0,0,0])=>{const m=add(root,g,color,pos,rot);m.userData={home:m.position.clone(),rotation:m.rotation.clone(),drift:new T.Vector3(...drift),color:new T.Color(color),kick:0,velocity:0,offset:0,hx:0,hy:0,hr:0,hvx:0,hvy:0,hvr:0,wasHovered:false,index:parts.length};parts.push(m);return m;};
const base=add(root,new T.CylinderGeometry(3.05,3.05,.4,112,1),palette.cream,[0,-2.05,0]);base.userData.base=true;
put(roundedBox(.62,3.6,.8),palette.coral,[-2.05,-.08,0],[0,0,-.34],[-3.4,2.4,-.4]);
put(roundedBox(.62,3.6,.8),palette.coral,[-.88,-.08,.02],[0,0,.34],[2.9,3,-.2]);
put(roundedBox(1.48,.52,.93),palette.pink,[-1.45,-.35,.18],[0,0,0],[-2.5,-1,2]);
put(roundedBox(.65,3.35,.76),palette.navy,[.58,-.1,-.03],[0,0,0],[3.2,1.8,-1]);
put(halfRing(1.67,.96),palette.yellow,[.7,-.09,0],[0,0,0],[3.7,-1.6,-.4]);
put(new T.SphereGeometry(.49,48,32),palette.cream,[-1.45,2.2,.05],[0,0,0],[-.6,2.6,0]);
put(new T.TorusGeometry(.59,.21,24,72),palette.cream,[2.02,-1,1.6],[.15,.38,-.45],[-4,-1.6,1]);
put(steps(),palette.navy,[.82,-.95,1.02],[0,0,0],[2.7,2.5,1]);
put(new T.ConeGeometry(.43,1.08,64),palette.yellow,[-.45,-1.32,1.8],[0,0,0],[3,-.1,1.4]);
const half=new T.Shape();half.moveTo(-.64,-.5);half.lineTo(.64,-.5);half.lineTo(.64,-.1);half.absarc(0,-.1,.64,0,Math.PI,false);half.closePath();
put(arch().scale(.55,.55,.55),palette.coral,[-2.05,-1.28,1.4],[0,.13,0],[-2.5,-2.4,.7]);
put(new T.SphereGeometry(.18,32,24),palette.navy,[-1.47,-1.64,2.03],[0,0,0],[-2.6,1.3,1]);
put(new T.SphereGeometry(.2,32,24),palette.coral,[-3,.85,.08],[0,0,0],[-1.4,.8,0]);
put(new T.SphereGeometry(.16,32,24),palette.navy,[3,1.25,-.3],[0,0,0],[1.3,.1,.5]);
put(new T.SphereGeometry(.17,32,24),palette.cream,[3.2,-.05,.4],[0,0,0],[.9,-1.5,1]);
put(new T.ConeGeometry(.32,.62,4),palette.pink,[3.04,.47,.1],[0,.4,.2],[1.4,-2,0]);
root.userData={parts,base};return root;}
function makeWorld(host){const layer=document.createElement('div');layer.className='scene-canvas';host.prepend(layer);const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;layer.append(renderer.domElement);const scene=new T.Scene();scene.add(new T.HemisphereLight(0xfff6e7,0x8d99c0,1.65));const key=new T.DirectionalLight(0xfff4df,3.1);key.position.set(-3.5,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});key.shadow.bias=-.00015;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);const fill=new T.DirectionalLight(0xcbd6ff,.7);fill.position.set(5,2,-5);scene.add(fill);const camera=new T.PerspectiveCamera(34,1,.1,100);const shadow=new T.Mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.16}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.27;shadow.receiveShadow=true;scene.add(shadow);const world={host,layer,renderer,scene,camera,key,shadow,models:[],width:1,height:1,resize(){this.width=host.clientWidth;this.height=host.clientHeight;renderer.setSize(this.width,this.height,false);},clear(){renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);},draw(rect,model,options={}){this.models.forEach(m=>m.visible=m===model);const w=rect.width,h=rect.height;if(w<1||h<1)return;const x=rect.x,y=this.height-rect.y-h;renderer.setViewport(x,y,w,h);renderer.setScissor(Math.max(0,x),Math.max(0,y),Math.min(w,this.width-Math.max(0,x)),Math.min(h,this.height-Math.max(0,y)));camera.aspect=w/h;const distance=Math.max(8.8,6.7/(2*Math.tan(T.MathUtils.degToRad(17))*camera.aspect),6.4/(2*Math.tan(T.MathUtils.degToRad(17))));camera.position.set(distance*.14,distance*.23,distance);camera.lookAt(0,options.lookY??.1,0);camera.updateProjectionMatrix();renderer.render(scene,camera);},add(model){scene.add(model);this.models.push(model);return model;}};new ResizeObserver(()=>world.resize()).observe(host);world.resize();return world;}
function slotRect(world,element){const a=world.host.getBoundingClientRect(),b=element.getBoundingClientRect();return{x:b.left-a.left,y:b.top-a.top,width:b.width,height:b.height};}
export function createScenes(){const hero=makeWorld(document.querySelector('.story-pin')),process=makeWorld(document.querySelector('.process-pin')),contact=makeWorld(document.querySelector('#contact'));
const worlds=[hero,process,contact];const heroAD=hero.add(sculpture()),processAD=process.add(sculpture()),contactAD=contact.add(sculpture());
const serviceIndices=[9,5,6,7],serviceModels=serviceIndices.map(i=>heroAD.userData.parts[i]);
const raycaster=new T.Raycaster(),pointer=new T.Vector2();let yaw=0,pitch=0,targetYaw=0,targetPitch=0,dragging=false,last=[0,0],travel=0,hover=null;const interactionSlots=[['#hero-model',hero,heroAD],['#contact-model',contact,contactAD]];let activeWorld=null;
for(const [selector,w,ad]of interactionSlots){const slot=document.querySelector(selector);slot.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary===false)return;dragging=true;activeWorld=w;last=[e.clientX,e.clientY];travel=0;slot.setPointerCapture(e.pointerId);});slot.addEventListener('pointermove',e=>{if(!dragging||activeWorld!==w)return;const dx=e.clientX-last[0],dy=e.clientY-last[1];targetYaw+=dx*.008;targetPitch=clamp(targetPitch+dy*.004,-.26,.24);travel+=Math.abs(dx)+Math.abs(dy);last=[e.clientX,e.clientY];});const release=e=>{if(!dragging||activeWorld!==w)return;dragging=false;if(travel<9){const hit=pick(e.clientX,e.clientY,w,ad,slot);if(hit)hit.userData.velocity=7;}};slot.addEventListener('pointerup',release);slot.addEventListener('pointercancel',()=>dragging=false);slot.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetYaw+=(e.key==='ArrowLeft'?-.22:.22);}if(e.key===' '||e.key==='Enter'){e.preventDefault();ad.userData.parts.forEach((m,i)=>m.userData.velocity=4+i*.12);}});slot.addEventListener('dblclick',()=>{targetYaw=0;targetPitch=0;});}
function pick(x,y,w,ad,slot){const rect=slot.getBoundingClientRect();pointer.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,w.camera);const hit=raycaster.intersectObjects(ad.userData.parts,false)[0];return hit?.object;}
function resetPart(m){const u=m.userData;m.position.copy(u.home);m.rotation.copy(u.rotation);m.scale.setScalar(1);m.material.color.copy(u.color);}
function bounce(m,dt){const u=m.userData;u.velocity+=(-90*u.offset-9*u.velocity)*dt;u.offset+=u.velocity*dt;m.position.y+=u.offset;m.rotation.z+=u.offset*.3;const squash=clamp(u.offset*.1,-.09,.09);m.scale.set(1-squash,1+squash,1-squash*.5);}
return {worlds,hero,process,contact,heroAD,processAD,contactAD,serviceModels,ready:true,poke(){heroAD.userData.parts.forEach((m,i)=>m.userData.velocity=5+i*.14);targetYaw+=Math.PI*2;},update({time,dt,story,handoff=0,phase,reduced,pointerX,pointerY,pointerActive=false,intro=1,serviceMotion=[]}){yaw=mix(yaw,targetYaw,.08);pitch=mix(pitch,targetPitch,.08);const t=reduced?0:time;const heroVisible=hero.host.getBoundingClientRect().bottom>0&&hero.host.getBoundingClientRect().top<innerHeight;
if(heroVisible){hero.clear();const explosion=smooth(.25,.66,story);const rect=slotRect(hero,document.querySelector('#hero-model'));const slotElement=document.querySelector('#hero-model'),screenRect=slotElement.getBoundingClientRect();const canHover=pointerActive&&!reduced&&!dragging&&story<.20&&intro>.97;const hovered=canHover?pick(pointerX,pointerY,hero,heroAD,slotElement):null;const leanX=canHover?clamp((pointerX-screenRect.left)/screenRect.width-.5,-.5,.5)*.045:0,leanY=canHover?clamp((pointerY-screenRect.top)/screenRect.height-.5,-.5,.5)*.035:0;heroAD.userData.leanX=mix(heroAD.userData.leanX||0,leanX,1-Math.exp(-dt*9));heroAD.userData.leanY=mix(heroAD.userData.leanY||0,leanY,1-Math.exp(-dt*9));heroAD.rotation.set((pitch+heroAD.userData.leanY)*(1-explosion),(yaw+heroAD.userData.leanX)*(1-explosion)+explosion*.5,0);heroAD.position.set(0,0,0);heroAD.scale.setScalar(mix(1,.74,explosion));heroAD.userData.base.position.set(0,-2.05-explosion*7,0);heroAD.userData.base.scale.setScalar(1);heroAD.userData.parts.forEach((m,i)=>{resetPart(m);const u=m.userData;m.position.addScaledVector(u.drift,explosion);m.position.z+=Math.sin(i*2.1)*explosion*1.3;const rot=explosion*(i%2?1:-1);m.rotation.x+=rot*.8;m.rotation.y+=rot*1.4;m.rotation.z+=rot*.5;if(!reduced){m.position.y+=Math.sin(t*.8+i)*.03*(i>10?2:1);m.rotation.y+=Math.sin(t*.35+i)*.015;}bounce(m,dt);
const hot=hovered===m;
if(hot&&!u.wasHovered)u.velocity=Math.min(u.velocity+.65,1.1);
u.wasHovered=hot;
const sx=hot?clamp((pointerX-screenRect.left)/screenRect.width-.5,-.5,.5)*.10:0,sy=hot?.035:0,sr=hot?clamp((pointerX-screenRect.left)/screenRect.width-.5,-.5,.5)*.035:0;
for(const [value,velocity,target]of [['hx','hvx',sx],['hy','hvy',sy],['hr','hvr',sr]]){u[velocity]+=(125*(target-u[value])-13*u[velocity])*dt;u[value]+=u[velocity]*dt;}
m.position.x+=u.hx*(1-explosion);m.position.y+=u.hy*(1-explosion);m.rotation.z+=u.hr*(1-explosion);
// Staggered, damped landing on the pedestal during the entry reveal.
if(intro<1&&explosion<.02){const drop=clamp((intro-.06-i*.019)/.54),settled=1-Math.exp(-6.5*drop)*Math.cos(drop*8.5);m.position.y+=(1-settled)*(3.2+(i%4)*.7);m.rotation.z+=(1-settled)*(i%2?-.11:.11);m.scale.multiplyScalar(smooth(0,.12,drop));}
});
if(intro<1&&explosion<.02){const baseEnter=smooth(0,.32,intro);heroAD.userData.base.position.y-=.6*(1-baseEnter);heroAD.userData.base.scale.set(baseEnter,baseEnter,baseEnter);}
// Keep the very same meshes alive as they travel into the service cards.
if(handoff>0){
 const camera=hero.camera,w=rect.width,h=rect.height;
 const distance=Math.max(8.8,6.7/(2*Math.tan(T.MathUtils.degToRad(17))*(w/h)),6.4/(2*Math.tan(T.MathUtils.degToRad(17))));
 camera.aspect=w/h;camera.position.set(distance*.14,distance*.23,distance);camera.lookAt(0,.1,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);heroAD.updateMatrixWorld(true);
 const eyePlane=new T.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new T.Vector3()),new T.Vector3(0,.1,0));
 const parentInverse=heroAD.getWorldQuaternion(new T.Quaternion()).invert();
 const viewHeight=2*Math.tan(T.MathUtils.degToRad(17))*camera.position.distanceTo(new T.Vector3(0,.1,0));
 const geometryRatios=[1/.55,.8/.49,.65/.59,1];
 heroAD.userData.base.visible=handoff<.2;hero.shadow.visible=false;
 heroAD.userData.parts.forEach((m,i)=>{const serviceIndex=serviceIndices.indexOf(i);if(serviceIndex<0){const out=smooth(0,.6,handoff);m.position.addScaledVector(m.userData.drift,out*1.6);m.scale.multiplyScalar(1-out);return;}
  const element=document.querySelector('#service-model-'+serviceIndex),b=element.getBoundingClientRect(),host=hero.host.getBoundingClientRect();
  const nx=((b.left+b.width/2-host.left-rect.x)/w)*2-1,ny=-((b.top+b.height/2-host.top-rect.y)/h)*2+1;
  const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(nx,ny),camera);const target=new T.Vector3();ray.ray.intersectPlane(eyePlane,target);heroAD.worldToLocal(target);
  const settle=smooth(.04+serviceIndex*.055,.78+serviceIndex*.055,handoff);
  m.position.lerp(target,settle);
  const motion=serviceMotion[serviceIndex]||{hover:0,x:0,y:0};
  const rotation=new T.Euler(Math.sin(t*.6+serviceIndex)*.08-motion.y*.24,Math.sin(t*.28+serviceIndex)*.32+serviceIndex*.32+motion.x*.4,Math.sin(t*.4+serviceIndex)*.06-motion.x*.12);
  const targetQuaternion=parentInverse.clone().multiply(camera.quaternion).multiply(new T.Quaternion().setFromEuler(rotation));
  m.quaternion.slerp(targetQuaternion,settle);
  const targetScale=geometryRatios[serviceIndex]*(b.height/h)*(viewHeight/(2*Math.tan(T.MathUtils.degToRad(17))*4.5))/heroAD.scale.x;
  m.scale.lerp(new T.Vector3().setScalar(targetScale*(1+motion.hover*.065)),settle);
 });
}else{heroAD.userData.base.visible=true;hero.shadow.visible=true;}
hero.draw(rect,heroAD);}

const pb=process.host.getBoundingClientRect();if(pb.bottom>0&&pb.top<innerHeight){process.clear();processAD.position.set(0,0,0);processAD.rotation.set(0,Math.sin(t*.18)*.12,0);processAD.userData.base.position.set(0,-2.05,0);const sculpt=smooth(.24,.55,phase),color=smooth(.6,.85,phase);processAD.userData.base.material.color.setHex(palette.cream).lerp(new T.Color(0x253296),1-sculpt);processAD.userData.parts.forEach((m,i)=>{resetPart(m);const u=m.userData;const build=smooth(.22+i*.011,.55+i*.011,phase);m.material.color.setHex(0x263292).lerp(new T.Color(palette.cream),sculpt).lerp(u.color,color);m.material.wireframe=false;m.scale.setScalar(mix(.98,1,build));m.position.y+=Math.sin((1-build)*Math.PI)*(.3+(i%4)*.3);m.rotation.y+=(1-build)*.3;});process.draw(slotRect(process,document.querySelector('#process-model')),processAD);}
const cb=contact.host.getBoundingClientRect();if(cb.bottom>0&&cb.top<innerHeight){contact.clear();contactAD.rotation.set(pitch,yaw,0);contactAD.position.set(0,0,0);contactAD.userData.parts.forEach((m,i)=>{resetPart(m);if(!reduced&&i>10)m.position.y+=Math.sin(t+i)*.045;bounce(m,dt);});contact.draw(slotRect(contact,document.querySelector('#contact-model')),contactAD);}

},hitTest(x,y){if(dragging)return 'DRAG';for(const [selector,w,ad]of interactionSlots){const slot=document.querySelector(selector),r=slot.getBoundingClientRect();if(x>r.left&&x<r.right&&y>r.top&&y<r.bottom){const hit=pick(x,y,w,ad,slot);if(hit)return 'POKE';return 'DRAG';}}return '';},dispose(){worlds.forEach(w=>w.renderer.dispose());}};
}
