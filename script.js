/* =====================================================
   DRESSING IA — APP LOGIC
   Stockage local (localStorage). Aucune donnée ne quitte
   l'appareil. Voir README pour l'architecture.
===================================================== */

(function(){
"use strict";

/* ---------------------------------------------------
   0. CONSTANTES & ÉTAT
--------------------------------------------------- */

const CATEGORIES = [
  "Haut","Veste","Pantalon","Chaussure",
  "Accessoire tête","Accessoire poignet","Accessoire taille","Chaussettes"
];

const OUTFIT_CORE = ["Haut","Pantalon","Chaussure"];

const SEASONS = {
  ete:     { key:"ete",     label:"Été",       emoji:"☀️", accent:"#3FAEA6", strong:"#2F8C86", contrast:"#0B2B29", tint:"#E4F3F1", months:[6,7,8]   },
  automne: { key:"automne", label:"Automne",   emoji:"🍂", accent:"#D9793D", strong:"#B85F2A", contrast:"#3A200D", tint:"#FBEADD", months:[9,10,11] },
  hiver:   { key:"hiver",   label:"Hiver",     emoji:"❄️", accent:"#CFAF6E", strong:"#A98B4C", contrast:"#2E2811", tint:"#F6F1E2", months:[12,1,2]  },
  printemps:{key:"printemps",label:"Printemps",emoji:"🌸", accent:"#8FB2DE", strong:"#5C86B8", contrast:"#122540", tint:"#E9F0F9", months:[3,4,5]   }
};

const HARMONIES = [
  ["blanc","bleu marine"],
  ["beige","marron"],
  ["noir","blanc"],
  ["gris","noir"],
  ["bleu","blanc"]
];

const REDISCOVER_DAYS = 21; // seuil "vêtement oublié"

const state = {
  clothes: loadJSON("clothes", []),
  likedOutfits: loadJSON("likedOutfits", []),
  deleteMode: false,
  selected: new Set(),
  search: "",
  filterCategory: "all",
  composeSelection: {},   // { categorie: clothingId }
  editingId: null
};

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
}
function saveClothes(){ localStorage.setItem("clothes", JSON.stringify(state.clothes)); }
function saveLiked(){ localStorage.setItem("likedOutfits", JSON.stringify(state.likedOutfits)); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------------------------------------------------
   1. SAISON — accent dynamique
--------------------------------------------------- */

function currentSeason(){
  const month = new Date().getMonth() + 1;
  return Object.values(SEASONS).find(s => s.months.includes(month)) || SEASONS.ete;
}

function applySeason(){
  const s = currentSeason();
  const root = document.documentElement.style;
  root.setProperty("--accent", s.accent);
  root.setProperty("--accent-strong", s.strong);
  root.setProperty("--accent-contrast", s.contrast);
  root.setProperty("--accent-tint", s.tint);

  const pill = document.getElementById("seasonPill");
  if(pill) pill.textContent = `${s.emoji} ${s.label}`;
  return s;
}

/* ---------------------------------------------------
   2. NAVIGATION
--------------------------------------------------- */

function showPage(name){
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.dataset.page === name));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.target === name));
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
  if(name === "dressing") renderCloset();
  if(name === "create") renderShelves();
  if(name === "home") renderHome();
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=> showPage(btn.dataset.target));
});

/* ---------------------------------------------------
   3. TOAST
--------------------------------------------------- */

let toastTimer = null;
function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove("is-visible"), 2400);
}

/* ---------------------------------------------------
   4. UTILITAIRES DRESSING
--------------------------------------------------- */

function daysSince(dateStr){
  if(!dateStr) return Infinity;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400000);
}

function random(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function byCategory(cat){ return state.clothes.filter(c => c.category === cat); }

function compatibleCount(item){
  // approx du "potentiel" : produit du nb d'items dans les autres catégories essentielles
  const others = OUTFIT_CORE.filter(c => c !== item.category).map(byCategory);
  if(others.some(list => list.length === 0)) return 0;
  return others.reduce((acc, list) => acc * Math.max(list.length,1), 1);
}

/* ---------------------------------------------------
   5. ACCUEIL
--------------------------------------------------- */

function renderHome(){
  const s = currentSeason();
  document.getElementById("heroTitle").textContent =
    state.clothes.length === 0
      ? "Un dressing qui te connaît."
      : `Bonne saison pour un ${s.label.toLowerCase()} bien coordonné.`;

  renderRediscover();
}

function renderRediscover(){
  const section = document.getElementById("rediscoverSection");
  const scroller = document.getElementById("rediscoverScroller");
  const forgotten = state.clothes
    .filter(c => daysSince(c.lastWear) >= REDISCOVER_DAYS)
    .sort((a,b)=> daysSince(b.lastWear) - daysSince(a.lastWear))
    .slice(0,8);

  if(forgotten.length === 0){ section.hidden = true; return; }
  section.hidden = false;

  scroller.innerHTML = forgotten.map(c=>{
    const days = c.worn === 0 ? "jamais portée" : `depuis ${daysSince(c.lastWear)} jours`;
    const potential = compatibleCount(c);
    return `
      <div class="rediscover-card">
        ${c.image ? `<img src="${c.image}" alt="${escapeHTML(c.name)}">` : `<div class="rediscover-card-noimg" style="height:150px;display:flex;align-items:center;justify-content:center;background:var(--accent-tint);font-size:28px;">👕</div>`}
        <div class="rc-body">
          <h4>${escapeHTML(c.name)}</h4>
          <p>Non portée ${days}.${potential ? ` Tu pourrais créer ${potential} nouvelle(s) tenue(s) avec.` : ""}</p>
        </div>
      </div>`;
  }).join("");
}

function outfitWhyReasons(){
  const s = currentSeason();
  const reasons = [
    `Palette ${s.label.toLowerCase()} : ${s.emoji} accents en harmonie avec la saison`,
    "Basé sur tes associations favorites",
    "Inclut une pièce peu portée récemment"
  ];
  return reasons;
}

document.getElementById("btnSeeOutfit").addEventListener("click", ()=>{
  const outfit = buildOutfit({});
  renderOutfitInto(document.getElementById("heroOutfit"), outfit, true);
  if(outfit){
    document.getElementById("heroWhy").hidden = false;
    document.getElementById("heroWhy").innerHTML = `
      <h4>Pourquoi cette tenue ?</h4>
      <ul>${outfitWhyReasons().map(r=>`<li>${r}</li>`).join("")}</ul>`;
  }
});

/* ---------------------------------------------------
   6. DRESSING — recherche, filtres, grille
--------------------------------------------------- */

function buildFilterChips(){
  const row = document.getElementById("filterRow");
  const present = [...new Set(state.clothes.map(c=>c.category))];
  const chips = ["all", ...present];
  row.innerHTML = chips.map(cat => `
    <button class="chip ${state.filterCategory===cat ? "is-active":""}" data-cat="${cat}">
      ${cat === "all" ? "Tout" : cat}
    </button>`).join("");

  row.querySelectorAll(".chip").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      state.filterCategory = chip.dataset.cat;
      renderCloset();
    });
  });
}

document.getElementById("searchInput").addEventListener("input", (e)=>{
  state.search = e.target.value.trim().toLowerCase();
  renderCloset();
});

function filteredClothes(){
  return state.clothes.filter(c=>{
    const matchCat = state.filterCategory === "all" || c.category === state.filterCategory;
    const haystack = `${c.name} ${c.brand||""} ${c.color||""} ${c.note||""}`.toLowerCase();
    const matchSearch = !state.search || haystack.includes(state.search);
    return matchCat && matchSearch;
  });
}

function renderCloset(){
  buildFilterChips();
  const grid = document.getElementById("closetGrid");
  const empty = document.getElementById("closetEmpty");
  const list = filteredClothes();

  document.getElementById("dressingCount").textContent =
    `${state.clothes.length} pièce${state.clothes.length>1?"s":""}`;

  if(list.length === 0){
    grid.innerHTML = "";
    empty.hidden = false;
    empty.textContent = state.clothes.length === 0
      ? "Ton dressing est vide pour l'instant. Ajoute ta première pièce ci-dessous."
      : "Aucun vêtement ne correspond à ta recherche.";
    return;
  }
  empty.hidden = true;

  grid.innerHTML = list.map(c=>{
    const selected = state.selected.has(c.id);
    return `
    <div class="item-card ${selected ? "is-selected":""}" data-id="${c.id}">
      <div class="item-thumb">
        ${c.image ? `<img src="${c.image}" alt="${escapeHTML(c.name)}">` : `<div style="height:150px;display:flex;align-items:center;justify-content:center;background:var(--accent-tint);font-size:30px;">👕</div>`}
        ${state.deleteMode ? `<span class="select-dot ${selected?"checked":""}">${selected?"✓":""}</span>` : ""}
      </div>
      <div class="item-body">
        <h3>${escapeHTML(c.name)}</h3>
        <div class="item-tags">
          <span class="tag">${c.category}</span>
          <span class="tag">${c.season}</span>
        </div>
        <p class="item-meta">
          ${c.brand ? escapeHTML(c.brand) + " · " : ""}${c.color ? escapeHTML(c.color) : "Couleur non définie"}<br>
          👕 ${c.worn} port(s) · ${c.worn ? "dernière fois le " + c.lastWear : "jamais portée"}
        </p>
        ${!state.deleteMode ? `
        <div class="item-actions">
          <button class="wear-btn" data-action="wear">Porter</button>
          <button class="primary" data-action="edit">Modifier</button>
        </div>` : ""}
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".item-card").forEach(card=>{
    const id = card.dataset.id;
    if(state.deleteMode){
      card.addEventListener("click", ()=> toggleSelect(id));
    }else{
      card.querySelector('[data-action="wear"]').addEventListener("click", (e)=>{ e.stopPropagation(); wearItem(id); });
      card.querySelector('[data-action="edit"]').addEventListener("click", (e)=>{ e.stopPropagation(); openEdit(id); });
    }
  });
}

function toggleSelect(id){
  if(state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  document.getElementById("selectedCount").textContent = state.selected.size;
  renderCloset();
}

function wearItem(id){
  const item = state.clothes.find(c=>c.id===id);
  if(!item) return;
  item.worn += 1;
  item.lastWear = new Date().toLocaleDateString("fr-FR");
  saveClothes();
  renderCloset();
  toast(`${item.name} portée aujourd'hui 👕`);
}

document.getElementById("btnDeleteMode").addEventListener("click", ()=>{
  state.deleteMode = !state.deleteMode;
  state.selected.clear();
  document.getElementById("deleteActions").hidden = !state.deleteMode;
  document.getElementById("selectedCount").textContent = 0;
  renderCloset();
});

document.getElementById("btnCancelDelete").addEventListener("click", ()=>{
  state.deleteMode = false;
  state.selected.clear();
  document.getElementById("deleteActions").hidden = true;
  renderCloset();
});

document.getElementById("btnDeleteSelected").addEventListener("click", ()=>{
  if(state.selected.size === 0){ toast("Sélectionne au moins un vêtement"); return; }
  if(!confirm(`Supprimer définitivement ${state.selected.size} vêtement(s) ?`)) return;
  state.clothes = state.clothes.filter(c => !state.selected.has(c.id));
  saveClothes();
  state.selected.clear();
  state.deleteMode = false;
  document.getElementById("deleteActions").hidden = true;
  renderCloset();
  toast("Vêtement(s) supprimé(s)");
});

/* ---------------------------------------------------
   7. AJOUT / ÉDITION D'UN VÊTEMENT
--------------------------------------------------- */

const photoInput = document.getElementById("photoInput");
const photoDrop = document.getElementById("photoDrop");
const photoPreview = document.getElementById("photoPreview");
const photoDropLabel = document.getElementById("photoDropLabel");

photoDrop.addEventListener("click", ()=> photoInput.click());
photoInput.addEventListener("change", ()=>{
  const file = photoInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e=>{
    photoPreview.src = e.target.result;
    photoPreview.hidden = false;
    photoDropLabel.hidden = true;
  };
  reader.readAsDataURL(file);
});

document.getElementById("detailsToggle").addEventListener("click", ()=>{
  const extra = document.getElementById("extraFields");
  extra.hidden = !extra.hidden;
});

function resetForm(){
  photoInput.value = "";
  photoPreview.src = "";
  photoPreview.hidden = true;
  photoDropLabel.hidden = false;
  ["nameInput","brandInput","colorInput","materialInput","priceInput","noteInput"].forEach(id=>{
    document.getElementById(id).value = "";
  });
  document.getElementById("categoryInput").selectedIndex = 0;
  document.getElementById("seasonInput").selectedIndex = 0;
  state.editingId = null;
  document.getElementById("btnAddClothing").textContent = "Ajouter au dressing";
}

function openEdit(id){
  const item = state.clothes.find(c=>c.id===id);
  if(!item) return;
  state.editingId = id;
  document.getElementById("nameInput").value = item.name || "";
  document.getElementById("categoryInput").value = item.category;
  document.getElementById("seasonInput").value = item.season;
  document.getElementById("brandInput").value = item.brand || "";
  document.getElementById("colorInput").value = item.color || "";
  document.getElementById("materialInput").value = item.material || "";
  document.getElementById("priceInput").value = item.price || "";
  document.getElementById("noteInput").value = item.note || "";
  if(item.image){
    photoPreview.src = item.image;
    photoPreview.hidden = false;
    photoDropLabel.hidden = true;
  }
  document.getElementById("btnAddClothing").textContent = "Enregistrer les modifications";
  document.querySelector(".add-card").scrollIntoView({behavior:"smooth", block:"start"});
}

document.getElementById("btnAddClothing").addEventListener("click", ()=>{
  const name = document.getElementById("nameInput").value.trim() || "Sans nom";
  const category = document.getElementById("categoryInput").value;
  const season = document.getElementById("seasonInput").value;
  const brand = document.getElementById("brandInput").value.trim();
  const color = document.getElementById("colorInput").value.trim();
  const material = document.getElementById("materialInput").value.trim();
  const price = document.getElementById("priceInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();
  const image = (!photoPreview.hidden && photoPreview.src) ? photoPreview.src : "";

  if(state.editingId){
    const item = state.clothes.find(c=>c.id===state.editingId);
    Object.assign(item, {name, category, season, brand, color, material, price, note});
    if(image) item.image = image;
    saveClothes();
    toast("✏️ Modifications enregistrées");
  }else{
    if(!image){ toast("Ajoute une photo 📸"); return; }
    state.clothes.push({
      id: uid(),
      image, name, category, season, brand, color, material, price, note,
      worn: 0,
      lastWear: null,
      createdAt: new Date().toISOString()
    });
    saveClothes();
    toast("✨ Vêtement ajouté !");
  }
  resetForm();
  renderCloset();
});

/* ---------------------------------------------------
   8. CRÉER — mode switch
--------------------------------------------------- */

const modeInspire = document.getElementById("modeInspire");
const modeCompose = document.getElementById("modeCompose");
const panelInspire = document.getElementById("panelInspire");
const panelCompose = document.getElementById("panelCompose");

modeInspire.addEventListener("click", ()=>{
  modeInspire.classList.add("is-active"); modeCompose.classList.remove("is-active");
  panelInspire.hidden = false; panelCompose.hidden = true;
});
modeCompose.addEventListener("click", ()=>{
  modeCompose.classList.add("is-active"); modeInspire.classList.remove("is-active");
  panelCompose.hidden = false; panelInspire.hidden = true;
  renderShelves();
});

/* ---------- Mode Inspire-moi ---------- */

document.getElementById("btnGenerate").addEventListener("click", ()=>{
  const outfit = buildOutfit({});
  showOutfitResult(outfit);
});

/* ---------- Mode Je compose : étagères verticales ---------- */

function renderShelves(){
  const stack = document.getElementById("shelfStack");
  stack.innerHTML = CATEGORIES.map(cat=>{
    const items = byCategory(cat);
    return `
    <div class="shelf" data-category="${cat}">
      <p class="shelf-label">${cat}</p>
      <div class="shelf-track" data-category-track="${cat}">
        ${items.length === 0
          ? `<div class="shelf-chip is-empty is-focused">Aucune pièce</div>`
          : items.map(it => `
            <div class="shelf-chip" data-id="${it.id}">
              <img src="${it.image}" alt="${escapeHTML(it.name)}">
            </div>`).join("")
        }
      </div>
      <p class="shelf-name" data-name-for="${cat}"></p>
    </div>`;
  }).join("");

  CATEGORIES.forEach(cat=>{
    const track = stack.querySelector(`[data-category-track="${cat}"]`);
    if(!track) return;
    initShelfCarousel(track, cat);
  });
}

function initShelfCarousel(track, category){
  const chips = [...track.querySelectorAll(".shelf-chip:not(.is-empty)")];
  if(chips.length === 0) return;

  function updateFocus(){
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width/2;
    let closest = null, closestDist = Infinity;
    chips.forEach(chip=>{
      const r = chip.getBoundingClientRect();
      const chipCenter = r.left + r.width/2;
      const dist = Math.abs(chipCenter - center);
      chip.classList.toggle("is-focused", false);
      if(dist < closestDist){ closestDist = dist; closest = chip; }
    });
    if(closest){
      closest.classList.add("is-focused");
      const id = closest.dataset.id;
      state.composeSelection[category] = id;
      const item = state.clothes.find(c=>c.id===id);
      const label = document.querySelector(`[data-name-for="${category}"]`);
      if(label && item) label.textContent = item.name;
    }
  }

  let raf = null;
  track.addEventListener("scroll", ()=>{
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateFocus);
  }, {passive:true});

  chips.forEach(chip=>{
    chip.addEventListener("click", ()=>{
      chip.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
    });
  });

  updateFocus();
}

document.getElementById("btnComplete").addEventListener("click", ()=>{
  const chosen = {};
  Object.entries(state.composeSelection).forEach(([cat,id])=>{
    const item = state.clothes.find(c=>c.id===id);
    if(item) chosen[cat] = item;
  });
  if(Object.keys(chosen).length === 0){
    toast("Choisis au moins une pièce sur l'étagère");
    return;
  }
  const outfit = buildOutfit({ mustInclude: Object.values(chosen) });
  showOutfitResult(outfit);
});

/* ---------------------------------------------------
   9. GÉNÉRATION DE TENUE ("IA")
--------------------------------------------------- */

function buildOutfit({ mustInclude = [] }){
  const outfit = [...mustInclude];
  const usedCategories = new Set(outfit.map(i=>i.category));

  for(const cat of OUTFIT_CORE){
    if(usedCategories.has(cat)) continue;
    const pool = byCategory(cat);
    if(pool.length === 0) return null;
    outfit.push(random(pool));
    usedCategories.add(cat);
  }

  // ajoute une veste ou un accessoire si dispo, pour enrichir la tenue (non bloquant)
  ["Veste","Accessoire taille","Accessoire tête"].forEach(cat=>{
    if(usedCategories.has(cat)) return;
    const pool = byCategory(cat);
    if(pool.length && Math.random() > 0.5){
      outfit.push(random(pool));
      usedCategories.add(cat);
    }
  });

  return outfit;
}

function renderOutfitInto(container, outfit, compact){
  if(!outfit){
    container.innerHTML = `<div class="hero-outfit-empty">
      <span class="glyph-row">👕 👖 👟</span>
      <p>Ajoute au moins un haut, un pantalon et une chaussure pour générer une tenue.</p>
    </div>`;
    return;
  }
  container.innerHTML = `<div class="outfit-cards">
    ${outfit.map(c=>`
      <div class="outfit-card">
        <img src="${c.image}" alt="${escapeHTML(c.name)}">
        <div class="oc-body">
          <h4>${escapeHTML(c.name)}</h4>
          <span class="tag">${c.category}</span>
        </div>
      </div>`).join("")}
  </div>`;
}

let lastOutfit = null;

function showOutfitResult(outfit){
  lastOutfit = outfit;
  const section = document.getElementById("outfitResult");
  if(!outfit){
    toast("Ajoute un haut, un pantalon et une chaussure pour générer une tenue 👕👖👟");
    section.hidden = true;
    return;
  }
  section.hidden = false;
  document.getElementById("outfitCards").innerHTML = outfit.map(c=>`
    <div class="outfit-card">
      <img src="${c.image}" alt="${escapeHTML(c.name)}">
      <div class="oc-body">
        <h4>${escapeHTML(c.name)}</h4>
        <span class="tag">${c.category}</span>
      </div>
    </div>`).join("");
  section.scrollIntoView({behavior:"smooth", block:"start"});
}

document.getElementById("btnRegenerate").addEventListener("click", ()=>{
  showOutfitResult(buildOutfit({}));
});

document.getElementById("btnLike").addEventListener("click", ()=>{
  if(!lastOutfit){ toast("Crée d'abord une tenue"); return; }
  state.likedOutfits.push({
    date: new Date().toISOString(),
    items: lastOutfit.map(c=>c.id),
    colors: lastOutfit.map(c=>c.color).filter(Boolean)
  });
  saveLiked();
  toast("❤️ Noté ! Tes goûts sont enregistrés.");
});

/* ---------------------------------------------------
   10. HELPERS
--------------------------------------------------- */

function escapeHTML(str){
  return String(str ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ---------------------------------------------------
   11. INIT
--------------------------------------------------- */

applySeason();
renderHome();
renderCloset();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("sw.js").catch(()=>{ /* offline non critique */ });
  });
}

})();
