'use strict';
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let config=null;
const configReady=Promise.resolve(window.SITE_CONFIG).then(c=>{
 config=c;
 $$('[data-company]').forEach(e=>e.textContent=c.companyName);
 $$('[data-logo]').forEach(e=>e.src=c.logo);
 $('link[rel=icon]').href=c.favicon;
 document.title=document.body.dataset.page==='home'?c.siteTitle:document.title.split(' — ')[0]+' — '+c.companyName;
 $$('[data-email]').forEach(e=>{e.textContent=c.email;e.href='mailto:'+c.email});
 $$('[data-address]').forEach(e=>e.textContent=c.address);
 $$('[data-footer]').forEach(e=>e.textContent=c.footerText);
 $$('[data-disclaimer]').forEach(e=>e.textContent=c.disclaimer);
 const title=$('[data-collab-title]');if(title)title.textContent=c.collaboration.title;
 const text=$('[data-collab-text]');if(text)text.textContent=c.collaboration.text;
 if(c.links)$$('a[href]').forEach(a=>{const href=a.getAttribute('href');if(c.links[href])a.href=c.links[href]});
 if(c.navigation){const links=$$('nav>a');for(const a of links){const n=c.navigation.find(n=>n.label===a.textContent);if(n)a.href=n.href}}
 return c;
}).catch(()=>{const status=$('.form-status');if(status){status.textContent='The contact configuration could not be loaded. Please refresh the page.';status.classList.add('error')}return null});
$$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const menu=$('.menu-toggle');
function closeMenu(){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu')}
menu.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
$('.services-toggle').addEventListener('click',()=>{const d=$('.dropdown'),open=d.classList.toggle('is-open');$('.services-toggle').setAttribute('aria-expanded',String(open))});
$$('nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$('.dropdown').classList.remove('is-open');$('.services-toggle').setAttribute('aria-expanded','false')}});
document.addEventListener('click',e=>{if(!e.target.closest('.dropdown')){$('.dropdown').classList.remove('is-open');$('.services-toggle').setAttribute('aria-expanded','false')}});
matchMedia('(min-width:901px)').addEventListener('change',closeMenu);
menu.addEventListener('keydown',e=>{if(e.key==='Tab'&&document.body.classList.contains('menu-open')&&!e.shiftKey){e.preventDefault();$('nav>a').focus()}});
$('nav').addEventListener('keydown',e=>{if(e.key!=='Tab'||!document.body.classList.contains('menu-open'))return;const items=$$('a,button',$('nav')).filter(x=>x.getClientRects().length);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();menu.focus()}if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();menu.focus()}});
try{if(localStorage.getItem('avero-privacy-notice'))$('.cookie-banner').remove()}catch{}
$('.cookie-accept')?.addEventListener('click',()=>{try{localStorage.setItem('avero-privacy-notice','acknowledged')}catch{}const banner=$('.cookie-banner');banner.classList.add('dismiss');setTimeout(()=>banner.remove(),reduced?0:450)});
function splitHeading(el){
 const text=el.textContent;el.setAttribute('aria-label',text);let delay=0;
 function split(node){for(const child of [...node.childNodes]){if(child.nodeType===3){const frag=document.createDocumentFragment();child.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.append(document.createTextNode(part));return}const word=document.createElement('span');word.className='word';word.setAttribute('aria-hidden','true');for(const ch of part){const letter=document.createElement('span');letter.className='letter';letter.textContent=ch;letter.style.setProperty('--letter-delay',Math.min(delay++*7,220)+'ms');word.append(letter)}frag.append(word)});child.replaceWith(frag)}else if(child.nodeType===1&&child.tagName!=='BR')split(child)}}split(el)
}
if(!reduced)$$('h1[data-aos],h2[data-aos],[data-hero-line]').forEach(splitHeading);
if('IntersectionObserver' in window){document.documentElement.classList.add('js');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:0,rootMargin:'160px 0px'});$$('[data-aos]:not(h1):not(h2)').forEach((e)=>observer.observe(e));const headingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');headingObserver.unobserve(entry.target)}}),{threshold:.15,rootMargin:'0px 0px -20px 0px'});$$('h1[data-aos],h2[data-aos]').forEach(e=>headingObserver.observe(e))}
const parallax=$('.parallax'),topButton=$('.back-top');let ticking=false;
function scrollUpdate(){topButton.classList.toggle('visible',scrollY>650);$('header').classList.toggle('scrolled',scrollY>90);if(!reduced&&innerWidth>600)$$('[data-drift]').forEach(e=>{const r=e.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)e.style.setProperty('--drift',Math.round((r.top/innerHeight-.35)*130)+'px')});if(parallax&&!reduced){const r=parallax.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const progress=(innerHeight-r.top)/(innerHeight+r.height);parallax.style.setProperty('--parallax',(-3+progress*3)+'%')}}if(!reduced)$$('.scroll-sculpture,.about-wire').forEach(e=>{const r=e.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)e.style.setProperty('--scroll-rotation',(r.top*.045)+'deg')});ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollUpdate);ticking=true}},{passive:true});scrollUpdate();topButton.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'instant':'smooth'}));
const accordionControllers=new Map();
$$('details').forEach(details=>{
 const summary=$('summary',details);
 if(!summary)return;
 const content=document.createElement('div'),inner=document.createElement('div');
 content.className='accordion-content';inner.className='accordion-content-inner';
 while(summary.nextSibling)inner.append(summary.nextSibling);
 content.append(inner);details.append(content);
 let expanded=details.open,animation=null;
 details.dataset.expanded=String(expanded);
 function setExpanded(next){
  if(next===expanded)return;
  expanded=next;
  const height=details.open?content.getBoundingClientRect().height:0;
  const opacity=details.open?getComputedStyle(content).opacity:0;
  animation?.cancel();
  details.dataset.expanded=String(next);
  details.open=true;
  if(reduced){details.open=next;return}
  content.style.overflow='hidden';
  animation=content.animate([
   {height:height+'px',opacity},
   {height:(next?inner.getBoundingClientRect().height:0)+'px',opacity:next?1:0}
  ],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
  animation.onfinish=()=>{
   details.open=expanded;
   content.style.removeProperty('overflow');
   animation=null;
  };
 }
 accordionControllers.set(details,setExpanded);
 summary.addEventListener('click',event=>{
  event.preventDefault();
  const next=!expanded;
  if(next&&details.closest('.service-accordion')){
   $$('details',details.closest('.service-accordion')).forEach(other=>{
    if(other!==details)accordionControllers.get(other)?.(false);
   });
  }
  setExpanded(next);
 });
});
$$('button[data-step]').forEach((b,i)=>{function activate(){const panel=$('#process-panel');if(b.getAttribute('aria-selected')==='true')return;$$('button[data-step]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));panel.setAttribute('aria-labelledby',b.id);$('p',panel).textContent=b.dataset.description;$('.orbit',panel).dataset.step=String(i)}b.addEventListener('click',activate);b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')activate()});b.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const tabs=$$('button[data-step]');tabs[(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:tabs.length-1))%tabs.length].focus();tabs[(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:tabs.length-1))%tabs.length].click()}})});
$$('.carousel').forEach(carousel=>{const track=$('.carousel-track',carousel),original=[...track.children],count=original.length;let index=count,busy=false,step=0,startX=0,startY=0,drag=false;
 function clone(node){const c=node.cloneNode(true);c.setAttribute('aria-hidden','true');$$('a,button,input',c).forEach(e=>e.tabIndex=-1);return c}
 original.slice().reverse().forEach(n=>track.prepend(clone(n)));original.forEach(n=>track.append(clone(n)));
 function position(animate=false){track.style.transition=animate&&!reduced?'transform 600ms cubic-bezier(.22,.7,.18,1)':'none';track.style.transform=`translate3d(${-index*step}px,0,0)`}
 function measure(){step=track.children[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);position()}
 function move(dir){if(busy)return;busy=true;index+=dir;position(true);setTimeout(()=>{if(index>=count*2)index-=count;if(index<count)index+=count;position();busy=false},reduced?0:620)}
 $('[data-prev]',carousel.closest('section')).addEventListener('click',()=>move(-1));$('[data-next]',carousel.closest('section')).addEventListener('click',()=>move(1));
 carousel.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 carousel.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;startX=e.clientX;startY=e.clientY;drag=true;carousel.setPointerCapture(e.pointerId)});
 carousel.addEventListener('pointerup',e=>{if(!drag)return;drag=false;const x=e.clientX-startX,y=e.clientY-startY;if(Math.abs(x)>40&&Math.abs(x)>Math.abs(y))move(x<0?1:-1)});
 carousel.addEventListener('pointercancel',()=>drag=false);
 new ResizeObserver(measure).observe(carousel);document.fonts.ready.then(measure);
});
const form=$('#contact-form');
if(form){$('input[name=started]',form).value=String(Date.now());let token='';
 async function getToken(c){if(!c?.form.enabled)return;try{const r=await fetch(c.form.endpoint+'?token=1',{credentials:'same-origin'});const d=await r.json();if(r.ok&&d.token)token=d.token}catch{}}
 configReady.then(getToken);
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const status=$('.form-status'),button=$('button[type=submit]',form);status.className='form-status';const c=await configReady;
 if(!c?.form.enabled){status.classList.add('error');status.textContent='Enquiries are not enabled yet. The website owner needs to configure the corporate mailbox before this form can receive requests.';return}
 button.disabled=true;status.textContent='Sending your request…';
 try{if(!token)await getToken(c);if(!token)throw Error('The secure connection could not be established. Please try again.');const data=new FormData(form);data.set('csrf',token);const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);let response;try{response=await fetch(c.form.endpoint,{method:'POST',body:data,credentials:'same-origin',signal:controller.signal})}finally{clearTimeout(timer)}const result=await response.json();if(!response.ok||result.success!==true)throw Error(result.error||'Your request was not received. Please try again.');status.classList.add('success');status.textContent=c.form.successMessage;form.reset();$('input[name=started]',form).value=String(Date.now());token='';await getToken(c)}catch(err){status.classList.add('error');status.textContent=err.name==='AbortError'?'The request timed out. Delivery could not be confirmed. Please contact us before sending again.':err.message||'Your request could not be sent. Please try again.'}finally{button.disabled=false}
 });
}
const overlay=$('.page-transition');
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.download)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html')||url.pathname===location.pathname)return;e.preventDefault();closeMenu();overlay.classList.add('active');setTimeout(()=>location.assign(url.href),reduced?0:450)});
addEventListener('pageshow',()=>overlay.classList.remove('active'));

const studioDialog=$('.studio-dialog');
$('.studio-play')?.addEventListener('click',()=>studioDialog.showModal());
$('.dialog-close')?.addEventListener('click',()=>studioDialog.close());
studioDialog?.addEventListener('click',e=>{if(e.target===studioDialog){const r=studioDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)studioDialog.close()}});
$('.studio-dialog .button')?.addEventListener('click',()=>studioDialog.close());

$$('.feature-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',((e.clientY-r.top)/r.height*12-6)+'deg');card.style.setProperty('--tilt-y',((e.clientX-r.left)/r.width*20-10)+'deg')});card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')})});

$$('.benefit-card').forEach(card=>{card.addEventListener('click',()=>card.classList.toggle('flipped'));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.classList.toggle('flipped')}})});
const legalLinks=$$('.legal-nav a[href^="#"]');if(legalLinks.length){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)legalLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))})},{rootMargin:'-20% 0px -55% 0px'});$$('.legal-content article').forEach(a=>observer.observe(a))}
$$('[data-focus]').forEach((b,i)=>{const activate=()=>{$$('[data-focus]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));$$('.focus-image').forEach((x,j)=>{x.classList.toggle('active',i===j);x.setAttribute('aria-hidden',String(i!==j))})};b.addEventListener('click',activate);b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')activate()});b.addEventListener('focus',activate)});
