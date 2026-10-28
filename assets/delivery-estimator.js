(()=>{const labels={en:{title:"Delivery fee",governorate:"Governorate",choose:"Choose your governorate",pending:"Select your governorate to see the flat delivery fee.",fee:"Flat delivery fee",days:"Estimated delivery",variance:"",ask:"Ask on WhatsApp"},ar:{title:"رسوم التوصيل",governorate:"المحافظة",choose:"اختر المحافظة",pending:"اختر المحافظة لعرض رسوم التوصيل الثابتة.",fee:"رسوم التوصيل الثابتة",days:"مدة التوصيل المتوقعة",variance:"",ask:"اسأل عبر واتساب"}};
let config=null,selected="";try{selected=localStorage.getItem("printfy3d_delivery_governorate")||"";}catch(e){}let refreshers=[];
const lang=()=>document.documentElement.lang==="ar"?"ar":"en";
const money=v=>new Intl.NumberFormat(lang()==="ar"?"ar-EG":"en-EG",{maximumFractionDigits:2}).format(v)+" "+(lang()==="ar"?"جنيه":"EGP");
function render(root,index){const l=lang(),t=labels[l],wrap=document.createElement("div");wrap.className="delivery-estimator";
const id="delivery-governorate-"+index,label=document.createElement("label");label.htmlFor=id;label.textContent=t.governorate;
const select=document.createElement("select");select.id=id;select.className="field delivery-estimator-select";
const first=document.createElement("option");first.value="";first.textContent=t.choose;select.append(first);
(config?.governorates||[]).forEach(g=>{const o=document.createElement("option");o.value=g.slug;o.textContent=l==="ar"?g.name_ar:g.name_en;if(selected===g.slug)o.selected=true;select.append(o);});
const status=document.createElement("p");status.className="delivery-estimator-status sub text-sm mt-2";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
const note=document.createElement("p");note.className="delivery-estimator-note sub text-xs mt-1";note.textContent=t.variance;note.hidden=true;
const link=document.createElement("a");link.className="delivery-estimator-ask text-sm underline brand";link.href="https://wa.me/201063870873";link.target="_blank";link.rel="noopener noreferrer";link.textContent=t.ask;
wrap.append(label,select,status,note,link);root.replaceChildren(wrap);
function update(){select.value=selected;
const g=(config?.governorates||[]).find(x=>x.slug===selected);
if(!g){status.textContent="";note.hidden=true;link.hidden=true;window.dispatchEvent(new CustomEvent("printfy:delivery-selected",{detail:{slug:"",fee:null}}));return;}
note.hidden=true;
const fee=Number.isFinite(g.fee_egp)?t.fee+": "+money(g.fee_egp):"";
window.dispatchEvent(new CustomEvent("printfy:delivery-selected",{detail:{slug:g.slug,fee:Number.isFinite(g.fee_egp)?g.fee_egp:null,name_en:g.name_en,name_ar:g.name_ar}}));
const days=Number.isFinite(g.days_min)&&Number.isFinite(g.days_max)?t.days+": "+g.days_min+"–"+g.days_max+" "+(l==="ar"?"يوم":"days"):"";
status.textContent=fee||days?[fee,days].filter(Boolean).join(" · "):t.pending;
const msg=(l==="ar"?"استفسار عن التوصيل إلى ":"Delivery estimate for ")+(l==="ar"?g.name_ar:g.name_en);
link.href="https://wa.me/201063870873?text="+encodeURIComponent(msg);link.hidden=false;
}
select.addEventListener("change",()=>{selected=select.value;try{localStorage.setItem("printfy3d_delivery_governorate",selected);}catch(e){}refreshers.forEach(fn=>fn());});refreshers.push(update);update();}
async function init(){const roots=[...document.querySelectorAll("[data-delivery-estimator]")];if(!roots.length)return;try{const r=await fetch("/assets/delivery-rates.json",{cache:"no-store"});if(!r.ok)throw new Error("config");config=await r.json();}catch{config={governorates:[]};}
roots.forEach((root,index)=>render(root,index));}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();