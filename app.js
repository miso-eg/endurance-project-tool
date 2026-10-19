'use strict';
const IS_ZODIAC=document.body?.dataset?.project==='zodiac';
const IS_ETO=document.body?.dataset?.project==='eto';
const IS_MONTH=document.body?.dataset?.project==='month';
const IS_MBTI=document.body?.dataset?.project==='mbti';
const IS_CYCLE=IS_ZODIAC||IS_ETO||IS_MONTH||IS_MBTI;
const ZODIAC_NAMES=['おひつじ座','おうし座','ふたご座','かに座','しし座','おとめ座','てんびん座','さそり座','いて座','やぎ座','みずがめ座','うお座'];
const ZODIAC_SYMBOLS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ETO_NAMES=['子（ねずみ）','丑（うし）','寅（とら）','卯（うさぎ）','辰（たつ）','巳（へび）','午（うま）','未（ひつじ）','申（さる）','酉（とり）','戌（いぬ）','亥（いのしし）'];
const ETO_SYMBOLS=['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐗'];
const MONTH_NAMES=Array.from({length:12},(_,i)=>`${i+1}月`);
const MBTI_NAMES=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const CYCLE_NAMES=IS_MBTI?MBTI_NAMES:IS_MONTH?MONTH_NAMES:IS_ETO?ETO_NAMES:ZODIAC_NAMES;
const CYCLE_SYMBOLS=IS_MBTI?MBTI_NAMES.map(()=> ''):IS_MONTH?['🎍','🍫','🎎','🌸','🎏','☔','🎋','🎆','🌕','🎃','🍁','🎄']:IS_ETO?ETO_SYMBOLS:ZODIAC_SYMBOLS;
const CYCLE_TITLE=IS_MBTI?'16タイプ':IS_MONTH?'12か月':IS_ETO?'十二支':'12星座';
const REGIONS = IS_CYCLE?[{name:CYCLE_TITLE,items:CYCLE_NAMES}]:[
 ['北海道・東北','北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県'],
 ['関東','茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県'],
 ['中部','新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県'],
 ['近畿','三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県'],
 ['中国','鳥取県 島根県 岡山県 広島県 山口県'],
 ['四国','徳島県 香川県 愛媛県 高知県'],
 ['九州・沖縄','福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県']
].map(([name,items])=>({name,items:items.split(' ')}));
const PREFECTURES=REGIONS.flatMap(r=>r.items);
const TOTAL=PREFECTURES.length,ITEM_LABEL=IS_MBTI?'タイプ':IS_MONTH?'誕生月':IS_ETO?'干支':IS_ZODIAC?'星座':'都道府県',PROJECT_TITLE=IS_MBTI?'MBTI耐久':IS_MONTH?'誕生月耐久':IS_ETO?'干支耐久':IS_ZODIAC?'12星座耐久':'都道府県耐久';
const STORAGE_KEY=IS_MBTI?'endurance-mbti-v1':IS_MONTH?'endurance-month-v1':IS_ETO?'endurance-eto-v1':IS_ZODIAC?'endurance-zodiac-v1':'endurance-board-v3';
const THEMES={mint:['#075c40','#e9f5ed','#fcfefb'],blue:['#1256a0','#e8f2fc','#fcfdff'],pink:['#a32258','#fcebf2','#fffcfd'],purple:['#6732a0','#f0eafa','#fdfcff'],orange:['#9b460d','#fcf0df','#fffefb']};
const $=id=>document.getElementById(id);
const defaults={theme:IS_MBTI?'blue':IS_MONTH?'pink':IS_ETO?'orange':IS_ZODIAC?'purple':'mint',size:'portrait',layout:'map',transparent:false,target:1,condition:'入室',conditionImage:'',successAction:'',failureAction:'',rescueEnabled:false,rescueGift:'',rescueImage:'',obstacleEnabled:false,obstacleGift:'',obstacleImage:'',counts:{}};
let state={...defaults,counts:{}};
const validCount=value=>Number.isSafeInteger(Number(value))&&Number(value)>=0&&Number(value)<=99999;
try{
 const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||(!IS_CYCLE&&(localStorage.getItem('endurance-board-v2')||localStorage.getItem('endurance-board-v1')))||'null');
 if(saved&&typeof saved==='object'){
  if(THEMES[saved.theme])state.theme=saved.theme;
  if(saved.version>=2&&['landscape','square','portrait'].includes(saved.size))state.size=saved.size;
  if(['map','list'].includes(saved.layout))state.layout=saved.layout;
  state.transparent=saved.transparent===true;
  for(const key of ['successAction','failureAction'])if(typeof saved[key]==='string')state[key]=saved[key].slice(0,60);
  for(const key of ['rescueEnabled','obstacleEnabled'])state[key]=saved[key]===true;
  for(const key of ['rescueImage','obstacleImage'])if(typeof saved[key]==='string'&&/^data:image\/png;base64,/.test(saved[key])&&saved[key].length<200000)state[key]=saved[key];
  for(const key of ['rescueGift','obstacleGift'])if(typeof saved[key]==='string')state[key]=saved[key].slice(0,40);
  if(validCount(saved.target)&&Number(saved.target)>=1)state.target=Number(saved.target);
  if(typeof saved.conditionImage==='string'&&/^data:image\/png;base64,/.test(saved.conditionImage)&&saved.conditionImage.length<200000)state.conditionImage=saved.conditionImage;
  if(typeof saved.condition==='string')state.condition=saved.condition.slice(0,80);
  for(const name of PREFECTURES){if(saved.version>=3&&validCount(saved.counts?.[name]))state.counts[name]=Number(saved.counts[name]);else if(saved.version<3&&Array.isArray(saved.selected)&&saved.selected.includes(name))state.counts[name]=1;}
 }
}catch{}
const countOf=name=>state.counts[name]||0;
let selected=new Set(PREFECTURES.filter(name=>countOf(name)>=state.target));
function changeCount(name,value){if(!validCount(value))return;state.counts[name]=Number(value);update();renderRegions();}
for(const id of ['theme','size','layout','transparent','successAction','failureAction']){
 const el=$(id);if(el.type==='checkbox')el.checked=state[id];else el.value=state[id];
 el.addEventListener('input',()=>{state[id]=el.type==='checkbox'?el.checked:el.value;update();});
}
for(const kind of ['rescue','obstacle']){
 const enabled=$(kind+'Enabled'),gift=$(kind+'Gift');enabled.checked=state[kind+'Enabled'];gift.value=state[kind+'Gift'];$(kind+'-fields').hidden=!enabled.checked;
 enabled.addEventListener('change',()=>{state[kind+'Enabled']=enabled.checked;$(kind+'-fields').hidden=!enabled.checked;update();});
 gift.addEventListener('input',()=>{state[kind+'Gift']=gift.value;update();});
}
function giftRules(){const rules=[];if(state.rescueEnabled&&state.rescueGift.trim())rules.push({kind:'rescue',label:`救済ギフト：「${state.rescueGift.trim()}」で任意の${ITEM_LABEL}を ＋1`,color:'#075c40'});if(state.obstacleEnabled&&state.obstacleGift.trim())rules.push({kind:'obstacle',label:`妨害ギフト：「${state.obstacleGift.trim()}」で任意の${ITEM_LABEL}を −1`,color:'#a32238'});return rules;}
function outcomeRules(){const rows=[];if(state.successAction.trim())rows.push({label:`${TOTAL}${ITEM_LABEL}達成：${state.successAction.trim()}`,color:'#075c40'});if(state.failureAction.trim())rows.push({label:`${TOTAL}${ITEM_LABEL}未達成：${state.failureAction.trim()}`,color:'#a32238'});return rows;}
function giftRulesHeight(){const gifts=giftRules().length;return gifts?gifts*108+32:0;}
function drawOutcomeHeader(x,y,width){outcomeRules().forEach((rule,i)=>{ctx.textAlign='left';text(rule.label,x,y+i*38,26,rule.color,'700',width);});}
function drawGiftRules(w,h,margin){
 const rules=giftRules();if(!giftRulesHeight())return;
 const start=h-giftRulesHeight();
 rules.forEach((rule,i)=>{
  const top=start+i*108,y=top+50;
  rounded(margin,top,w-margin*2,100,12,'#ffffff',rule.color);
  ctx.textAlign='left';const image=giftImages[rule.kind];const x=margin+20;
  if(!image){text(rule.label,x,y,28,rule.color,'700',w-margin-20-x);return;}
  const split=rule.label.indexOf('「');
  const prefix=rule.label.slice(0,split),suffix=rule.label.slice(split);
  const imageSize=88,gap=10;let fontSize=28;
  const setFont=()=>{ctx.font=`700 ${fontSize}px "Yu Gothic", "Meiryo", sans-serif`;};setFont();
  while(ctx.measureText(prefix+suffix).width+imageSize+gap*2>w-margin-20-x&&fontSize>10){fontSize--;setFont();}
  text(prefix,x,y,fontSize,rule.color,'700');
  const imageX=x+ctx.measureText(prefix).width+gap;
  ctx.drawImage(image,imageX,top+6,imageSize,imageSize);
  text(suffix,imageX+imageSize+gap,y,fontSize,rule.color,'700');
 });
}
const presets=['入室','フォロー','バッジ獲得','バッジ獲得 or 進化'];
const giftMatch=state.condition.match(/^ギフト「(.*)」$/);
$('condition-preset').value=presets.includes(state.condition)?state.condition:giftMatch?'gift':'custom';
function syncConditionDetail(){
 const mode=$('condition-preset').value;
 $('condition-detail').hidden=mode!=='gift'&&mode!=='custom';
 $('condition-detail-label').textContent=mode==='gift'?'ギフト名':'カウント条件の詳細';
 $('condition').placeholder=mode==='gift'?'例：バラ':'カウント条件を入力';
 $('condition').value=mode==='gift'?(state.condition.match(/^ギフト「(.*)」$/)?.[1]||''):state.condition;
}
syncConditionDetail();
$('condition-preset').addEventListener('change',()=>{
 const mode=$('condition-preset').value;
 state.condition=mode==='gift'?'ギフト「(ギフト名)」':mode==='custom'?'':mode;
 syncConditionDetail();
 if(mode==='gift')$('condition').value='';
 update();
});
$('condition').addEventListener('input',()=>{
 const value=$('condition').value;
 state.condition=$('condition-preset').value==='gift'?`ギフト「${value||'(ギフト名)'}」`:value;
 update();
});
$('target').value=state.target;
$('target').addEventListener('input',()=>{const el=$('target'),value=el.value;if(value.trim()===''||!validCount(value)||Number(value)<1){el.setCustomValidity('1〜99999の整数を入力してください。');return;}el.setCustomValidity('');state.target=Number(value);update();renderRegions();});
$('target').addEventListener('change',()=>{$('target').value=state.target;$('target').setCustomValidity('');});
function renderRegions(){
 const query=$('search').value.trim();$('regions').replaceChildren();let matches=0;
 for(const region of REGIONS){
  const names=region.items.filter(p=>p.includes(query));if(!names.length)continue;matches+=names.length;
  const section=document.createElement('section');section.className='region';
  const heading=document.createElement('h3');heading.className='region-title';heading.textContent=region.name;section.append(heading);
  const grid=document.createElement('div');grid.className='pref-grid';
  for(const name of names){
   const card=document.createElement('div');card.className='pref counter-card'+(selected.has(name)?' achieved':'');
   const label=document.createElement('strong');label.textContent=(selected.has(name)?'✓ ':'')+name;
   const row=document.createElement('div');row.className='counter-controls';
   const minus=document.createElement('button');minus.textContent='−';minus.setAttribute('aria-label',name+'を1人減らす');minus.disabled=countOf(name)===0;minus.addEventListener('click',()=>changeCount(name,countOf(name)-1));
   const input=document.createElement('input');input.type='number';input.min='0';input.max='99999';input.step='1';input.value=countOf(name);input.setAttribute('aria-label',name+'の人数');
   input.addEventListener('change',()=>{if(input.value.trim()===''||!validCount(input.value)){input.value=countOf(name);return;}changeCount(name,input.value);});
   const plus=document.createElement('button');plus.textContent='＋';plus.setAttribute('aria-label',name+'を1人増やす');plus.disabled=countOf(name)>=99999;plus.addEventListener('click',()=>changeCount(name,countOf(name)+1));
   row.append(minus,input,plus);const progress=document.createElement('span');progress.className='counter-progress';progress.textContent=`${countOf(name)} / ${state.target} 人`;
   card.append(label,row,progress);grid.append(card);
  }
  section.append(grid);$('regions').append(section);
 }
 $('no-results').hidden=matches>0;
}
$('search').addEventListener('input',renderRegions);
$('all').addEventListener('click',()=>{for(const name of PREFECTURES)state.counts[name]=Math.max(countOf(name),state.target);update();renderRegions();});
$('clear').addEventListener('click',()=>{if(!window.confirm(`達成状況をリセットしますか？\n${TOTAL}${ITEM_LABEL}すべての人数が0になります。\nカウント条件や画像などの設定は保持されます。`))return;state.counts={};update();renderRegions();$('status').textContent='達成状況をリセットしました。';});
function update(){selected=new Set(PREFECTURES.filter(name=>countOf(name)>=state.target));state.version=3;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{$('status').textContent='ブラウザーの保存領域を利用できません。画像の保存はできます。';}$('selected-count').textContent=`${selected.size} / ${TOTAL}`;draw();}
const canvas=$('board');const ctx=canvas.getContext('2d');
let cropSession=null;
function clampCrop(session){const factor=session.base*session.zoom;const limitX=Math.max(0,(session.image.naturalWidth*factor-360)/2),limitY=Math.max(0,(session.image.naturalHeight*factor-360)/2);session.x=Math.max(-limitX,Math.min(limitX,session.x));session.y=Math.max(-limitY,Math.min(limitY,session.y));}
function paintCrop(){if(!cropSession)return;clampCrop(cropSession);const c=$('crop-canvas'),g=c.getContext('2d'),s=cropSession,f=s.base*s.zoom;g.clearRect(0,0,360,360);g.drawImage(s.image,180-s.image.naturalWidth*f/2+s.x,180-s.image.naturalHeight*f/2+s.y,s.image.naturalWidth*f,s.image.naturalHeight*f);}
function cropImage(image){return new Promise(resolve=>{cropSession={image,resolve,base:Math.max(360/image.naturalWidth,360/image.naturalHeight),zoom:1,x:0,y:0};$('crop-zoom').value=1;$('crop-dialog').showModal();paintCrop();});}
function finishCrop(data){if(!cropSession)return;const resolve=cropSession.resolve;cropSession=null;$('crop-dialog').close();resolve(data);}
$('crop-zoom').addEventListener('input',()=>{if(!cropSession)return;const next=Number($('crop-zoom').value),ratio=next/cropSession.zoom;cropSession.x*=ratio;cropSession.y*=ratio;cropSession.zoom=next;paintCrop();});
$('crop-reset').addEventListener('click',()=>{if(!cropSession)return;cropSession.x=cropSession.y=0;cropSession.zoom=1;$('crop-zoom').value=1;paintCrop();});
for(const [id,dx,dy] of [['crop-left',-10,0],['crop-right',10,0],['crop-up',0,-10],['crop-down',0,10]])$(id).addEventListener('click',()=>{if(!cropSession)return;cropSession.x+=dx;cropSession.y+=dy;paintCrop();});
let cropDrag=null;
$('crop-canvas').addEventListener('pointerdown',event=>{if(!cropSession)return;cropDrag={id:event.pointerId,x:event.clientX,y:event.clientY};$('crop-canvas').setPointerCapture(event.pointerId);});
$('crop-canvas').addEventListener('pointermove',event=>{if(!cropDrag||!cropSession||cropDrag.id!==event.pointerId)return;const scale=360/$('crop-canvas').getBoundingClientRect().width;cropSession.x+=(event.clientX-cropDrag.x)*scale;cropSession.y+=(event.clientY-cropDrag.y)*scale;cropDrag.x=event.clientX;cropDrag.y=event.clientY;paintCrop();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('crop-canvas').addEventListener(type,()=>{cropDrag=null;});
$('crop-apply').addEventListener('click',()=>{if(!cropSession)return;paintCrop();const output=document.createElement('canvas');output.width=output.height=128;output.getContext('2d').drawImage($('crop-canvas'),0,0,128,128);finishCrop(output.toDataURL('image/png'));});
$('crop-cancel').addEventListener('click',()=>finishCrop(null));
$('crop-dialog').addEventListener('cancel',event=>{event.preventDefault();finishCrop(null);});
$('crop-dialog').addEventListener('close',()=>{if(cropSession){const resolve=cropSession.resolve;cropSession=null;resolve(null);}cropDrag=null;});
const giftImages={rescue:null,obstacle:null};
const giftImageRequests={rescue:0,obstacle:0};
function decodeGiftImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('画像を読み込めませんでした。'));img.src=src;});}
function loadGiftImages(){for(const kind of ['rescue','obstacle']){if(!state[kind+'Image'])continue;const request=++giftImageRequests[kind];decodeGiftImage(state[kind+'Image']).then(img=>{if(request!==giftImageRequests[kind])return;giftImages[kind]=img;$(kind+'-image-status').textContent='設定した画像を使用しています。';draw();}).catch(()=>{if(request!==giftImageRequests[kind])return;state[kind+'Image']='';giftImages[kind]=null;$(kind+'-image-status').textContent='画像を読み込めませんでした。再設定してください。';update();});}}
for(const kind of ['rescue','obstacle']){
 $(kind+'-image').addEventListener('change',async()=>{
  const file=$(kind+'-image').files[0];if(!file)return;const request=++giftImageRequests[kind];
  try{
   if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new Error('PNG・JPEG・WebP・GIF画像を選んでください。');
   if(file.size>20*1024*1024)throw new Error('20MB以下の画像を選んでください。');
   const url=URL.createObjectURL(file);let image;try{image=await decodeGiftImage(url);}finally{URL.revokeObjectURL(url);}
   if(request!==giftImageRequests[kind])return;
   const data=await cropImage(image);if(!data){$(kind+'-image').value='';return;}const normalized=await decodeGiftImage(data);if(request!==giftImageRequests[kind])return;
   state[kind+'Image']=data;giftImages[kind]=normalized;update();$(kind+'-image-status').textContent='設定した画像を使用しています。';
  }catch(error){if(request===giftImageRequests[kind])$(kind+'-image-status').textContent=error.message||'画像の設定に失敗しました。';}
  $(kind+'-image').value='';
 });
 $(kind+'-image-reset').addEventListener('click',()=>{giftImageRequests[kind]++;state[kind+'Image']='';giftImages[kind]=null;$(kind+'-image').value='';$(kind+'-image-status').textContent='画像は未設定です。';update();});
}
let conditionImage=null;
let imageRequest=0;
const DEFAULT_ICONS={
 entry:'M5 3H15V21H5Z M10 12H23 M19 8L23 12L19 16',
 follow:'M12 20C10 18 3 13 3 8C3 3 9 2 12 6C15 2 21 3 21 8C21 13 14 18 12 20Z',
 badge:'M8 14L5 23L12 19L19 23L16 14 M12 2L15 4L19 5L19 9L20 12L17 15L12 17L7 15L4 12L5 8L5 5L9 4Z',
 evolve:'M3 21L10 14L14 17L22 5 M15 5H22V12 M5 3V9 M2 6H8',
 gift:'M3 9H21V14H3Z M5 14V23H19V14 M12 9V23 M12 9C2 9 3 0 8 3L12 9C22 9 21 0 16 3Z',
 custom:'M4 5H20V22H4Z M8 2H16V7H8Z M8 12H16 M8 17H16'
};
function defaultIconKey(){if(state.condition==='入室')return 'entry';if(state.condition==='フォロー')return 'follow';if(state.condition.includes('進化'))return 'evolve';if(state.condition.includes('バッジ'))return 'badge';if(state.condition.startsWith('ギフト'))return 'gift';return 'custom';}
function drawCondition(x,y,size,maxWidth){
 const label='カウント条件：',value=state.condition||'未設定';
 const font=()=>{ctx.font=`800 ${size}px "Yu Gothic", "Meiryo", sans-serif`;};font();
 while(ctx.measureText(label+value).width+size*2.4>maxWidth&&size>10){size--;font();}
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#263e39';ctx.fillText(label,x,y);
 const iconSize=size*2;
 const iconX=x+ctx.measureText(label).width+size*.1;
 if(conditionImage){const ratio=Math.min(iconSize/conditionImage.naturalWidth,iconSize/conditionImage.naturalHeight);const iw=conditionImage.naturalWidth*ratio,ih=conditionImage.naturalHeight*ratio;ctx.drawImage(conditionImage,iconX+(iconSize-iw)/2,y-ih/2,iw,ih);}
 else {ctx.save();ctx.translate(iconX,y-iconSize/2);ctx.scale(iconSize/26,iconSize/26);ctx.strokeStyle=THEMES[state.theme][0];ctx.fillStyle=THEMES[state.theme][1];ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.lineCap='round';const path=new Path2D(DEFAULT_ICONS[defaultIconKey()]);if(['follow','badge','gift','custom'].includes(defaultIconKey()))ctx.fill(path);ctx.stroke(path);ctx.restore();}
 ctx.fillStyle='#263e39';ctx.fillText(value,iconX+iconSize+size*.3,y);
}
function loadSavedConditionImage(){if(!state.conditionImage)return;const request=++imageRequest;const img=new Image();img.onload=()=>{if(request!==imageRequest)return;conditionImage=img;$('condition-image-status').textContent='設定した画像を使用しています。';draw();};img.onerror=()=>{if(request!==imageRequest)return;state.conditionImage='';conditionImage=null;update();};img.src=state.conditionImage;}
$('condition-image').addEventListener('change',async()=>{
 const file=$('condition-image').files[0];if(!file)return;
 const request=++imageRequest;
 try{
  if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new Error('PNG・JPEG・WebP・GIF画像を選んでください。');
  if(file.size>20*1024*1024)throw new Error('20MB以下の画像を選んでください。');
  const url=URL.createObjectURL(file);const image=new Image();
  try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('画像を読み込めませんでした。'));image.src=url;});}finally{URL.revokeObjectURL(url);}
  if(request!==imageRequest)return;
  const data=await cropImage(image);if(!data){$('condition-image').value='';return;}const normalized=await decodeGiftImage(data);
  if(request!==imageRequest)return;state.conditionImage=data;conditionImage=normalized;update();$('condition-image-status').textContent='設定した画像を使用しています。';
 }catch(error){if(request===imageRequest)$('condition-image-status').textContent=error.message||'画像の設定に失敗しました。';}
 $('condition-image').value='';
});
$('reset-condition-image').addEventListener('click',()=>{imageRequest++;state.conditionImage='';conditionImage=null;$('condition-image').value='';$('condition-image-status').textContent='条件に合う標準アイコンを使用しています。';update();});
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function text(value,x,y,size,color,weight='500',maxWidth){ctx.font=`${weight} ${size}px "Yu Gothic", "Meiryo", sans-serif`;ctx.fillStyle=color;ctx.textBaseline='middle';if(maxWidth){while(ctx.measureText(value).width>maxWidth&&size>10){size--;ctx.font=`${weight} ${size}px "Yu Gothic", "Meiryo", sans-serif`;}}ctx.fillText(value,x,y);}
function drawList(){const size={landscape:[1920,1080],square:[1600,1600],portrait:[1080,1920]}[state.size];[canvas.width,canvas.height]=size;const [w,h]=size;const [accent,pale,bg]=THEMES[state.theme];const portrait=state.size==='portrait',landscape=state.size==='landscape';const margin=portrait?60:80;ctx.clearRect(0,0,w,h);if(!state.transparent){ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=pale;ctx.beginPath();ctx.arc(w,0,w*.28,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,h,w*.18,0,Math.PI*2);ctx.fill();}ctx.textAlign='left';text('都道府県耐久',margin,margin+10,38,accent,'700');const headerWidth=w-margin*2-(landscape?390:0);drawOutcomeHeader(margin,margin+62,headerWidth);const conditionY=margin+82+outcomeRules().length*38;drawCondition(margin,conditionY,28,headerWidth);text(`各都道府県達成条件：各都道府県 ${state.target} 人`,margin,conditionY+48,26,'#334155','500',headerWidth);
const badgeW=landscape?320:250;const bx=w-margin-badgeW;const by=landscape?margin:margin+210;rounded(bx,by,badgeW,landscape?160:110,20,'#ffffff',pale);ctx.textAlign='center';text(`${selected.size} / 47`,bx+badgeW/2,by+(landscape?60:42),landscape?55:42,accent,'800');text(selected.size===47?'全国制覇！':'都道府県 達成',bx+badgeW/2,by+(landscape?115:82),20,'#334155');ctx.textAlign='left';
const progressY=landscape?margin+225:margin+350;rounded(margin,progressY,w-margin*2,9,4,pale);if(selected.size)rounded(margin,progressY,(w-margin*2)*selected.size/47,9,4,accent);
const y=progressY+40,cols=landscape?2:1,gap=34;
const groupW=(w-2*margin-gap*(cols-1))/cols,bottom=h-Math.max(100,giftRulesHeight()+30);
const columns=landscape?5:portrait?4:5,cellGap=10,cellW=(groupW-cellGap*(columns-1))/columns;
const bandCount=Math.ceil(REGIONS.length/cols),bandRows=[];
for(let band=0;band<bandCount;band++)bandRows.push(Math.max(...REGIONS.slice(band*cols,band*cols+cols).map(region=>Math.ceil(region.items.length/columns))));
const headingSpace=36,bandGap=12,totalRows=bandRows.reduce((sum,rows)=>sum+rows,0);
const cellH=(bottom-y-bandCount*headingSpace-(bandCount-1)*bandGap-(totalRows-bandCount)*cellGap)/totalRows;
const bandTops=[];let nextY=y;
for(const rows of bandRows){bandTops.push(nextY);nextY+=headingSpace+rows*cellH+(rows-1)*cellGap+bandGap;}
REGIONS.forEach((region,index)=>{
 const x=margin+(index%cols)*(groupW+gap),top=bandTops[Math.floor(index/cols)];
 const count=region.items.filter(name=>selected.has(name)).length;
 text(region.name,x,top+8,22,'#263747','700');ctx.textAlign='right';text(`${count} / ${region.items.length}`,x+groupW,top+8,18,'#475569');ctx.textAlign='left';
 region.items.forEach((name,i)=>{
  const cx=x+(i%columns)*(cellW+cellGap),cy=top+headingSpace+Math.floor(i/columns)*(cellH+cellGap),done=selected.has(name);
  rounded(cx,cy,cellW,cellH,10,done?accent:'#ffffff',done?null:'#8998a7');mapHits.push({name,rect:{x:cx,y:cy,w:cellW,h:cellH}});
  ctx.textAlign='center';text((done?'✓ ':'')+name,cx+cellW/2,cy+cellH*.30,portrait?20:22,done?'#ffffff':'#334155','700',cellW-14);
  text(`${countOf(name)} / ${state.target} 人`,cx+cellW/2,cy+cellH*.76,16,done?'#ffffff':'#334155','500',cellW-14);ctx.textAlign='left';
 });
});
ctx.textAlign='right';if(!giftRulesHeight())text(selected.size===47?'COMPLETE !':`あと ${47-selected.size} 都道府県`,w-margin,h-43,20,accent,'700');ctx.textAlign='left';drawGiftRules(w,h,state.size==='portrait'?60:80);$('dimensions').textContent=`${w} × ${h} px`;}
let outputUrl=null;
let outputFile=null;
$('download').addEventListener('click',async()=>{
 const button=$('download');button.disabled=true;
 try{
  draw();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('画像の生成に失敗しました。もう一度お試しください。');
  if(outputUrl)URL.revokeObjectURL(outputUrl);
  outputUrl=URL.createObjectURL(blob);
  const now=new Date();
  const pad=value=>String(value).padStart(2,'0');
  const filename=`${PROJECT_TITLE}_${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;
  outputFile=typeof File==='function'?new File([blob],filename,{type:'image/png'}):null;
  $('output-image').src=outputUrl;$('save-image').href=outputUrl;$('save-image').download=filename;
  let canShare=false;try{canShare=!!(outputFile&&navigator.share&&navigator.canShare?.({files:[outputFile]}));}catch{}
  $('share-image').hidden=!canShare;
  $('share-status').textContent='';$('image-dialog').showModal();
  $('status').textContent='画像を表示しました。長押しや共有メニューから保存できます。';
 }catch(error){$('status').textContent=error.message||'画像を表示できませんでした。';}
 finally{button.disabled=false;}
});
$('share-image').addEventListener('click',async()=>{
 if(!outputFile)return;
 $('share-image').disabled=true;
 try{await navigator.share({files:[outputFile]});$('share-status').textContent='共有メニューを閉じました。';}
 catch(error){$('share-status').textContent=error.name==='AbortError'?'共有をキャンセルしました。画像の長押しでも保存できます。':'共有できませんでした。画像の長押し、またはダウンロードをご利用ください。';}
 finally{$('share-image').disabled=false;}
});
$('close-image-dialog').addEventListener('click',()=>$('image-dialog').close());
$('image-dialog').addEventListener('close',()=>{
 $('output-image').removeAttribute('src');$('save-image').removeAttribute('href');
 if(outputUrl)URL.revokeObjectURL(outputUrl);outputUrl=null;outputFile=null;
});
const mapHits=[];
function draw(){
 mapHits.length=0;
 if(IS_CYCLE){drawZodiac();return;}
 if(state.layout==='list'){drawList();return;}
 const sizes={landscape:[1920,1080],square:[1600,1600],portrait:[1080,1920]};
 const [w,h]=sizes[state.size];canvas.width=w;canvas.height=h;
 const [accent,pale,bg]=THEMES[state.theme];const wide=state.size==='landscape';const portrait=state.size==='portrait';const m=60;
 ctx.clearRect(0,0,w,h);
 if(!state.transparent){ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);}
 ctx.textAlign='left';text('都道府県耐久',m,72,38,accent,'700');
 drawOutcomeHeader(m,124,w-2*m);
 const conditionY=145+outcomeRules().length*38;
 drawCondition(m,conditionY,28,w-2*m);
 text(`各都道府県達成条件：各都道府県 ${state.target} 人`,m,conditionY+48,26,'#334155','500',w-2*m);

 text(`${selected.size}`,m,315,64,accent,'800');text('/ 47 都道府県 達成',m+100,320,26,'#334155');
 ctx.textAlign='right';text(selected.size===47?'全国制覇！':`あと ${47-selected.size} 都道府県`,w-m,320,28,accent,'700');ctx.textAlign='left';
 rounded(m,365,w-2*m,10,5,pale);if(selected.size)rounded(m,365,(w-2*m)*selected.size/47,10,5,accent);
 const footerTop=h-giftRulesHeight();
 const grid=wide?{x:1040,y:408,w:820,h:Math.min(535,footerTop-438)}:portrait?{x:m,y:Math.min(1370,footerTop-430),w:w-2*m,h:400}:{x:m,y:Math.min(1200,footerTop-305),w:w-2*m,h:275};
 const mapBox=wide?{x:m,y:395,w:910,h:Math.min(560,footerTop-425)}:{x:m,y:400,w:w-2*m,h:Math.min(portrait?920:760,grid.y-450)};
 drawMap(mapBox,accent,pale);
 const columns=wide?6:portrait?6:8;const rows=Math.ceil(PREFECTURES.length/columns);const gap=8;const cw=(grid.w-gap*(columns-1))/columns;const ch=(grid.h-gap*(rows-1))/rows;
 text('都道府県チェック',grid.x,grid.y-28,22,'#263747','700');
 PREFECTURES.forEach((name,i)=>{const x=grid.x+(i%columns)*(cw+gap),y=grid.y+Math.floor(i/columns)*(ch+gap),done=selected.has(name);rounded(x,y,cw,ch,7,done?accent:'#ffffff',done?null:'#8998a7');ctx.textAlign='center';text((done?'✓ ':'')+name,x+cw/2,y+ch*.30,portrait?20:22,done?'#ffffff':'#334155','700',cw-8);text(`${countOf(name)} / ${state.target} 人`,x+cw/2,y+ch*.75,16,done?'#ffffff':'#334155','500',cw-8);mapHits.push({name,rect:{x,y,w:cw,h:ch}});});
 ctx.textAlign='left';
 drawGiftRules(w,h,state.size==='portrait'?60:80);$('dimensions').textContent=`${w} × ${h} px`;
}
function drawZodiacWheel(cx,cy,r,accent,pale){
 const inner=r*.42;
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r+7,0,Math.PI*2);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.stroke();
 CYCLE_NAMES.forEach((name,i)=>{
  const start=-Math.PI/2+i*Math.PI*2/TOTAL,end=start+Math.PI*2/TOTAL,angle=(start+end)/2,done=selected.has(name);
  const path=new Path2D();path.arc(cx,cy,r,start+.008,end-.008);path.arc(cx,cy,inner,end-.008,start+.008,true);path.closePath();
  ctx.fillStyle=done?accent:i%2===0?pale:'#ffffff';ctx.fill(path);ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.stroke(path);mapHits.push({name,path});
  const x=cx+Math.cos(angle)*r*.72,y=cy+Math.sin(angle)*r*.72;
  ctx.textAlign='center';text(CYCLE_SYMBOLS[i],x,y-r*.045,Math.max(23,r*.13),done?'#ffffff':accent,'700');
  text((done?'✓ ':'')+name,x,y+r*.09,Math.max(11,r*.047),done?'#ffffff':'#334155','700',r*.38);
 });
 ctx.textAlign='center';text(CYCLE_TITLE,cx,cy-r*.08,r*.12,accent,'700');text(`${selected.size} / ${TOTAL}`,cx,cy+r*.09,r*.15,accent,'800');
 ctx.beginPath();ctx.arc(cx,cy,inner*.88,0,Math.PI*2);ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.stroke();ctx.restore();ctx.textAlign='left';
}
let mbtiArt=null;
function loadMbtiArt(){if(!IS_MBTI)return;const img=new Image();img.onload=()=>{mbtiArt=img;draw();};img.onerror=()=>{$('status').textContent='イラストを読み込めませんでした。ページを再読み込みしてください。';};img.src='./assets/mbti-original-v2.png';}
function drawMbtiArt(index,x,y,size){
 if(!mbtiArt)return;const sw=mbtiArt.naturalWidth/4,sh=mbtiArt.naturalHeight/4;
 // ENTP's left gutter contains overflow from the neighboring ENTJ flag.
 // Omit only that gutter, keeping the character's scale and position unchanged.
 const inset=index===3?.11:0;
 ctx.drawImage(mbtiArt,(index%4+inset)*sw,Math.floor(index/4)*sh,sw*(1-inset),sh,x-size/2+size*inset,y-size/2,size*(1-inset),size);
}
function drawZodiac(){
 const [w,h]={portrait:[1080,1920],square:[1600,1600],landscape:[1920,1080]}[state.size];canvas.width=w;canvas.height=h;
 const [accent,pale,bg]=THEMES[state.theme],m=60,wide=state.size==='landscape',simple=state.layout==='list';
 ctx.clearRect(0,0,w,h);if(!state.transparent){ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);}
 ctx.textAlign='left';text(PROJECT_TITLE,m,72,38,accent,'700');drawOutcomeHeader(m,124,w-m*2);
 const conditionY=145+outcomeRules().length*38;drawCondition(m,conditionY,28,w-m*2);
 text(`各${ITEM_LABEL}達成条件：各${ITEM_LABEL} ${state.target} 人`,m,conditionY+48,26,'#334155','500',w-m*2);
 text(`${selected.size}`,m,315,64,accent,'800');text(`/ ${TOTAL} ${ITEM_LABEL} 達成`,m+100,320,26,'#334155');ctx.textAlign='right';text(selected.size===TOTAL?`${CYCLE_TITLE}コンプリート！`:`あと ${TOTAL-selected.size} ${ITEM_LABEL}`,w-m,320,28,accent,'700');ctx.textAlign='left';
 rounded(m,365,w-m*2,10,5,pale);if(selected.size)rounded(m,365,(w-m*2)*selected.size/TOTAL,10,5,accent);
 const bottom=h-Math.max(50,giftRulesHeight()+24),available=bottom-410;
 let gridX=m,gridW=w-m*2,startY=410;
 if(!simple&&!IS_MBTI){
  const diameter=wide?Math.min(available-16,760):Math.min(760,available*.60);
  const cx=wide?m+460:w/2,cy=410+diameter/2;
  drawZodiacWheel(cx,cy,diameter/2,accent,pale);
  if(wide){gridX=1030;gridW=w-gridX-m;}else startY=410+diameter+28;
 }
 const cols=IS_MBTI?(wide?8:4):wide?(simple?6:3):state.size==='square'?4:3,rows=Math.ceil(TOTAL/cols),gap=14,cw=(gridW-gap*(cols-1))/cols,ch=(bottom-startY-gap*(rows-1))/rows;
 CYCLE_NAMES.forEach((name,i)=>{
  const x=gridX+(i%cols)*(cw+gap),y=startY+Math.floor(i/cols)*(ch+gap),done=selected.has(name);
  const itemAccent=IS_MBTI?['#6732a0','#075c40','#1256a0','#9b460d'][Math.floor(i/4)]:accent;
  rounded(x,y,cw,ch,18,done?itemAccent:'#ffffff',done?null:IS_MBTI?itemAccent:'#8998a7');mapHits.push({name,rect:{x,y,w:cw,h:ch}});
  ctx.textAlign='center';const fg=done?'#ffffff':'#334155';
  if(IS_MBTI){const artSize=Math.min(cw-24,ch*.54);if(done)rounded(x+(cw-artSize)/2,y+6,artSize,artSize,12,'#ffffff',null);drawMbtiArt(i,x+cw/2,y+6+artSize/2,artSize);}
  else if(simple||IS_MONTH||ch>150){text(CYCLE_SYMBOLS[i],x+cw/2,y+ch*.22,Math.min(54,ch*.24),done?'#ffffff':itemAccent,'700',cw-24);}
  text((done?'✓ ':'')+name,x+cw/2,y+ch*(IS_MBTI?.61:simple||IS_MONTH||ch>150?.50:.32),Math.min(30,ch*.26),fg,'700',cw-18);
  text(`${countOf(name)} / ${state.target} 人`,x+cw/2,y+ch*(IS_MBTI?.77:.68),Math.min(24,ch*.22),fg,'700',cw-18);
  const barY=y+ch*.88;rounded(x+18,barY,cw-36,6,3,done?'#ffffff55':pale);const rate=Math.min(1,countOf(name)/state.target);if(rate)rounded(x+18,barY,(cw-36)*rate,6,3,done?'#ffffff':accent);
 });
 ctx.textAlign='left';drawGiftRules(w,h,m);$('dimensions').textContent=`${w} × ${h} px`;
}
function drawMap(box,accent,pale){
 const scale=Math.min(box.w/740,box.h/810);const ox=box.x+(box.w-740*scale)/2,oy=box.y+(box.h-810*scale)/2;
 for(const pref of JAPAN_MAP){const path=new Path2D();for(const ring of pref.rings){ring.forEach(([x,y],i)=>i?path.lineTo(ox+x*scale,oy+y*scale):path.moveTo(ox+x*scale,oy+y*scale));path.closePath();}ctx.fillStyle=selected.has(pref.name)?accent:'#acb9c7';ctx.fill(path);ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(1.5,2.4*scale);ctx.stroke(path);mapHits.push({name:pref.name,path});}
 // Okinawa is relocated to an inset south-east of the main islands.
 const inset={x:ox+425*scale,y:oy+680*scale,w:180*scale,h:120*scale};
 ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle='#64748b';ctx.lineWidth=1;ctx.strokeRect(inset.x,inset.y,inset.w,inset.h);ctx.restore();ctx.textAlign='left';text('沖縄（別枠）',inset.x+10,inset.y+inset.h-16,Math.max(13,16*scale),'#334155');
 const lx=box.x+10,ly=box.y+24;rounded(lx,ly-8,17,17,4,accent);text('達成',lx+27,ly+1,20,'#263747');rounded(lx,ly+27,17,17,4,'#acb9c7');text('未達成',lx+27,ly+36,20,'#334155');
}
function hitAt(event){const rect=canvas.getBoundingClientRect();const x=(event.clientX-rect.left)*canvas.width/rect.width,y=(event.clientY-rect.top)*canvas.height/rect.height;return [...mapHits].reverse().find(hit=>hit.rect?x>=hit.rect.x&&x<=hit.rect.x+hit.rect.w&&y>=hit.rect.y&&y<=hit.rect.y+hit.rect.h:ctx.isPointInPath(hit.path,x,y));}
canvas.addEventListener('click',event=>{const hit=hitAt(event);if(!hit)return;changeCount(hit.name,Math.min(99999,countOf(hit.name)+1));$('status').textContent=`${hit.name}：${countOf(hit.name)} / ${state.target} 人${selected.has(hit.name)?'（達成）':''}`;});
canvas.addEventListener('mousemove',event=>{const hit=hitAt(event);canvas.style.cursor=hit?'pointer':'default';canvas.title=hit?`${hit.name}：${countOf(hit.name)} / ${state.target} 人（クリックで＋1人）`:IS_CYCLE?`${ITEM_LABEL}カードをタップして＋1人`:'地図または県名をタップして＋1人';});
renderRegions();update();loadSavedConditionImage();loadGiftImages();loadMbtiArt();
if(document.fonts)document.fonts.ready.then(draw);
