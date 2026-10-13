const BUDGET = 10.750, MAX_PLAYERS = 7;
const categoryNames = {"US":"🌍 Utländska Seniorer (US)","SS":"🇸🇪 Svenska Seniorer (SS)","UU21":"🌍 Utländska U21 (UU21)","SU21":"🇸🇪 Svenska U21 (SU21)"};
let myTeam = Array();
let openCategories = {"US":false,"SS":false,"UU21":false,"SU21":false};

function renderDrivers() {
    const s = document.getElementById('search').value.toLowerCase();
    const container = document.getElementById('accordion-container'); container.innerHTML = '';
    let av = drivers.filter(d => !myTeam.some(t => t.id === d.id) && d.name.toLowerCase().includes(s));
    av.sort((a,b)=>b.avg-a.avg);
    const g = {"US":Array(),"SS":Array(),"UU21":Array(),"SU21":Array()};
    av.forEach(d => { if(g[d.category]) g[d.category].push(d); });
    const categoryOrder = Array("US","SS","UU21","SU21");
    categoryOrder.forEach(cat => {
        if(g[cat].length > 0) {
            const accBtn = document.createElement('div');
            accBtn.className = 'category-accordion' + ((openCategories[cat] || s.length > 0) ? ' active' : '');
            accBtn.innerHTML = `<span>${categoryNames[cat]} (${g[cat].length} st)</span><span class="accordion-arrow">▶</span>`;
            const contentDiv = document.createElement('div');
            contentDiv.className = 'category-content';
            contentDiv.style.display = (openCategories[cat] || s.length > 0) ? 'block' : 'none';
            g[cat].forEach(d => {
                const div = document.createElement('div'); div.className = `driver ${d.category}`;
                div.innerHTML = `<div><strong>${d.name}</strong> <span class="category-badge">${d.category}</span><br><small>Ingångssnitt: ${d.avg.toFixed(3)}</small></div><button class="btn-pick" onclick="addDriver(${d.id})">Välj</button>`;
                contentDiv.appendChild(div);
            });
            accBtn.onclick = function() {
                const isOpen = contentDiv.style.display === 'block';
                contentDiv.style.display = isOpen ? 'none' : 'block';
                if(isOpen) { accBtn.classList.remove('active'); openCategories[cat] = false; }
                else { accBtn.classList.add('active'); openCategories[cat] = true; }
                sendHeight();
            };
            container.appendChild(accBtn); container.appendChild(contentDiv);
        }
    });
    if(av.length === 0) container.innerHTML = '<p style="text-align:center;color:#666;">Inga förare hittades</p>';
    sendHeight();
}

function renderTeam() {
    const c = document.getElementById('team'); c.innerHTML = '';
    if(myTeam.length===0){c.innerHTML='<i>Inga förare valda än. Klicka på "Välj" nedan!</i>';updateStatus();return;}
    let finalOrderedTeam = Array();
    if(myTeam.length>2){
        let s = [...myTeam].sort((a,b)=>a.avg-b.avg);
        let res = Array(s,s), main = s.slice(2);
        main.sort((a,b)=>b.avg-a.avg); res.sort((a,b)=>b.avg-a.avg);
        finalOrderedTeam = [...main,...res];
    } else { finalOrderedTeam = [...myTeam].sort((a,b)=>a.avg-b.avg); }
    finalOrderedTeam.forEach((d, i) => {
        const div = document.createElement('div'); div.className=`team-member ${d.category}`;
        const p = i+1, isR = p>=6, nCl = isR?'position-number reserve-position':'position-number', lbl = isR?`Plats ${p} (R)`:`Plats ${p}`;
        div.innerHTML=`<div><span class="${nCl}">${p}</span><strong>${d.name}</strong> <span class="category-badge">${d.category}</span><br><small style="margin-left:32px;">Snitt: ${d.avg.toFixed(3)} (${lbl})</small></div><button class="btn-remove" onclick="removeDriver(${d.id})">Ta bort</button>`;
        c.appendChild(div);
    });
    updateStatus();
}

function addDriver(id){ if(myTeam.length>=MAX_PLAYERS){alert("Du kan max välja 7 förare!");return;} const d=drivers.find(x=>x.id===id); if(d){myTeam.push(d);renderTeam();renderDrivers();}}
function removeDriver(id){ myTeam=myTeam.filter(x=>x.id!==id);renderTeam();renderDrivers(); }

function updateStatus() {
    const tot = myTeam.reduce((sum,d)=>sum+d.avg,0), rem = BUDGET-tot;
    const bEl = document.getElementById('budget'); bEl.innerText = `${tot.toFixed(3)} / ${BUDGET.toFixed(3)}`;
    bEl.className = tot>BUDGET?'invalid':'valid';
    document.getElementById('remaining').innerText = rem.toFixed(3);
    document.getElementById('team-count').innerText = `${myTeam.length} / ${MAX_PLAYERS}`;
    const ss = myTeam.filter(d=>d.category==="SS").length, su = myTeam.filter(d=>d.category==="SU21").length, totU = su+myTeam.filter(d=>d.category==="UU21").length;
    const rEl = document.getElementById('rules'); let h = '';
    h += tot>BUDGET?`<div class="rule-item invalid">❌ Snitt-tak överskridet (${tot.toFixed(3)} > 10.750)</div>`:(myTeam.length>0?`<div class="rule-item valid">✅ Snitt-tak ok (${tot.toFixed(3)} / 10.750)</div>`:`<div class="rule-item" style="color:#666;">⚪ Snitt-tak (Max 10.750)</div>`);
    h += ss>=2?`<div class="rule-item valid">✅ Minst två svenska seniorer (${ss}/2)</div>`:`<div class="rule-item invalid">❌ Kräver minst två svenska seniorer (${ss}/2)</div>`;
    h += (totU>=2&&su>=1)?`<div class="rule-item valid">✅ U21-krav uppfyllt (Totalt: ${totU}/2, Svenska: ${su}/1)</div>`:`<div class="rule-item invalid">❌ Kräver minst två U21 (${totU}/2) varav minst en svensk (${su}/1)</div>`;
    rEl.innerHTML = h; sendHeight();
}

function clearTeam(){ myTeam=Array();renderTeam();renderDrivers(); }

function shareTeam() {
    if(myTeam.length<MAX_PLAYERS){alert("Välj 7 förare innan du delar ditt lag!");return;}
    const tot=myTeam.reduce((sum,d)=>sum+d.avg,0), ss=myTeam.filter(d=>d.category==="SS").length, su=myTeam.filter(d=>d.category==="SU21").length, totU=su+myTeam.filter(d=>d.category==="UU21").length;
    if(tot>BUDGET||ss<2||totU<2||su<1){alert("Ditt lag uppfyller inte alla lagregler ännu!");return;}
    const txt = `Jag byggde min speedwaysjua med VT-sporten! Mitt totalsnitt blev ${tot.toFixed(3)}! Mitt lag: ${myTeam.map(d=>d.name).join(", ")}. Bygg ditt eget lag här! 🏁`;
    if(navigator.share){navigator.share({title:'Min Speedwaysjua',text:txt});}else{navigator.clipboard.writeText(txt);alert("Laguppställningen kopierad!");}
}

function sendHeight(){ setTimeout(()=>{const h=document.documentElement.scrollHeight||document.body.scrollHeight;window.parent.postMessage({type:'resize-iframe',height:h},'*');},100); }
window.onload=()=>{renderDrivers();window.addEventListener('resize',sendHeight);};

