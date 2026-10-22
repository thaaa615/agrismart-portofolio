const IMGS=["assets/img/layar-1.webp", "assets/img/layar-2.webp", "assets/img/layar-3.webp", "assets/img/layar-4.webp", "assets/img/layar-5.webp"],PH=["assets/img/lapangan-1.webp", "assets/img/lapangan-2.webp"];
document.documentElement.classList.add('js');
PH.forEach((s,i)=>document.getElementById('p'+i).src=s);
const S=[
 ['Dashboard','agrismart/dashboard','Tujuh parameter tanah tampil sekaligus dengan rentang ideal dan status sensor yang sudah tersinkron.'],
 ['Kondisi Tanaman','agrismart/kondisi-tanaman','Status kesehatan lahan: enam parameter normal, satu di luar rentang. Rincian tiap parameter ada di tabel.'],
 ['Rekomendasi','agrismart/rekomendasi-pemupukan','Model menyarankan pupuk dan dosis per hektar, dan total kebutuhan dihitung dari luas lahan.'],
 ['Lahan','agrismart/lahan','Setiap lahan punya tanaman, luas, dan sensor sendiri. Satu lahan bisa dijadikan aktif.'],
 ['Tambah lahan','agrismart/lahan/tambah','Formulir untuk mendaftarkan lahan baru: nama, luas, lokasi, dan jenis tanaman.']
];
const tabs=document.getElementById('tabs'),stage=document.getElementById('stage');
const curname=document.getElementById('curname'),cap=document.getElementById('cap'),capm=document.getElementById('capm'),url=document.getElementById('url');
S.forEach((s,i)=>{
  const b=document.createElement('button');b.role='tab';b.textContent=s[0];b.id='t'+i;
  b.addEventListener('click',()=>pick(i));
  b.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();pick((i+1)%S.length,true)}
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();pick((i+S.length-1)%S.length,true)}
  });
  tabs.appendChild(b);
  const im=new Image();im.src=IMGS[i];im.alt='Tampilan '+s[0]+' AgriSmart';im.loading=i?'lazy':'eager';stage.appendChild(im);
});
const openBtn=document.getElementById('open');
function setMenu(on){document.body.classList.toggle('menu-open',on);openBtn.setAttribute('aria-expanded',on);}
openBtn.addEventListener('click',()=>{setMenu(true);tabs.querySelector('[aria-selected=true]').focus()});
document.getElementById('close').addEventListener('click',()=>{setMenu(false);openBtn.focus()});
document.getElementById('scrim').addEventListener('click',()=>setMenu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
matchMedia('(min-width:901px)').addEventListener('change',()=>setMenu(false));
function pick(i,focus){
  [...tabs.children].forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});
  [...stage.children].forEach((im,j)=>im.classList.toggle('on',j===i));
  cap.textContent=capm.textContent=S[i][2];url.textContent=S[i][1];curname.textContent=S[i][0];setMenu(false);
  if(focus)tabs.children[i].focus();
}
pick(0);

const P=[
 {k:'Kelembaban',u:'%',min:0,max:100,lo:40,hi:60,v:45.5,step:.5},
 {k:'pH tanah',u:'',min:3,max:10,lo:5.5,hi:7,v:6.2,step:.1},
 {k:'Suhu tanah',u:'°C',min:10,max:45,lo:20,hi:30,v:27.5,step:.5},
 {k:'Nitrogen',u:'mg/kg',min:0,max:250,lo:50,hi:150,v:90,step:1,n:'nitrogen'},
 {k:'Fosfor',u:'mg/kg',min:0,max:150,lo:30,hi:80,v:40,step:1,n:'fosfor'},
 {k:'Kalium',u:'mg/kg',min:0,max:150,lo:40,hi:100,v:20,step:1,n:'kalium (seperti MOP)'},
 {k:'EC',u:'mS/cm',min:0,max:4,lo:1,hi:2,v:1.8,step:.1}
];
const rows=document.getElementById('rows'),els=[];
P.forEach((p,i)=>{
  const r=document.createElement('div');r.className='row';
  r.innerHTML=`<div class="row-top"><label for="s${i}">${p.k}</label><span><span class="val"></span><span class="tag"></span></span></div><input id="s${i}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.min}">`;
  rows.appendChild(r);
  const s=r.querySelector('input'),pct=x=>(x-p.min)/(p.max-p.min)*100;
  s.style.setProperty('--a',pct(p.lo)+'%');s.style.setProperty('--b',pct(p.hi)+'%');
  els.push({p,s,val:r.querySelector('.val'),tag:r.querySelector('.tag')});
  s.addEventListener('input',update);
});
function update(){
  const bad=[];let ok=0;
  els.forEach(({p,s,val,tag})=>{
    const x=parseFloat(s.value);val.textContent=x+(p.u?' '+p.u:'');
    const st=x<p.lo?'rendah':x>p.hi?'tinggi':'ideal';
    tag.textContent=st[0].toUpperCase()+st.slice(1);tag.classList.toggle('bad',st!=='ideal');
    if(st==='ideal')ok++;else bad.push({p,st});
  });
  document.getElementById('vT').textContent=ok+' dari 7 parameter ideal';
  const low=bad.filter(b=>b.st==='rendah'&&b.p.n).map(b=>b.p.n),other=bad.filter(b=>!(b.st==='rendah'&&b.p.n)).map(b=>b.p.k.toLowerCase()+' '+b.st);
  let t=!bad.length?'Tanah dalam kondisi baik. Tidak perlu pemupukan tambahan.':'';
  if(low.length)t+='Kandidat pupuk: '+low.join(', ')+'. ';
  if(other.length)t+='Periksa juga '+other.join(', ')+'.';
  document.getElementById('vD').textContent=t.trim();
}
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(({p,s})=>s.value=p.v);update();return}
  const t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);
    els.forEach(({p,s})=>s.value=p.min+(p.v-p.min)*e);update();
    if(k<1)requestAnimationFrame(f);else{els.forEach(({p,s})=>s.value=p.v);update()}})(t0);
})();

/* progress + reveal */
const prog=document.getElementById('prog');let tick=false;
function sp(){const h=document.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';tick=false}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(sp)}},{passive:true});sp();
const targets=document.querySelectorAll('section .wrap > *:not(.show), .show .frame, .flow > div, .facts > div, .photos > figure');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach(el=>{
    if(el.closest('.flow,.facts,.photos'))el.style.setProperty('--d',[...el.parentNode.children].indexOf(el)*.1+'s');
    el.classList.add('reveal');io.observe(el);
  });
}
const root=document.documentElement;
document.getElementById('theme').addEventListener('click',()=>{
  const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  root.dataset.theme=dark?'light':'dark';
});
