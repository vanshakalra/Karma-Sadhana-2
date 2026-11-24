(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var isMobile=function(){return window.innerWidth<=820};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- smooth scroll (Lenis, as on Sadhana Pada) ---------- */
var lenis=null;
try{
  if(window.Lenis&&!reduce){
    lenis=new Lenis({duration:1.1,smoothWheel:true,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))}});
    var raf=function(t){lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
  }
}catch(e){lenis=null}
function scrollToEl(el){
  if(lenis){lenis.scrollTo(el,{offset:0,duration:1.4})}else{el.scrollIntoView({behavior:'smooth'})}
}
$$('[data-scroll]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=$(a.getAttribute('href'));if(t)scrollToEl(t)})});

/* ---------- reveal on scroll ---------- */
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12}):null;
$$('.reveal').forEach(function(el){io?io.observe(el):el.classList.add('in')});

/* ---------- 1 hero: video bg; attributes -> paragraph on first scroll (as Sadhana Pada) ---------- */
(function(){
  var hero=$('#hero'),vid=$('#heroVideo'),swapped=false,lock=false,tm;
  requestAnimationFrame(function(){hero.classList.add('loaded')});
  if(vid){
    var ok=function(){vid.classList.add('ready')};
    vid.addEventListener('playing',ok);vid.addEventListener('loadeddata',ok);
    vid.muted=true;vid.defaultMuted=true;vid.setAttribute('muted','');vid.setAttribute('playsinline','');vid.setAttribute('webkit-playsinline','');
    var tryPlay=function(){var p=vid.play&&vid.play();if(p&&p.catch)p.catch(function(){})};
    tryPlay();vid.addEventListener('loadedmetadata',tryPlay);vid.addEventListener('canplay',tryPlay);
    ['touchstart','pointerdown','scroll','click'].forEach(function(ev){window.addEventListener(ev,function f(){if(vid.paused)tryPlay();else window.removeEventListener(ev,f)},{passive:true})});
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&vid.paused)tryPlay()});
  }
  function set(v){
    if(swapped===v)return;swapped=v;hero.classList.toggle('swap',v);
    lock=true;setTimeout(function(){lock=false},900);
  }
  var atTop=function(){return window.scrollY<4};
  // first downward scroll intent at the top swaps the content instead of moving the page
  function wheel(e){
    if(!atTop())return;
    if(e.deltaY>0&&!swapped){e.preventDefault();e.stopImmediatePropagation();clearTimeout(tm);set(true)}
    else if(e.deltaY<0&&swapped){e.preventDefault();e.stopImmediatePropagation();set(false)}
    else if(lock){e.preventDefault();e.stopImmediatePropagation()}
  }
  window.addEventListener('wheel',wheel,{passive:false,capture:true});
  var y0=null;
  window.addEventListener('touchstart',function(e){y0=e.touches[0].clientY},{passive:true});
  window.addEventListener('touchmove',function(e){
    if(y0===null||!atTop())return;
    var dy=y0-e.touches[0].clientY;
    if(dy>14&&!swapped){e.preventDefault();set(true);y0=null}
    else if(dy<-14&&swapped){e.preventDefault();set(false);y0=null}
  },{passive:false});
  window.addEventListener('keydown',function(e){
    if(!atTop())return;
    if((e.key==='ArrowDown'||e.key==='PageDown'||e.key===' ')&&!swapped&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test((e.target||{}).tagName||'')){e.preventDefault();set(true)}
  });
  // fallback so the description is still seen without a scroll
  tm=setTimeout(function(){if(atTop())set(true)},7000);
})();

/* ---------- 3 how it works: replicates Margazhi "Light up your sadhana" (measured live at 1440x840):
   stage pins; cards are already in place; heading eases up ~200px over the first half,
   cards hold briefly then slide right -> left at a steady pace; then the page moves on ---------- */
var howEl=$('#how'),howTrack=$('#howRow'),howHead=$('#howHead'),howM=null;
function measureHow(){
  var vw=window.innerWidth,tl=howTrack.offsetLeft,tw=howTrack.scrollWidth;
  var pad=parseFloat(getComputedStyle(howHead).left)||0;
  howM={end:vw-pad-tw-tl,rise:window.innerWidth>820?howTrack.offsetHeight+28:0};
}
function updateHow(){
  if(!howM)measureHow();
  var r=howEl.getBoundingClientRect(),vh=window.innerHeight,S=howEl.offsetHeight-vh;
  var sy=Math.max(0,Math.min(S,-r.top));
  var ht=Math.min(1,sy/(S*.45)),he=1-Math.pow(1-ht,2.2);
  howHead.style.transform='translate3d(0,'+(-he*howM.rise)+'px,0)';
  var ct=Math.max(0,Math.min(1,(sy-S*.12)/(S*.88)));
  howTrack.style.transform='translate3d('+(howM.end*ct)+'px,0,0)';
}

/* ---------- 6 not sure: gentle parallax ---------- */
var nsEl=$('#notsure'),nsImg=$('#nsImg');
function updateNs(){
  var r=nsEl.getBoundingClientRect(),vh=window.innerHeight;
  if(r.bottom<0||r.top>vh)return;
  var p=(r.top+r.height/2-vh/2)/vh;
  nsImg.style.setProperty('--ny',(p*-40)+'px');
}
var ticking=false;
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(function(){updateHow();updateNs();ticking=false})}}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',function(){howM=null;onScroll();ycBarUpdate();cardsUpdate()});
if(lenis)lenis.on('scroll',onScroll);

/* ---------- data: Find your path (copy taken from the Figma category frames) ---------- */
var IC={cal:'img/fyp_6c0cf.svg',loc:'img/fyp_9ca08.svg',elig:'img/fyp_e845d.svg',lang:'img/fyp_585f8.svg',mk:'img/fyp_d42f0.svg'};
var IM={a:'img/fyp_cc6ab.jpg',b:'img/fyp_6309c.jpg',c:'img/fyp_c83cb.jpg'};
var CATS=[
 {id:'spaces',label:'Consecrated Spaces',tag:'Consecrated Spaces',icon:'img/fyp_89aae.webp',desc:'Deepen your receptivity by offering yourself at powerful consecrated spaces.'},
 {id:'programs',label:'Programs',tag:'Program Volunteering',icon:'img/fyp_75515.jpg',desc:'Be part of creating a profound experience for program participants.'},
 {id:'yoga',label:'Yoga Centers',tag:'Yoga Centers',icon:'img/fyp_d8ea0.jpg',desc:'Get involved in the multi-faceted activities at the Yoga Centers, from serving food and guiding visitors to skill-based activity across diverse fields.'},
 {id:'events',label:'Events',tag:'Event Volunteering',icon:'img/fyp_7ef6c.jpg',desc:'Be part of the efforts behind the scenes that bring Isha’s special events and celebrations to life.'}
];
var IEC='Inner Engineering Completion',PTXT='A transformative program designed by Sadhguru to take charge of one’s life.',ALLL='English, Hindi, Tamil, Kannada, Telugu, Marathi, Malayalam, Bengali';
var ITEMS={
 spaces:[
  {t:'Devi Seva',img:IM.a,d:'Karma Sadhana at the abode of Linga Bhairavi to experience her unbounded grace.',dur:'Fixed Duration - 18 Days',loc:'Isha Yoga Centre Coimbatore,|Sadhguru Sannidhi Bengaluru',elig:IEC,tags:['In-Person','3-Day Silence'],cta:'Know More'},
  {t:'Linga Seva',img:IM.b,d:'Karma Sadhana in the powerful presence of Dhyanalinga, where you can offer yourself totally and become receptive to its grace.',dur:'Fixed Duration - 11 Days',loc:'Isha Yoga Centre Coimbatore',elig:IEC,tags:['In-Person','1-Day Silence'],cta:'Know More'},
  {t:'Adiyogi Arpanam (Gents)',img:IM.c,d:'An opportunity for men to become available to Adiyogi’s grace through Karma Sadhana.',dur:'Fixed Duration - 18 Days',loc:'Isha Yoga Centre Coimbatore,|Sadhguru Sannidhi Bengaluru',elig:'Samyama completion',tags:['In-Person','1-Day Silence'],cta:'Know More'},
  {t:'Naga Seva',img:IM.c,d:'Karma Sadhana at the consecrated Naga shrine and become receptive to Naga’s grace.',dur:'Fixed Duration - 7 Days',loc:'Sadhguru Sannidhi Bengaluru',elig:IEC,tags:['In-Person'],cta:'Know More'}
 ],
 programs:[
  {t:'Step 7 - Shambhavi Mahamudra Kriya',img:IM.a,d:PTXT,dur:'Flexible Duration',lang:ALLL,loc:'Multiple Locations',elig:IEC,tags:['In-Person','Online'],cta:'Register Now'},
  {t:'Inner Engineering Volunteering',img:IM.a,d:PTXT,dur:'Flexible Duration',lang:ALLL,loc:'Multiple Locations',elig:IEC,tags:['In-Person','Online'],cta:'Register Now'},
  {t:'Inner Engineering Retreat Volunteering',img:IM.b,d:PTXT,dur:'Fixed Duration - 6 Days',lang:'English, Hindi, Tamil',loc:'Multiple Locations',elig:IEC,tags:['In-Person'],cta:'Register Now'},
  {t:'Shoonya Intensive Volunteering',img:IM.c,d:'An advanced program combining the dynamic Shakti Chalana Kriya and Shoonya Meditation for inner wellbeing.',dur:'Fixed Duration - 6 Days',lang:'English, Hindi, Tamil',loc:'Multiple Locations',elig:'Shoonya Intensive Completion',tags:['In-Person'],cta:'Register Now'},
  {t:'Bhava Spandana Volunteering',img:IM.c,d:'A high intensity residential program to experience a deep sense of oneness with all of existence.',dur:'Fixed Duration - 5 Days',lang:'English, Hindi, Tamil',loc:'Multiple Locations',elig:'Bhava Spandana Completion',tags:['In-Person'],cta:'Register Now'},
  {t:'Soak in Ecstasy of Enlightenment',img:IM.c,d:'An advanced full-day experiential program with Sadhguru.',dur:'Flexible Duration',lang:'English',loc:'Multiple Locations',elig:IEC,tags:['In-Person'],cta:'Register Now'},
  {t:'Guru Pooja Volunteering',img:IM.c,d:'A process through which one can invite the grace of the Guru into one’s life.',dur:'Fixed Duration - 6 Days',lang:'English',loc:'Multiple Locations',elig:'Guru Pooja Completion',tags:['In-Person'],cta:'Register Now'},
  {t:'Samyama Volunteering',img:IM.c,d:'An intensive 8-day residential program conducted by Sadhguru, offering one the potential to reach heightened levels of consciousness.',dur:'Fixed Duration - Min. 10 Days',lang:'English',loc:'Multiple Locations',elig:IEC,tags:['In-Person'],cta:'Register Now'}
 ],
 yoga:[
  {t:'Ashram Karma Sadhana',img:IM.a,d:'Have a profound experience of a Yoga Center and deepen your sense of involvement.',dur:'Flexible Duration - Min. 5 Days',loc:'Isha Yoga Center Coimbatore|Sadhguru Sannidhi Bengaluru',elig:IEC,tags:['In-Person','Online'],cta:'Know More'},
  {t:'Prana Danam',img:IM.b,d:'Experience an intense and fulfilling journey of preparing and serving food to spiritual seekers through Karma Sadhana.',dur:'Fixed Duration - 11 Days',loc:'Isha Yoga Centre Coimbatore',elig:IEC,tags:['In-Person'],cta:'Know More'},
  {t:'Sannidhi Seva',img:IM.c,d:'Immerse yourself in a 360° experience of Sadhguru Sannidhi through intense and structured Karma Sadhana.',dur:'Fixed Duration - 10 Days',loc:'Sadhguru Sannidhi Bengaluru',elig:IEC,tags:['In-Person'],cta:'Register Now'},
  {t:'Weekend Karma Sadhana',img:IM.c,d:'Be part of creating a conducive environment for seekers over the weekends.',dur:'Fixed Duration - 2 Days',loc:'Sadhguru Sannidhi Bengaluru',elig:IEC,tags:['In-Person'],cta:'Register Now'}
 ],
 events:[
  {t:'Isha Gramotsavam Volunteering',img:IM.a,d:'Bharat’s biggest rural sports festival, reviving the rural spirit through community, tradition, and healthy competition.',dur:'Flexible Duration',loc:'Multiple locations across India',tags:['In-Person','Online'],cta:'Know More'},
  {t:'In the Lap of the Master Volunteering',img:IM.b,d:'An intimate 3-day program that offers an immense privilege to be in Sadhguru’s presence.',dur:'Flexible Duration - Min. 5 Days',loc:'Isha Yoga Centre Coimbatore',tags:['In-Person'],cta:'Register Now'},
  {t:'Mahashivratri Volunteering',img:IM.c,d:'A nightlong annual celebration of culture, music and dance with performances by renowned artists.',dur:'Flexible Duration',loc:'Isha Yoga Center Coimbatore|Sadhguru Sannidhi Bengaluru',tags:['In-Person'],cta:'Know More'},
  {t:'Thaipusam Volunteering',img:IM.c,d:'A vibrant festival of devotion that also celebrates the consecration anniversary of Linga Bhairavi.',dur:'Flexible Duration',loc:'Isha Yoga Center Coimbatore|Sadhguru Sannidhi Bengaluru',tags:['In-Person'],cta:'Register Now'},
  {t:'Guru Purnima Volunteering',img:IM.c,d:'An annual celebration featuring Guru Pooja, musical offerings, and powerful guided meditations to become receptive to the Guru’s grace.',dur:'Flexible Duration - Min. 3 Days',loc:'Isha Yoga Centre Coimbatore',tags:['In-Person'],cta:'Register Now'}
 ]
};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pad2(n){return n<10?'0'+n:''+n}

/* ---------- 4 find your path: clickable categories -> cards; 3 cards in view, arrows scroll ---------- */
var curCat='spaces',catsEl=$('#cats'),cardsEl=$('#cards'),catDescEl=$('#catDesc');
function renderCats(){
  catsEl.innerHTML=CATS.map(function(c){return '<button class="cat'+(c.id===curCat?' on':'')+'" data-cat="'+c.id+'" aria-pressed="'+(c.id===curCat)+'"><div class="ci"><img src="'+c.icon+'" alt=""></div><span>'+c.label+'</span></button>'}).join('');
  $$('.cat',catsEl).forEach(function(b){b.addEventListener('click',function(){if(curCat===b.dataset.cat)return;curCat=b.dataset.cat;setCatState();renderCards(true)})});
}
function setCatState(){
  $$('.cat',catsEl).forEach(function(b){var on=b.dataset.cat===curCat;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  var d=CATS.filter(function(c){return c.id===curCat})[0].desc;
  catDescEl.style.opacity=0;setTimeout(function(){catDescEl.textContent=d;catDescEl.style.opacity=1},180);
}
function row(ic,tx){return '<li><img src="'+IC[ic]+'" alt="">'+'<span>'+tx+'</span></li>'}
function cardHTML(it,i){
  var cat=CATS.filter(function(c){return c.id===curCat})[0];
  var rows=row('cal',esc(it.dur))+(it.lang?row('lang',esc(it.lang)):'')+row(it.lang?'mk':'loc',it.loc.split('|').map(esc).join('<br>'))+(it.elig?row('elig',esc(it.elig)):'');
  return '<article class="card" style="animation-delay:'+(i*70)+'ms"><div class="card-top"><div class="card-h"><img src="'+it.img+'" alt=""><div class="tx"><small>'+esc(cat.tag)+'</small><h4>'+esc(it.t)+'</h4></div></div><p class="d">'+esc(it.d)+'</p><div class="div"></div></div>'
   +'<ul>'+rows+'</ul><div class="pills">'+it.tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div>'
   +'<div class="card-foot"><div class="div"></div><button class="card-cta" data-enquire="'+esc(it.t)+'">'+esc(it.cta)+'</button></div></article>';
}
function renderCards(reset){
  cardsEl.innerHTML=ITEMS[curCat].map(cardHTML).join('');
  if(reset)cardsEl.scrollLeft=0;
  cardsUpdate();
}
function cardStep(){var c=$('.card',cardsEl);return c?c.offsetWidth+32:403}
function cardsUpdate(){
  var n=ITEMS[curCat].length,step=cardStep(),vis=3;
  var idx=Math.round(cardsEl.scrollLeft/step);
  var upto=Math.min(n,idx+vis);
  $('#cardCount').textContent=pad2(upto)+' of '+pad2(n)+' Opportunities';
  var w=Math.min(100,vis/n*100);
  $('#cardBar').style.width=w+'%';
  var maxScroll=cardsEl.scrollWidth-cardsEl.clientWidth;
  $('#cardBar').style.left=(maxScroll>1?(cardsEl.scrollLeft/maxScroll)*(100-w):0)+'%';
  $('#cPrev').disabled=cardsEl.scrollLeft<4;
  $('#cNext').disabled=maxScroll<=4||cardsEl.scrollLeft>=maxScroll-4;
}
cardsEl.addEventListener('scroll',cardsUpdate,{passive:true});
$('#cPrev').addEventListener('click',function(){cardsEl.scrollBy({left:-cardStep(),behavior:'smooth'})});
$('#cNext').addEventListener('click',function(){cardsEl.scrollBy({left:cardStep(),behavior:'smooth'})});
renderCats();setCatState();renderCards();
// stop Lenis hijacking horizontal scroll areas
$$('.cards,.yc-cards,.j-thumbs').forEach(function(el){el.setAttribute('data-lenis-prevent','')});

/* ---------- 5 journeys slider ---------- */
var J=[
 {n:'maa gambhiri',img:'img/jour_42036c.jpg',t:'Maa Gambhiri shares her journey from aspiring pilot to sanyasi, Sadhguru’s evolution into a Guru, the impact of Dhyanalinga consecration, and key experiences from the early days to now. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy. Lorem ipsum is a dummy text. Lorem ipsum is a dummy.'},
 {n:'swami sukhada',img:'img/jour_9b89b.jpg',t:'Swami Sukhada shares how a few days of volunteering became a way of life. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy. Lorem ipsum is a dummy text.'},
 {n:'venkat rasa',img:'img/jour_0e6c9.jpg',t:'Venkat Rasa speaks about what action taught him about himself. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy. Lorem ipsum is a dummy text.'},
 {n:'swami patanga',img:'img/jour_0e6c9.jpg',t:'Swami Patanga recounts his path from volunteer to full-time role. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy text. Lorem ipsum is a dummy. Lorem ipsum is a dummy text.'}
];
var jI=0,jBusy=false;
$('#jThumbs').innerHTML=J.map(function(p,i){return '<button class="j-thumb" data-i="'+i+'"><img src="'+p.img+'" alt=""><span>'+esc(p.n)+'</span></button>'}).join('');
var jLayer=0;
function setJText(t){
  var el=$('#jText');
  if(window.innerWidth<=820&&t.length>135){
    var cut=t.slice(0,135).replace(/\s+\S*$/,'');
    el.innerHTML=esc(cut)+'\u2026 <span class="rm" role="button" tabindex="0">Read more</span>';
    el.querySelector('.rm').addEventListener('click',function(){el.textContent=t});
  }else el.textContent=t;
}
function setJ(i,first){
  i=(i+J.length)%J.length;
  var body=$('#jBody'),L=[$('#jImgA'),$('#jImgB')];
  function apply(){
    jI=i;$('#jName').textContent=J[i].n;setJText(J[i].t);$('#jN').textContent='0'+(i+1);var jb=$('#jBar');if(jb){jb.style.width=(100/J.length)+'%';jb.style.left=(100/J.length*i)+'%'}
    $$('.j-thumb').forEach(function(b,k){b.classList.toggle('on',k===i)});
  }
  if(first){apply();L[0].src=J[i].img;L[0].classList.add('on');return}
  if(jBusy||i===jI)return;jBusy=true;
  var nxt=L[1-jLayer],cur=L[jLayer];
  nxt.src=J[i].img;
  body.classList.add('out');
  setTimeout(function(){
    apply();
    body.classList.remove('out');body.classList.add('in');void body.offsetWidth;body.classList.remove('in');
    nxt.classList.add('on');cur.classList.remove('on');jLayer=1-jLayer;
    setTimeout(function(){jBusy=false},500);
  },230);
}
$('#jPrev').addEventListener('click',function(){setJ(jI-1)});
$('#jNext').addEventListener('click',function(){setJ(jI+1)});
$$('.j-thumb').forEach(function(b){b.addEventListener('click',function(){setJ(+b.dataset.i)})});
setJ(0,true);

/* ---------- 7 yoga center: side menu + slider (desktop) / accordion (mobile) ---------- */
var YC=[
 {k:'Daily Schedule',imgs:[['Hatha Yoga','img/yc_77482.webp'],['Guided Karma Sadhana','img/yc_c3d54.jpg'],['Adiyogi Pradakshina','img/yc_47fc3.webp'],['Evening Satsang','img/yc_52809.webp']]},
 {k:'Simple Living',imgs:[['Shared Rooms','img/yc_c3d54.jpg'],['Sattvic Meals','img/yc_f72c2.jpg'],['Community Living','img/yc_2be8e.jpg']]},
 {k:'Consecrated Spaces',imgs:[['Adiyogi','img/yc_47fc3.webp'],['Dhyanalinga','img/fyp_c83cb.jpg'],['Linga Bhairavi','img/fyp_cc6ab.jpg']]},
 {k:'Rooted in Sadhana',imgs:[['Hatha Yoga','img/yc_77482.webp'],['Meditation','img/yc_52809.webp'],['Silence','img/fyp_d8ea0.jpg']]},
 {k:'Support',imgs:[['Brahmacharis','img/yc_2be8e.jpg'],['Medical Care','img/yc_f72c2.jpg'],['Guidance','img/yc_c3d54.jpg']]}
];
var ycI=0;
function ycCardsHTML(i,mob){var L=YC[i].imgs.slice();if(mob&&i===0)L.sort(function(x,y){var r=function(c){return /c3d54|f72c2/.test(c[1])?0:1};return r(x)-r(y)});return L.map(function(c,j){return '<div class="yc-card" style="animation-delay:'+(j*80)+'ms"><img src="'+c[1]+'" alt=""><span>'+esc(c[0])+'</span></div>'}).join('')}
function renderYC(){
  $('#ycMenu').innerHTML=YC.map(function(y,i){return '<button class="yc-item'+(i===ycI?' on':'')+'" data-i="'+i+'">'+esc(y.k)+'</button>'}).join('');
  $$('#ycMenu .yc-item').forEach(function(b){b.addEventListener('click',function(){ycI=+b.dataset.i;renderYC()})});
  var c=$('#ycCards');c.innerHTML=ycCardsHTML(ycI);c.scrollLeft=0;ycBarUpdate();
}
function ycBarUpdate(){
  var c=$('#ycCards');if(!c)return;
  var w=Math.min(100,c.clientWidth/Math.max(c.scrollWidth,1)*100),max=c.scrollWidth-c.clientWidth;
  $('#ycBar').style.width=w+'%';$('#ycBar').style.left=(max>0?c.scrollLeft/max*(100-w):0)+'%';
  $('#ycPrev').disabled=c.scrollLeft<4;$('#ycNext').disabled=max<=4||c.scrollLeft>=max-4;
}
$('#ycCards').addEventListener('scroll',ycBarUpdate,{passive:true});
$('#ycPrev').addEventListener('click',function(){$('#ycCards').scrollBy({left:-324,behavior:'smooth'})});
$('#ycNext').addEventListener('click',function(){$('#ycCards').scrollBy({left:324,behavior:'smooth'})});
renderYC();
var YCD=['Each day includes dedicated time for Karma Sadhana and Yogic practices.','Pitch up your intensity every day.','Spending time in these powerfully energized spaces hastens your spiritual growth.','Be immersed in an atmosphere where sadhana is an integral part of daily life.','Receive guidance and support from a team of Poornangas.'];
var YCI=[['yci_04905.svg','top:8.19%;bottom:8.18%;left:-12.07%;right:12.07%'],['yci_298e6.svg','top:8.46%;bottom:9.48%;left:-27.28%;right:12.07%'],['yci_e8821.svg','top:7.14%;bottom:8.91%;left:-10.34%;right:18.33%'],['yci_0df38.svg','top:50%;left:0;width:53px;height:57.6px;margin-top:-28.8px'],['yci_8e3eb.svg','left:-11px;top:10.6px;width:73px;height:50px']];
$('#ycAcc').innerHTML=YC.map(function(y,i){return '<div class="acc-i'+(i===0?' on':'')+'"><button class="acc-b" aria-expanded="'+(i===0)+'"><span class="acc-ic"><img src="img/'+YCI[i][0]+'" alt="" style="'+YCI[i][1]+'"></span><span class="acc-t"><b>'+esc(y.k)+'</b><em>'+esc(YCD[i])+'</em></span><span class="acc-pm"><img class="pl" src="img/yci_b16c4.svg" alt=""><img class="mi" src="img/yci_80cde.svg" alt=""></span></button><div class="acc-p"><div class="yc-cards" data-lenis-prevent>'+ycCardsHTML(i)+'</div></div></div>'}).join('');
$$('.acc-b').forEach(function(b){b.addEventListener('click',function(){var it=b.parentNode,on=it.classList.contains('on');$$('.acc-i').forEach(function(x){x.classList.remove('on');x.firstChild.setAttribute('aria-expanded','false')});if(!on){it.classList.add('on');b.setAttribute('aria-expanded','true')}})});

/* ---------- 8 application process ---------- */
var steps=$$('#procRow .step');
steps.forEach(function(s){
  s.addEventListener('mouseenter',function(){if(!isMobile())act(s)});
  s.addEventListener('click',function(){act(s)});
});
function act(s){steps.forEach(function(x){x.classList.toggle('on',x===s)})}

/* ---------- 9 what karma sadhana is not: story slider ---------- */
(function(){
  var TX=['It is NOT about earning \u201Cgood karma\u201D, but about dismantling the very fundamentals of one\u2019s karmic structure.',
   'It is not a replacement for your sadhana (Yogic practices). It complements them by creating a conducive inner ambiance of involvement.',
   'It is not about serving others. It is a tool to transform yourself through action.',
   'It is not about doing extraordinary things. It is about doing ordinary things with 100% involvement.',
   'It is not about doing what you like or are good at. It is about doing what is needed.'];
  var imgs=['img/isnot_be576.jpg'].concat(TX.map(function(){return 'img/ks_slide.jpg'}));
  var slides=$('#isSlides'),segs=$('#isSegs'),root=$('#isnot'),stmt=$('#isStmt'),cur=0,timer;
  root.classList.add('intro');
  slides.innerHTML=imgs.map(function(s,i){return '<div class="slide'+(i===0?' on':'')+'"><img src="'+s+'" alt=""></div>'}).join('');
  segs.innerHTML=imgs.map(function(_,i){return '<button class="seg'+(i===0?' on':'')+'" aria-label="Slide '+(i+1)+'"></button>'}).join('');
  var S=$$('.slide',slides),G=$$('.seg',segs);
  function setText(){
    if(cur===0){root.classList.add('intro');return}
    var apply=function(){$('#isNo').textContent='0'+cur+'.';$('#isTxt').textContent=TX[cur-1]};
    if(root.classList.contains('intro')){apply();root.classList.remove('intro');return}
    stmt.classList.add('sw');setTimeout(function(){apply();stmt.classList.remove('sw')},260);
  }
  function go(i){
    var prev=cur;cur=(i+imgs.length)%imgs.length;
    S.forEach(function(s,k){s.classList.toggle('on',k===cur)});
    G.forEach(function(g,k){g.classList.remove('on');g.classList.toggle('done',k<cur);if(k===cur){void g.offsetWidth;g.classList.add('on')}});
    if(prev!==cur)setText();
    clearTimeout(timer);timer=setTimeout(function(){go(cur+1)},6000);
  }
  function side(ev){var r=root.getBoundingClientRect();return (ev.clientX-r.left)<r.width/2?'l':'r'}
  root.addEventListener('mousemove',function(ev){
    if(ev.target.closest('.segs'))return root.classList.remove('side-l','side-r');
    var s=side(ev);root.classList.toggle('side-l',s==='l');root.classList.toggle('side-r',s==='r');
  });
  root.addEventListener('click',function(ev){
    if(ev.target.closest('.seg'))return;
    go(side(ev)==='l'?cur-1:cur+1);clearTimeout(timer);
  });
  G.forEach(function(g,k){g.addEventListener('click',function(){go(k)})});
  var tx=null,ty=null,swiped=0;
  root.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
  root.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){swiped=Date.now();go(dx<0?cur+1:cur-1)}},{passive:true});
  root.addEventListener('click',function(ev){if(Date.now()-swiped<400){ev.stopImmediatePropagation()}},true);
  var vis=false;
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis){go(cur)}else{clearTimeout(timer)}},{threshold:.35}).observe(root)}
  root.addEventListener('mouseenter',function(){root.classList.add('paused');clearTimeout(timer)});
  root.addEventListener('mouseleave',function(){root.classList.remove('paused','side-l','side-r');if(vis)go(cur)});
})();

/* ---------- 10 experiences carousel (ISO-VD style) ---------- */
var EX=[
 {n:'Mouni Roy',r:'Actress, Mumbai',img:'img/refl_73af0.jpg',crop:'left:-133.8%;top:0;width:243.62%;height:100%'},
 {n:'Kangana Ranaut',r:'Actress, Mumbai',img:'img/refl_d1b24.jpg',crop:'left:-18.86%;top:-31.07%;width:348.2%;height:122.8%'},
 {n:'Tamannah Bhatia',r:'Actress, Mumbai',img:'img/refl_24677.jpg',crop:'left:0;top:-12.96%;width:100%;height:109.52%'},
 {n:'Rashmika Gogoi',r:'Lawyer',img:'img/refl_d6bab.jpg'},
 {n:'Priya',r:'Data analyst',img:'img/refl_929b9.jpg'},
 {n:'Ram',r:'Chartered accountant',img:'img/refl_6f85c.jpg'}
];
var LOREM='Lorem ipsum dolor sit amet consectetur. Natoque tristique magna faucibus morbi dictum volutpat. Ornare erat vehicula cursus nunc tortor aenean.';
/* Figma 3642:16986: [prev group | present group | next group], cards are 370x600 scaled copies; geometry relative to --pad */
var EXG={
  pres:{x:[0,402,804],y:[85.5,41.4,-1],s:[1,1,1]},
  prev:{x:[-1087.8,-728.2,-363.2],y:[295.2,247.4,209.2],s:[.8854,.9,.8951]},
  next:{x:[1206,1565.6,1930.6],y:[-56.5,-104.3,-142.5],s:[.8854,.9,.8951]}
};
var EPAGES=[[3,4,5],[0,1,2]];           // page 0 = centre on load (Rashmika, Priya, Ram), page 1 = Mouni, Kangana, Tamannah
var expCur=0,stage=$('#expStage'),egroups=[],expLock=false;
function ecardHTML(e){return '<img class="bg" src="'+e.img+'" alt=""'+(e.crop?' style="inset:auto;object-fit:fill;'+e.crop+'"':'')+'><img class="pb" src="img/refl_play.svg" alt="Play"><div class="tx"><div class="nm">'+esc(e.n)+'</div><div class="rl">'+esc(e.r)+'</div><p>'+LOREM+'</p></div>'}
for(var gi=0;gi<5;gi++){
  var g={cards:[],slot:0,page:0};
  for(var k=0;k<3;k++){var c=document.createElement('article');c.className='ecard';c.dataset.k=k;c.dataset.g=gi;stage.appendChild(c);g.cards.push(c)}
  egroups.push(g);
}
function slotOf(gi){return ((gi-expCur+2)%5+5)%5-2}
function placeCard(c,k,slot){
  var p=slot===0?EXG.pres:(slot<0?EXG.prev:EXG.next),far=Math.abs(slot)>1;
  var x=p.x[k]+(slot<-1?-1087.8*(-slot-1):0)+(slot>1?1087.8*(slot-1):0);
  c.style.transform='translate3d(calc(var(--pad) + '+x+'px),'+p.y[k]+'px,0) scale('+p.s[k]+')';
  c.style.opacity=far?0:(slot===0?1:.6);
  c.style.pointerEvents=far?'none':'auto';
  c.classList.toggle('on',slot===0);
}
function layoutExp(init){
  egroups.forEach(function(g,gi){
    var slot=slotOf(gi),jump=!init&&Math.abs(slot-g.slot)>2;
    var page=(((expCur+slot)%2)+2)%2;
    if(init||jump||page!==g.page||!g.cards[0].innerHTML){
      if(jump||init){g.cards.forEach(function(c,k){c.style.transition='none'})}
      g.cards.forEach(function(c,k){var e=EX[EPAGES[page][k]];c.innerHTML=ecardHTML(e);c.dataset.i=EPAGES[page][k]});
      g.page=page;
    }
    g.cards.forEach(function(c,k){placeCard(c,k,slot)});
    g.slot=slot;
    if(jump||init){void stage.offsetWidth;g.cards.forEach(function(c){c.style.transition=''})}
  });
  var pg=((expCur%2)+2)%2;
  $('#expBar').style.width='50%';$('#expBar').style.left=(pg*50)+'%';
}
var mqM=window.matchMedia('(max-width:820px)'),mCur=0,mTrack=$('#expM');
function mLayout(){mTrack.querySelectorAll('.ecard').forEach(function(c,i){var r=i-mCur,y=r<0?40:(r>0?0:20);c.style.transform='translate3d('+(38+r*300)+'px,'+y+'px,0)';c.classList.toggle('on',r===0);c.style.pointerEvents=Math.abs(r)>1?'none':'auto'});
  $('#expBar').style.width=(100/EX.length)+'%';$('#expBar').style.left=(mCur*100/EX.length)+'%'}
function mGo(d){mCur=Math.max(0,Math.min(EX.length-1,mCur+d));mLayout()}
mTrack.innerHTML=EX.map(function(e,i){return '<article class="ecard" data-i="'+i+'">'+ecardHTML(e)+'</article>'}).join('');
mLayout();
mTrack.addEventListener('click',function(e){var c=e.target.closest('.ecard');if(!c)return;var i=+c.dataset.i;if(i===mCur){openLB(EX[i].img,EX[i].n+' \u2013 '+EX[i].r+' (video placeholder)',true)}else{mGo(i-mCur)}});
(function(){var x0=null;mTrack.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});mTrack.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)mGo(dx<0?1:-1);x0=null},{passive:true})})();
function expGo(d){if(mqM.matches){mGo(d);return}if(expLock)return;expLock=true;expCur+=d;layoutExp(false);setTimeout(function(){expLock=false},520)}
layoutExp(true);if(mqM.matches)mLayout();
stage.addEventListener('click',function(e){
  var c=e.target.closest('.ecard');if(!c)return;
  var slot=slotOf(+c.dataset.g);
  if(slot===0){var i=+c.dataset.i;openLB(EX[i].img,EX[i].n+' – '+EX[i].r+' (video placeholder)',true)}
  else if(slot===-1||slot===1){expGo(slot)}
});
$('#ePrev').addEventListener('click',function(){expGo(-1)});
$('#eNext').addEventListener('click',function(){expGo(1)});
(function(){var x0=null;stage.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)expGo(dx<0?1:-1);x0=null})})();


/* ---------- 11 in action grid ---------- */
var G=[['img/act_d6de6.jpg',0],['img/act_1dfb3.jpg',1],['img/act_62d27.jpg',0],['img/act_43455.jpg',1],['img/act_f65ee.jpg',1],['img/act_123ae.jpg',0],['img/act_fb3bb.jpg',1],['img/act_ca499.jpg',0],['img/act_817b3.jpg',0]];
var GMO=[0,3,2,1,5,6,7,8,4];
$('#grid').innerHTML=G.map(function(g,i){return '<div class="tile'+(i===8?' mo':'')+' reveal d'+(i%4)+'" style="--mo:'+GMO[i]+'" data-lb="'+g[0]+'" data-video="'+g[1]+'"><img class="t" src="'+g[0]+'" alt="">'+(g[1]?'<div class="pl"><img src="img/act_57414.svg" alt="Play"></div>':'')+'</div>'}).join('');
$$('#grid .reveal').forEach(function(el){io&&io.observe(el)});

/* ---------- lightbox ---------- */
var lb=$('#lb');
function openLB(src,cap,video){$('#lbImg').src=src;$('#lbCap').textContent=cap||'';$('#lbPlay').style.display=video?'grid':'none';lb.classList.add('on');if(lenis)lenis.stop()}
function closeLB(){lb.classList.remove('on');if(lenis&&!$('#sheet').classList.contains('on'))lenis.start()}
$('#lbX').addEventListener('click',closeLB);lb.addEventListener('click',function(e){if(e.target===lb)closeLB()});
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-lb]');if(!t)return;
  openLB(t.dataset.lb,t.dataset.lbcap||(t.dataset.video==='1'?'Video placeholder':''),t.dataset.video==='1');
});

/* ---------- forms ---------- */
var COUNTRIES=[['India','+91'],['United States','+1'],['United Kingdom','+44'],['Australia','+61'],['Canada','+1'],['Germany','+49'],['France','+33'],['Singapore','+65'],['United Arab Emirates','+971'],['Malaysia','+60'],['Sri Lanka','+94'],['Nepal','+977'],['South Africa','+27'],['Japan','+81'],['Other','+']];
function fillSelects(root){
  $$('select[data-country]',root).forEach(function(s){s.innerHTML='<option value=""></option>'+COUNTRIES.map(function(c){return '<option>'+c[0]+'</option>'}).join('')});
  $$('select[data-cc]',root).forEach(function(s){s.innerHTML=COUNTRIES.slice(0,14).map(function(c){return '<option>'+c[1]+'</option>'}).filter(function(v,i,a){return a.indexOf(v)===i}).join('')});
}
function validate(form){
  var ok=true;
  $$('.field',form).forEach(function(f){
    var i=$('input,select',f);if(!i||!i.required)return;
    var bad=!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value));
    f.classList.toggle('err',bad);if(bad)ok=false;
  });
  return ok;
}
function wire(form,done){
  fillSelects(form);
  $$('input,select',form).forEach(function(i){i.addEventListener('input',function(){var f=i.closest('.field');if(f)f.classList.remove('err')})});
  form.addEventListener('submit',function(e){e.preventDefault();if(validate(form))done()});
}
wire($('#otherForm'),function(){$('#enqBox').classList.add('sent')});

/* ---------- sheet: side sheet (desktop) / bottom sheet (mobile) ---------- */
var sheet=$('#sheet'),scrim=$('#scrim'),sBody=$('#sheetBody'),sFoot=$('#sheetFoot'),sStep=$('#sheetStep'),sBack=$('#sheetBack'),lastFocus=null;
function openSheet(){
  lastFocus=document.activeElement;
  sheet.classList.add('on');scrim.classList.add('on');sheet.setAttribute('aria-hidden','false');
  if(lenis)lenis.stop();document.body.style.overflow='hidden';
  setTimeout(function(){$('#sheetClose').focus()},350);
}
function closeSheet(){
  sheet.classList.remove('on');scrim.classList.remove('on');sheet.setAttribute('aria-hidden','true');
  if(lenis&&!lb.classList.contains('on'))lenis.start();document.body.style.overflow='';
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
$('#sheetClose').addEventListener('click',closeSheet);scrim.addEventListener('click',closeSheet);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(lb.classList.contains('on'))closeLB();else if(sheet.classList.contains('on'))closeSheet()}});

var enqMode=false,enqFromQuiz=false;
var DIAL=[['+91','India'],['+1','United States'],['+44','United Kingdom'],['+61','Australia'],['+971','UAE'],['+65','Singapore'],['+49','Germany'],['+33','France'],['+60','Malaysia'],['+94','Sri Lanka'],['+977','Nepal'],['+27','South Africa'],['+81','Japan']];
var GEO={
 'India':{'Tamil Nadu':['Coimbatore','Chennai','Madurai','Tiruchirappalli','Salem'],'Karnataka':['Bengaluru','Mysuru','Mangaluru'],'Maharashtra':['Mumbai','Pune','Nagpur'],'Kerala':['Kochi','Thiruvananthapuram','Kozhikode'],'Telangana':['Hyderabad','Warangal'],'Andhra Pradesh':['Visakhapatnam','Vijayawada'],'Delhi':['New Delhi'],'Gujarat':['Ahmedabad','Surat','Vadodara'],'West Bengal':['Kolkata','Siliguri'],'Uttar Pradesh':['Lucknow','Noida','Varanasi'],'Rajasthan':['Jaipur','Udaipur'],'Punjab':['Ludhiana','Amritsar']},
 'United States':{'California':['San Francisco','Los Angeles'],'New York':['New York City'],'Texas':['Austin','Houston'],'Tennessee':['Nashville']},
 'United Kingdom':{'England':['London','Manchester'],'Scotland':['Edinburgh']},
 'Australia':{'New South Wales':['Sydney'],'Victoria':['Melbourne']},
 'Singapore':{'Singapore':['Singapore']},
 'UAE':{'Dubai':['Dubai'],'Abu Dhabi':['Abu Dhabi']}
};
function opts(list,ph){return '<option value="" disabled selected hidden>'+ph+'</option>'+list.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')}
function ccField(name,ph){
  return '<div class="eq-f" data-f="'+name+'"><label>'+(name==='mobile'?'Mobile Number':'WhatsApp Number')+'</label><div class="eq-phone"><div class="cc"><i class="flag"></i><select data-cc aria-label="Country code">'+DIAL.map(function(d){return '<option value="'+d[0]+'">'+d[0]+'</option>'}).join('')+'</select><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg></div><input name="'+name+'" inputmode="tel" placeholder="'+ph+'" autocomplete="off"></div><span class="msg">Please enter a valid number</span></div>';
}
function showEnquiry(name,fromQuiz){
  enqMode=true;enqFromQuiz=!!fromQuiz;
  sheet.classList.add('eq');sheet.classList.remove('qz','qr');
  sBack.style.visibility='visible';sStep.innerHTML='';
  sBody.innerHTML='<div class="eq-title"><h3>Express Interest</h3></div><div class="eq-wrap"><form id="sheetForm" novalidate>'
   +'<input type="hidden" name="interest" value="'+esc(name)+'">'
   +'<div class="eq-f" data-f="name"><label>Full Name</label><input name="name" placeholder="Enter Full Name" autocomplete="off"><span class="msg">Please enter your name</span></div>'
   +'<div class="eq-f" data-f="email"><label>Email Address</label><input name="email" type="email" placeholder="Enter Email Address" autocomplete="off"><span class="msg">Please enter a valid email</span></div>'
   +ccField('mobile','Enter Mobile Number')+ccField('whatsapp','Enter Whatsapp Number')
   +'<div class="eq-f sel" data-f="country"><label>Country</label><div class="eq-sel"><select name="country">'+opts(Object.keys(GEO).concat(['Other']),'Select Country')+'</select><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div><span class="msg">Please select a country</span></div>'
   +'<div class="eq-f sel"><label>State</label><div class="eq-sel"><select name="state">'+opts([],'Select State')+'</select><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>'
   +'<div class="eq-f sel"><label>City</label><div class="eq-sel"><select name="city">'+opts([],'Select City')+'</select><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>'
   +'<div class="eq-f"><label>Pin Code</label><input name="pin" inputmode="numeric" placeholder="Enter Pin Code" autocomplete="off"></div>'
   +'</form><div class="eq-thanks" id="sheetThanks"><h3>Namaskaram, thank you.</h3><p>We have noted your interest in <b>'+esc(name)+'</b>. Our team will reach out to you soon.<br><em>(Prototype: nothing was sent.)</em></p></div></div>';
  sFoot.style.display='block';
  sFoot.innerHTML='<button class="final" id="eqSubmit" type="submit" form="sheetForm">Submit <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
  var f=$('#sheetForm');
  var selC=$('[name=country]',f),selS=$('[name=state]',f),selT=$('[name=city]',f);
  selC.addEventListener('change',function(){
    var st=GEO[selC.value]?Object.keys(GEO[selC.value]):['Other'];
    selS.innerHTML=opts(st,'Select State');selT.innerHTML=opts([],'Select City');
    selC.classList.add('has');selS.classList.remove('has');selT.classList.remove('has');
  });
  selS.addEventListener('change',function(){
    var c=GEO[selC.value],ct=c&&c[selS.value]?c[selS.value]:['Other'];
    selT.innerHTML=opts(ct,'Select City');selS.classList.add('has');selT.classList.remove('has');
  });
  selT.addEventListener('change',function(){selT.classList.add('has')});
  $$('select[data-cc]',f).forEach(function(s){
    var fl=s.parentNode.querySelector('.flag');
    var upd=function(){fl.classList.toggle('in',s.value==='+91');fl.classList.toggle('other',s.value!=='+91')};
    s.addEventListener('change',upd);upd();
  });
  $$('input,select',f).forEach(function(i){i.addEventListener('input',function(){var w=i.closest('.eq-f');if(w)w.classList.remove('err')});i.addEventListener('change',function(){var w=i.closest('.eq-f');if(w)w.classList.remove('err')})});
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;
    function chk(n,test){var w=$('[data-f='+n+']',f),i=$('input,select[name]',w);var bad=!test(i.value.trim());w.classList.toggle('err',bad);if(bad)ok=false}
    chk('name',function(v){return v.length>1});
    chk('email',function(v){return /^\S+@\S+\.\S+$/.test(v)});
    chk('mobile',function(v){return /^[0-9 ]{6,14}$/.test(v)});
    chk('country',function(v){return !!v});
    var wa=$('[name=whatsapp]',f).value.trim();
    if(wa&&!/^[0-9 ]{6,14}$/.test(wa)){$('[data-f=whatsapp]',f).classList.add('err');ok=false}
    if(!ok){var first=$('.eq-f.err',f);if(first)first.scrollIntoView({block:'center',behavior:'smooth'});return}
    f.style.display='none';$('#sheetThanks').style.display='block';
    sFoot.innerHTML='<button class="final" type="button" id="eqDone">Done</button>';
    $('#eqDone').addEventListener('click',closeSheet);
    sBody.scrollTop=0;
  });
  sBody.scrollTop=0;openSheet();
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-enquire]');if(b){showEnquiry(b.dataset.enquire,!!b.closest('#sheet'))}});

/* ---------- quiz in sheet ---------- */
var QZ=[
 {q:'What interests you about Karma Sadhana?',l:'Select intent',o:['Contributing to Sadhguru’s vision','Personal transformation','Experiencing life at an Isha center','Deepening my spiritual journey']},
 {q:'How much time can you commit?',l:'Select duration',o:['5 to 10 days','A few weeks','A month or more','Not Sure']},
 {q:'Have you done Karma Sadhana at an Isha center before?',l:'Select the option',o:['No, this would be my first time','Yes, once','I have done Karma Sadhana at a local center','I do Karma Sadhana regularly']},
 {q:'Where would you like to do Karma Sadhana?',l:'Select the option',o:['Isha Yoga Center Coimbatore','Sadhguru Sannidhi Bengaluru','From Home','Location Near You']}
];
var qStep=0,qAns=[];
function dotsHTML(n){
  var h='';
  for(var i=0;i<5;i++){
    h+='<i class="'+(i<=n?'g':'x')+'"></i>';
    h+= i<n?'<img src="img/qz_chk.svg" width="16" height="16" alt="">' : i===n?'<img src="img/qz_cur.svg" width="20" height="20" alt="">' : '<img src="img/qz_fut.svg" width="16" height="16" alt="">';
  }
  return h;
}
function showQuiz(step){
  enqMode=false;sheet.classList.remove('eq');
  qStep=step;
  var d=QZ[step];sBack.style.visibility='visible';
  sheet.classList.add('qz');sheet.classList.remove('qr');
  sStep.innerHTML='<div class="qs-row"><span>Step '+(step+1)+'/5</span><div class="qs-trk">'+dotsHTML(step)+'</div></div>';
  sBody.innerHTML='<div class="qv"><div class="q-head"><h3 class="q-title">'+esc(d.q)+'</h3></div><div class="q-wrap"><p class="q-label">'+esc(d.l)+'</p>'+d.o.map(function(o,i){return '<button class="opt'+(qAns[step]===i?' on':'')+'" data-i="'+i+'">'+esc(o)+'</button>'}).join('')+'</div></div>';
  var last=step===QZ.length-1;
  sFoot.style.display='block';
  sFoot.innerHTML='<button id="qNext" class="'+(last?'final':'')+'" '+(qAns[step]==null?'disabled':'')+'>'+(last?'See results':'Continue')+' <img src="img/qz_arrow.svg" width="18" height="18" alt=""></button>';
  $$('.opt',sBody).forEach(function(b){b.addEventListener('click',function(){
    qAns[step]=+b.dataset.i;$$('.opt',sBody).forEach(function(x){x.classList.toggle('on',x===b)});$('#qNext').disabled=false})});
  $('#qNext').addEventListener('click',function(){if(qAns[step]==null)return;last?showResults():showQuiz(step+1)});
}
function showResults(){
  enqMode=false;sheet.classList.remove('eq');sheet.classList.add('qz','qr');
  var all=ITEMS.spaces.concat(ITEMS.programs.slice(0,2),ITEMS.yoga.slice(0,1));
  var loc=qAns[3],res=all.filter(function(it){
    if(loc===0)return /Coimbatore/.test(it.loc)||/Multiple/.test(it.loc);
    if(loc===1)return /Bengaluru/.test(it.loc)||/Multiple/.test(it.loc);
    if(loc===2)return /Multiple|Online/.test(it.loc+it.tags.join());
    return true;
  });
  if(loc===2)res=[{t:'Karma Sadhana from home',img:'img/fyp_2828c.jpg',d:'Offer your skills to projects and initiatives for a few hours each week, from wherever you are.',tags:['Online'],cta:'Know More'}].concat(ITEMS.programs.filter(function(p){return p.tags.indexOf('Online')>-1}).slice(0,2));
  if(!res.length)res=all.slice(0,3);
  sBack.style.visibility='visible';sStep.innerHTML='';
  var n=res.length;
  sBody.innerHTML='<div class="qv"><div class="q-head"><h3 class="q-title">recommended sevas</h3></div><div class="q-count">Showing '+(n<10?'0'+n:n)+' results based on your answers</div><div class="rlist">'+res.map(function(it){return '<div class="rcard"><div class="rh"><img src="'+it.img+'" alt=""><b>'+esc(it.t)+'</b></div><p>'+esc(it.d||'Karma Sadhana opportunity at an Isha center.')+'</p><div class="rf"><div class="pills">'+it.tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div><a data-enquire="'+esc(it.t)+'">Know more</a></div></div>'}).join('')+'</div></div>';
  sFoot.innerHTML='';sFoot.style.display='none';sBody.scrollTop=0;
  qStep=QZ.length;
}
sBack.addEventListener('click',function(){
  if(enqMode){var q=enqFromQuiz;enqMode=false;sheet.classList.remove('eq');if(q){showResults()}else{closeSheet()}return}
  if(qStep>=QZ.length)showQuiz(QZ.length-1);else if(qStep>0)showQuiz(qStep-1);else closeSheet();
});
$('#beginQuiz').addEventListener('click',function(){qAns=[];showQuiz(0);openSheet()});

onScroll();
})();
