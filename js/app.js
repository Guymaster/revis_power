/* =========================================================
   Application : routage, vues, exercices, progression
   ========================================================= */

const store = {
  get(k, def) { try { const v = localStorage.getItem("dwr_" + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem("dwr_" + k, JSON.stringify(v)); } catch (e) {} }
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- Thème & menu ---------- */
(function initTheme() {
  const t = store.get("theme", null);
  if (t) document.documentElement.dataset.theme = t;
  else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
  $("#themeBtn").onclick = () => {
    const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = n; store.set("theme", n);
  };
  $("#menuBtn").onclick = () => $("#sidebar").classList.toggle("open");
})();

/* ---------- Progression ---------- */
const sporteoTotal = () => SPORTEO.reduce((n, p) => n + p.qs.length, 0);
function progress() {
  const mastered = store.get("sp_mastered", {});
  const known = store.get("flash_known", {});
  return {
    sp: Object.values(mastered).filter(Boolean).length,
    spTotal: sporteoTotal(),
    quizBest: store.get("quiz_best", null),
    flash: Object.values(known).filter(Boolean).length,
    flashTotal: FLASH.length,
    cours: Object.values(store.get("cours_read", {})).filter(Boolean).length,
    coursTotal: COURSE.length,
    measBest: store.get("game_measure_best", null),
    scdBest: store.get("game_scd_best", null)
  };
}
const bar = (v, t) => `<div class="bar"><i style="width:${t ? Math.round(100 * v / t) : 0}%"></i></div>`;

/* ---------- Vues ---------- */
const views = {};

views.accueil = () => {
  const p = progress();
  app.innerHTML = `
  <h1>Prépare ton TP de demain</h1>
  <p class="lead">Tout le cours de modélisation décisionnelle, les TP1/TP3 corrigés, le cas SportéO question par question, et Power BI.</p>
  <div class="grid">
    <div class="card"><small>Fiches de cours lues</small><div class="stat">${p.cours}/${p.coursTotal}</div>${bar(p.cours, p.coursTotal)}</div>
    <div class="card"><small>Questions SportéO maîtrisées</small><div class="stat">${p.sp}/${p.spTotal}</div>${bar(p.sp, p.spTotal)}</div>
    <div class="card"><small>Meilleur score quiz</small><div class="stat">${p.quizBest === null ? "—" : p.quizBest + " %"}</div>${bar(p.quizBest || 0, 100)}</div>
    <div class="card"><small>Flashcards sues</small><div class="stat">${p.flash}/${p.flashTotal}</div>${bar(p.flash, p.flashTotal)}</div>
  </div>
  <h2>Parcours conseillé (≈ 3 h)</h2>
  <div class="grid">
    <a class="tile" href="#methode"><b>1 · Méthode Kimball (15 min)</b><small>Les réflexes « mot-clé → réponse » pour le TP.</small></a>
    <a class="tile" href="#cours"><b>2 · Fiches de cours (40 min)</b><small>Faits, dimensions, additivité, SCD, dimension Temps…</small></a>
    <a class="tile" href="#scd"><b>3 · Simulateur SCD (10 min)</b><small>Voir concrètement SCD 1, 2 et 3 sur des ventes.</small></a>
    <a class="tile" href="#tps"><b>4 · TP1 &amp; TP3 (20 min)</b><small>Les corrigés du prof, résumés.</small></a>
    <a class="tile" href="#sporteo"><b>5 · Cas SportéO (45 min)</b><small>Réponds d'abord, puis compare à la correction.</small></a>
    <a class="tile" href="#classer"><b>6 · Exercices (15 min)</b><small>Matrice en bus, additivité, choix du SCD.</small></a>
    <a class="tile" href="#pbi"><b>7 · Power BI + DAX (30 min)</b><small>Power Query, relations, mesures pour chaque besoin.</small></a>
    <a class="tile" href="#quiz"><b>8 · Quiz final (10 min)</b><small>${QUIZ.length} questions avec explications.</small></a>
  </div>
  <div class="callout warn" style="margin-top:20px"><b>À retenir pour la copie :</b> chaque choix doit être <b>justifié</b> par une règle de gestion ou un besoin d'analyse. « Un schéma juste sans argumentation ne rapporte que la moitié des points. »</div>
  <p><button class="btn ghost small" id="resetBtn">Réinitialiser ma progression</button></p>`;
  $("#resetBtn").onclick = () => {
    if (!confirm("Effacer toute la progression enregistrée dans ce navigateur ?")) return;
    ["sp_mastered", "sp_notes", "flash_known", "quiz_best", "cours_read", "game_measure_best", "game_scd_best"].forEach(k => store.set(k, k === "quiz_best" || k.startsWith("game") ? null : {}));
    views.accueil();
  };
};

views.methode = () => {
  app.innerHTML = `<h1>Méthode pour réussir un TP de modélisation</h1><p class="lead">La démarche du cours (Ralph Kimball) appliquée comme une check-list.</p>${METHODE}`;
};

views.cours = () => {
  const read = store.get("cours_read", {});
  app.innerHTML = `<h1>Fiches de cours</h1><p class="lead">Synthèse du support « Ingénierie et exploitation d'entrepôts de données » (chapitres 2, 3, 5, 6, 7, 8). Coche une fiche quand tu la maîtrises.</p>
  ${COURSE.map(c => `<details data-id="${c.id}"><summary>${read[c.id] ? '<span class="done-mark">✓</span>' : ""} ${c.titre}</summary><div class="inner">${c.html}
  <p><label><input type="checkbox" class="readchk" ${read[c.id] ? "checked" : ""}> J'ai compris cette fiche</label></p></div></details>`).join("")}`;
  $$(".readchk").forEach(chk => chk.onchange = e => {
    const id = e.target.closest("details").dataset.id;
    const r = store.get("cours_read", {}); r[id] = e.target.checked; store.set("cours_read", r);
    e.target.closest("details").querySelector("summary").innerHTML = (e.target.checked ? '<span class="done-mark">✓</span> ' : " ") + COURSE.find(c => c.id === id).titre;
  });
};

views.tps = () => {
  app.innerHTML = `<h1>TP1 &amp; TP3 — corrigés résumés</h1><p class="lead">Les deux TP déjà faits en cours : mêmes questions-types que le TP noté.</p>
  ${TPS.map((t, i) => `<details data-id="tp${i}" ${i === 0 ? "open" : ""}><summary>${t.titre}</summary><div class="inner">${t.html}</div></details>`).join("")}
  <div class="callout">Le TP noté SportéO est la synthèse des deux : <b>deux faits</b> (comme TP3), un <b>snapshot</b> de stock (nouveau), des <b>SCD2</b> (TP1/TP3), des <b>membres inconnus</b>, une <b>junk dimension</b> et une <b>dimension dégénérée</b>.</div>`;
};

/* ----- SportéO ----- */
views.sporteo = () => {
  const mastered = store.get("sp_mastered", {});
  const notes = store.get("sp_notes", {});
  let html = `<h1>Cas SportéO — entraînement question par question</h1>
  <p class="lead">Écris ta réponse (sauvegardée automatiquement), puis affiche la correction et compare. Coche « maîtrisé » quand tu saurais la refaire seul.</p>
  <details><summary>Contexte, tables source et besoins</summary><div class="inner">${SPORTEO_CONTEXTE}</div></details>
  <div class="row" style="margin:10px 0"><button class="btn ghost small" id="showAll">Tout afficher</button><button class="btn ghost small" id="hideAll">Tout masquer</button></div>`;
  SPORTEO.forEach((p, pi) => {
    html += `<h2>${p.partie}</h2>`;
    p.qs.forEach((q, qi) => {
      const id = pi + "_" + qi;
      html += `<div class="q" data-id="${id}">
        <div class="q-head"><p>${pi + 1}.${qi + 1} — ${q.q}</p><span class="pts">${q.pts}</span></div>
        <textarea placeholder="Ta réponse…">${esc(notes[id] || "")}</textarea>
        <div class="row"><button class="btn small reveal">Voir la correction</button>
        <label><input type="checkbox" class="master" ${mastered[id] ? "checked" : ""}> maîtrisé</label></div>
        <div class="answer" hidden>${q.a}</div></div>`;
    });
  });
  app.innerHTML = html;
  $$(".q").forEach(el => {
    const id = el.dataset.id, ans = $(".answer", el), btn = $(".reveal", el);
    btn.onclick = () => { ans.hidden = !ans.hidden; btn.textContent = ans.hidden ? "Voir la correction" : "Masquer la correction"; };
    $("textarea", el).oninput = e => { const n = store.get("sp_notes", {}); n[id] = e.target.value; store.set("sp_notes", n); };
    $(".master", el).onchange = e => { const m = store.get("sp_mastered", {}); m[id] = e.target.checked; store.set("sp_mastered", m); };
  });
  $("#showAll").onclick = () => $$(".q").forEach(el => { $(".answer", el).hidden = false; $(".reveal", el).textContent = "Masquer la correction"; });
  $("#hideAll").onclick = () => $$(".q").forEach(el => { $(".answer", el).hidden = true; $(".reveal", el).textContent = "Voir la correction"; });
};

/* ----- Matrice en bus ----- */
const BUS_EX = [
  { titre: "SportéO", procs: ["Ventes", "Stocks"],
    dims: ["Temps", "Heure", "Produit", "Magasin", "Client", "Employé", "Promotion", "Indicateur vente", "Région"],
    sol: { "Ventes": ["Temps", "Produit", "Magasin", "Client", "Employé", "Promotion", "Indicateur vente"], "Stocks": ["Temps", "Produit", "Magasin"] },
    optional: { "Ventes": ["Heure"] },
    note: "« Région » est un piège : elle est un attribut (dénormalisé, SCD2) de DIM_MAGASIN, pas une dimension à part. Heure est facultative pour les ventes. Conformes : Temps, Produit, Magasin." },
  { titre: "TP3 — Compagnie aérienne", procs: ["Billetterie", "Exploitation des vols"],
    dims: ["Date", "Aéroport départ", "Aéroport arrivée", "Avion", "Client", "Tarif", "Canal", "Commandant", "Porte départ"],
    sol: { "Billetterie": ["Date", "Aéroport départ", "Aéroport arrivée", "Avion", "Client", "Tarif", "Canal"], "Exploitation des vols": ["Date", "Aéroport départ", "Aéroport arrivée", "Avion", "Commandant", "Porte départ"] },
    optional: {},
    note: "Conformes : Date, Aéroport départ, Aéroport arrivée (une seule table à rôles multiples), Avion." }
];
views.bus = () => {
  app.innerHTML = `<h1>Matrice en bus</h1><p class="lead">Clique sur les cases pour cocher les dimensions utilisées par chaque processus, puis vérifie.</p>
  ${BUS_EX.map((ex, i) => `<div class="card" data-ex="${i}"><h3>${ex.titre}</h3><div class="table-wrap"><table class="bus">
  <tr><th>Processus</th>${ex.dims.map(d => `<th>${d}</th>`).join("")}</tr>
  ${ex.procs.map(p => `<tr><td><b>${p}</b></td>${ex.dims.map(d => `<td class="cell" data-p="${p}" data-d="${d}"></td>`).join("")}</tr>`).join("")}
  </table></div><div class="row"><button class="btn small check">Vérifier</button><button class="btn ghost small reset">Effacer</button></div><div class="fb"></div></div>`).join("")}`;
  $$(".card[data-ex]").forEach(card => {
    const ex = BUS_EX[card.dataset.ex];
    $$(".cell", card).forEach(c => c.onclick = () => { c.classList.toggle("on"); c.classList.remove("okc", "koc"); c.textContent = c.classList.contains("on") ? "✔" : ""; });
    $(".reset", card).onclick = () => { $$(".cell", card).forEach(c => { c.className = "cell"; c.textContent = ""; }); $(".fb", card).innerHTML = ""; };
    $(".check", card).onclick = () => {
      let err = 0;
      $$(".cell", card).forEach(c => {
        const exp = ex.sol[c.dataset.p].includes(c.dataset.d), opt = (ex.optional[c.dataset.p] || []).includes(c.dataset.d), on = c.classList.contains("on");
        c.classList.remove("okc", "koc");
        if (opt) { if (on) c.classList.add("okc"); return; }
        if (exp === on) { if (on) c.classList.add("okc"); }
        else { c.classList.add("koc"); c.textContent = exp ? "✔ ?" : "✘"; err++; }
      });
      $(".fb", card).innerHTML = `<div class="callout ${err ? "bad" : "ok"}">${err ? err + " erreur(s) (cases en rouge)." : "Parfait !"} ${ex.note}</div>`;
    };
  });
};

/* ----- Jeux de classement ----- */
function classGame({ root, items, options, key, bestKey, label }) {
  let order = shuffle(items), i = 0, score = 0;
  const render = () => {
    if (i >= order.length) {
      const pct = Math.round(100 * score / order.length);
      if (pct > (store.get(bestKey, null) || 0)) store.set(bestKey, pct);
      root.innerHTML = `<div class="callout ok"><b>Score : ${score}/${order.length} (${pct} %)</b></div><button class="btn small again">Recommencer</button>`;
      $(".again", root).onclick = () => { order = shuffle(items); i = 0; score = 0; render(); };
      return;
    }
    const it = order[i];
    root.innerHTML = `<p class="tag">${i + 1}/${order.length} · score ${score}</p>
      <p style="font-size:17px;margin:6px 0"><b>${label(it)}</b></p><p class="lead">${it.ctx}</p>
      <div class="opt-row">${options.map(o => `<button class="btn ghost small opt" data-v="${o.v}">${o.l}</button>`).join("")}</div><div class="fb"></div>`;
    $$(".opt", root).forEach(b => b.onclick = () => {
      const good = b.dataset.v === it[key];
      if (good) score++;
      $$(".opt", root).forEach(x => { x.disabled = true; if (x.dataset.v === it[key]) x.style.outline = "2px solid var(--ok)"; });
      if (!good) b.style.outline = "2px solid var(--bad)";
      $(".fb", root).innerHTML = `<div class="callout ${good ? "ok" : "bad"}">${good ? "Correct." : "Non."} ${it.e}</div><button class="btn small next">Suivant →</button>`;
      $(".next", root).onclick = () => { i++; render(); };
    });
  };
  render();
}
views.classer = () => {
  app.innerHTML = `<h1>Additivité &amp; choix du SCD</h1><p class="lead">Deux mini-jeux pour automatiser les réflexes demandés dans chaque TP.</p>
  <div class="card"><h3>1 · Classe la mesure</h3><div id="g1"></div></div>
  <div class="card"><h3>2 · Choisis le type de SCD</h3><div id="g2"></div></div>`;
  classGame({ root: $("#g1"), items: MEASURE_GAME, key: "a", bestKey: "game_measure_best", label: it => it.m,
    options: [{ v: "additive", l: "Additive" }, { v: "semi", l: "Semi-additive" }, { v: "non", l: "Non additive" }] });
  classGame({ root: $("#g2"), items: SCD_GAME, key: "a", bestKey: "game_scd_best", label: it => it.attr,
    options: [{ v: "0", l: "Type 0" }, { v: "1", l: "Type 1" }, { v: "2", l: "Type 2" }, { v: "3", l: "Type 3" }] });
};

/* ----- Quiz ----- */
views.quiz = () => {
  let qs = shuffle(QUIZ).slice(0, 15), i = 0, score = 0;
  const render = () => {
    if (i >= qs.length) {
      const pct = Math.round(100 * score / qs.length);
      if (pct > (store.get("quiz_best", null) || 0)) store.set("quiz_best", pct);
      app.innerHTML = `<h1>Quiz terminé</h1><div class="card"><div class="stat">${score}/${qs.length} — ${pct} %</div>${bar(score, qs.length)}
      <p>${pct >= 80 ? "Très bien, tu es prêt." : pct >= 60 ? "Correct : relis les fiches sur les points ratés." : "Repasse par les fiches de cours et la méthode."}</p>
      <div class="row"><button class="btn" id="again">Nouveau quiz (15 questions)</button><button class="btn ghost" id="all">Quiz complet (${QUIZ.length})</button></div></div>`;
      $("#again").onclick = views.quiz;
      $("#all").onclick = () => { qs = shuffle(QUIZ); i = 0; score = 0; render(); };
      return;
    }
    const q = qs[i];
    const order = shuffle(q.c.map((t, k) => ({ t, k })));
    app.innerHTML = `<h1>Quiz</h1><p class="tag">Question ${i + 1}/${qs.length} · score ${score}</p>${bar(i, qs.length)}
      <div class="card"><p style="font-size:17px"><b>${q.q}</b></p>
      ${order.map(o => `<button class="choice" data-k="${o.k}">${o.t}</button>`).join("")}<div id="fb"></div></div>`;
    $$(".choice").forEach(b => b.onclick = () => {
      const good = +b.dataset.k === q.a;
      if (good) score++;
      $$(".choice").forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add("good"); });
      if (!good) b.classList.add("wrong");
      $("#fb").innerHTML = `<div class="callout ${good ? "ok" : "bad"}">${q.e}</div><button class="btn" id="nx">${i + 1 < qs.length ? "Suivante →" : "Voir le score"}</button>`;
      $("#nx").onclick = () => { i++; render(); };
    });
  };
  render();
};

/* ----- Flashcards ----- */
views.flash = () => {
  let onlyUnknown = false, deck, i;
  const build = () => {
    const known = store.get("flash_known", {});
    deck = shuffle(FLASH.map((f, k) => ({ f, k })).filter(x => !onlyUnknown || !known[x.k]));
    i = 0;
  };
  const render = () => {
    const known = store.get("flash_known", {});
    const n = Object.values(known).filter(Boolean).length;
    if (!deck.length) {
      app.innerHTML = `<h1>Flashcards</h1><div class="callout ok">Toutes les cartes sont sues ! </div><button class="btn" id="restart">Tout revoir</button>`;
      $("#restart").onclick = () => { onlyUnknown = false; build(); render(); };
      return;
    }
    const c = deck[i % deck.length];
    app.innerHTML = `<h1>Flashcards</h1><p class="lead">Clique la carte pour la retourner. ${n}/${FLASH.length} sues.</p>
      <div class="row"><label><input type="checkbox" id="onlyU" ${onlyUnknown ? "checked" : ""}> Seulement les cartes à revoir</label><span class="tag">${(i % deck.length) + 1}/${deck.length}</span></div>
      <div class="flash" id="card"><div class="flash-inner"><div class="face"><b>${c.f[0]}</b></div><div class="face back">${c.f[1]}</div></div></div>
      <div class="row"><button class="btn ghost" id="no">À revoir</button><button class="btn" id="yes">Je savais ✓</button></div>`;
    $("#card").onclick = () => $("#card").classList.toggle("flipped");
    const mark = v => { const k = store.get("flash_known", {}); k[c.k] = v; store.set("flash_known", k); i++; if (onlyUnknown && v) { build(); } render(); };
    $("#yes").onclick = () => mark(true);
    $("#no").onclick = () => mark(false);
    $("#onlyU").onchange = e => { onlyUnknown = e.target.checked; build(); render(); };
  };
  build(); render();
};

/* ----- Simulateur SCD ----- */
views.scd = () => {
  const init = () => ({
    type: state ? state.type : "2", nextSk: 3, log: [],
    dim: [
      { sk: 1, id: "C-123", nom: "Dupont", ville: "Paris", villePrec: "", segment: "Silver", segPrec: "", debut: "2023-01-01", fin: "9999-12-31", actif: 1, cls: "" },
      { sk: 2, id: "C-456", nom: "Martin", ville: "Lyon", villePrec: "", segment: "Standard", segPrec: "", debut: "2023-01-01", fin: "9999-12-31", actif: 1, cls: "" }],
    ventes: [
      { date: "2025-03-10", sk: 1, montant: 120 }, { date: "2025-06-02", sk: 1, montant: 80 },
      { date: "2025-05-15", sk: 2, montant: 60 }]
  });
  let state = null; state = init();

  const render = () => {
    const t = state.type;
    const cols = t === "3"
      ? ["sk", "id", "nom", "ville", "ville_precedente", "segment", "segment_precedent"]
      : t === "2" ? ["sk", "id", "nom", "ville", "segment", "debut", "fin", "est_actif"] : ["sk", "id", "nom", "ville", "segment"];
    const cell = (r, c) => ({ sk: r.sk, id: r.id, nom: r.nom, ville: r.ville, segment: r.segment, segment_precedent: r.segPrec || "—", ville_precedente: r.villePrec || "—", debut: r.debut, fin: r.fin, est_actif: r.actif }[c]);
    const bySeg = {};
    state.ventes.forEach(v => { const d = state.dim.find(r => r.sk === v.sk); bySeg[d.segment] = (bySeg[d.segment] || 0) + v.montant; });
    app.innerHTML = `<h1>Simulateur SCD</h1>
    <p class="lead">Change le segment ou la ville d'un client, puis ajoute des ventes : observe la dimension et le rapport « CA par segment ».</p>
    <div class="card sim-ctrl">
      <label>Type de SCD <select id="type"><option value="1">Type 1 — écrasement</option><option value="2">Type 2 — nouvelle ligne</option><option value="3">Type 3 — colonne précédente</option></select></label>
      <button class="btn ghost small" id="reset">Réinitialiser</button>
    </div>
    <div class="card">
      <h3>1 · Un changement arrive de la source</h3>
      <div class="sim-ctrl">
        <select id="cli"><option value="C-123">C-123 Dupont</option><option value="C-456">C-456 Martin</option></select>
        <select id="attr"><option value="segment">segment</option><option value="ville">ville</option></select>
        <input type="text" id="val" value="Gold" size="10">
        <label>le <input type="text" id="dt" value="2025-07-01" size="10"></label>
        <button class="btn small" id="apply">Appliquer (ETL)</button>
      </div>
      <h3>2 · Une nouvelle vente arrive</h3>
      <div class="sim-ctrl">
        <select id="vcli"><option value="C-123">C-123 Dupont</option><option value="C-456">C-456 Martin</option></select>
        <label>date <input type="text" id="vdt" value="2025-09-12" size="10"></label>
        <label>montant <input type="text" id="vm" value="200" size="5"></label>
        <button class="btn small" id="sale">Charger la vente</button>
      </div>
    </div>
    <h3>DIM_CLIENT</h3>
    <div class="table-wrap"><table class="sim-table"><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr>
    ${state.dim.map(r => `<tr class="${r.cls} ${t === "2" && !r.actif ? "closed" : ""}">${cols.map(c => `<td>${esc(cell(r, c))}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div><h3>FAIT_VENTES</h3><table><tr><th>date</th><th>sk_client</th><th>montant</th></tr>
      ${state.ventes.map(v => `<tr><td>${v.date}</td><td>${v.sk}</td><td>${v.montant} €</td></tr>`).join("")}</table></div>
      <div><h3>Rapport : CA par segment</h3><table><tr><th>segment</th><th>CA</th></tr>
      ${Object.entries(bySeg).map(([s, m]) => `<tr><td>${s}</td><td>${m} €</td></tr>`).join("")}</table></div>
    </div>
    <div id="log">${state.log.map(l => `<div class="callout">${l}</div>`).join("")}</div>`;
    $("#type").value = t;
    $("#type").onchange = e => { state.type = e.target.value; state = init(); render(); };
    $("#reset").onclick = () => { state = init(); render(); };
    $("#apply").onclick = applyChange;
    $("#sale").onclick = addSale;
  };

  function applyChange() {
    const id = $("#cli").value, attr = $("#attr").value, val = $("#val").value.trim(), dt = $("#dt").value.trim();
    if (!val) return;
    state.dim.forEach(r => r.cls = "");
    const cur = state.dim.find(r => r.id === id && r.actif === 1);
    if (cur[attr] === val) { state.log.unshift("Aucun changement : la valeur est identique."); return render(); }
    if (state.type === "1") {
      const old = cur[attr]; cur[attr] = val; cur.cls = "updated";
      state.log.unshift(`<b>Type 1</b> : UPDATE de la ligne sk ${cur.sk} (${old} → ${val}). L'ancienne valeur est perdue : <b>toutes les ventes passées</b> de ${cur.nom} apparaissent maintenant en « ${val} ». L'histoire est réécrite.`);
    } else if (state.type === "2") {
      const d = new Date(dt); d.setDate(d.getDate() - 1);
      cur.fin = isNaN(d) ? dt : d.toISOString().slice(0, 10); cur.actif = 0;
      const n = Object.assign({}, cur, { sk: state.nextSk++, debut: dt, fin: "9999-12-31", actif: 1, cls: "newrow" });
      n[attr] = val;
      state.dim.push(n);
      state.log.unshift(`<b>Type 2</b> : la ligne sk ${cur.sk} est <b>fermée</b> (fin = ${cur.fin}, est_actif = 0) et une <b>nouvelle version</b> sk ${n.sk} est insérée (${attr} = ${val}, début = ${dt}). Les ventes passées restent liées à sk ${cur.sk} : leur ${attr} d'origine est conservé. Ajoute une vente pour voir qu'elle prend sk ${n.sk}.`);
    } else {
      if (attr === "segment") { cur.segPrec = cur.segment; cur.segment = val; }
      else { cur.villePrec = cur.ville; cur.ville = val; }
      cur.cls = "updated";
      state.log.unshift(`<b>Type 3</b> : l'ancienne valeur passe dans la colonne « précédent », la nouvelle dans la colonne actuelle. Une seule ligne, on ne garde que les 2 dernières valeurs. Les ventes passées sont affichées avec la valeur <b>actuelle</b> dans le rapport, mais on peut comparer avec la précédente.`);
    }
    render();
  }
  function addSale() {
    const id = $("#vcli").value, dt = $("#vdt").value.trim(), m = parseFloat($("#vm").value) || 0;
    state.dim.forEach(r => r.cls = "");
    let row;
    if (state.type === "2") row = state.dim.find(r => r.id === id && dt >= r.debut && dt <= r.fin) || state.dim.find(r => r.id === id && r.actif);
    else row = state.dim.find(r => r.id === id);
    state.ventes.push({ date: dt, sk: row.sk, montant: m });
    state.log.unshift(`Lookup ETL : id_client ${id} ${state.type === "2" ? `et ${dt} BETWEEN debut AND fin` : ""} → <b>sk ${row.sk}</b> (segment ${row.segment}).`);
    render();
  }
  render();
};

views.pbi = () => { app.innerHTML = `<h1>Power BI pas à pas</h1><p class="lead">Du modèle en étoile au rapport : ce qu'on attend de toi en TP Power BI.</p>${PBI}`; };

views.dax = () => {
  app.innerHTML = `<h1>DAX — une mesure par besoin SportéO</h1>${DAX_INTRO}
  ${DAX.map((d, k) => `<details data-id="dax${k}"><summary><span class="tag">${d.b}</span> ${d.t}</summary><div class="inner"><pre><code>${esc(d.c)}</code></pre><p>${d.e}</p><button class="btn ghost small copy">Copier</button></div></details>`).join("")}`;
  $$(".copy").forEach((b, k) => b.onclick = () => {
    const done = () => { b.textContent = "Copié ✓"; setTimeout(() => b.textContent = "Copier", 1200); };
    try { navigator.clipboard.writeText(DAX[k].c).then(done, () => {}); } catch (e) {}
  });
};

views.sql = () => { app.innerHTML = `<h1>SQL de l'entrepôt (partie 7)</h1><p class="lead">CREATE TABLE avec SCD2, requêtes des besoins, et les pièges à éviter.</p>${SQL}`; };

/* ---------- Recherche ---------- */
// minuscules sans accents, caractère par caractère pour garder les positions alignées
const norm = s => [...String(s)].map(c => c.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0) || c).join("").toLowerCase();
const strip = html => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); };

// coupe une page HTML en sections selon ses <h2>
const splitH2 = (html, route, section) => html.split(/(?=<h2>)/).map(part => {
  const m = part.match(/<h2>(.*?)<\/h2>/);
  const title = m ? strip(m[1]) : section;
  return { route, section, title, text: strip(part), h2: m ? title : null };
});

let searchIndex = null;
function buildIndex() {
  const idx = [];
  COURSE.forEach(c => idx.push({ route: "cours", section: "Fiche de cours", title: c.titre, text: strip(c.html), target: c.id }));
  idx.push(...splitH2(METHODE, "methode", "Méthode Kimball").map(e => Object.assign(e, { title: e.h2 || "Méthode pour réussir un TP" })));
  TPS.forEach((t, i) => idx.push({ route: "tps", section: "TP corrigé", title: t.titre, text: strip(t.html), target: "tp" + i }));
  idx.push({ route: "sporteo", section: "SportéO", title: "Contexte, tables source et besoins", text: strip(SPORTEO_CONTEXTE) });
  SPORTEO.forEach((p, pi) => p.qs.forEach((q, qi) => idx.push({ route: "sporteo", section: "SportéO · " + p.partie.split(" (")[0], title: `${pi + 1}.${qi + 1} — ${q.q}`, text: strip(q.q + " " + q.a), target: pi + "_" + qi })));
  idx.push(...splitH2(PBI, "pbi", "Power BI"));
  idx.push({ route: "dax", section: "DAX", title: "Les fonctions DAX à connaître", text: strip(DAX_INTRO) });
  DAX.forEach((d, k) => idx.push({ route: "dax", section: "DAX · " + d.b, title: d.t, text: d.t + " " + d.c + " " + d.e, target: "dax" + k }));
  idx.push(...splitH2(SQL, "sql", "SQL"));
  QUIZ.forEach(q => idx.push({ route: null, section: "Quiz", title: q.q, text: q.q + " " + q.c[q.a] + " " + q.e, full: `<b>Réponse :</b> ${esc(q.c[q.a])} — ${esc(q.e)}` }));
  FLASH.forEach(f => idx.push({ route: null, section: "Flashcard", title: f[0], text: f[0] + " " + f[1], full: esc(f[1]) }));
  MEASURE_GAME.forEach(m => idx.push({ route: null, section: "Additivité", title: m.m + " (" + m.ctx + ")", text: m.m + " " + m.ctx + " " + m.e, full: `<b>${{ additive: "Additive", semi: "Semi-additive", non: "Non additive" }[m.a]}</b> — ${esc(m.e)}` }));
  SCD_GAME.forEach(s => idx.push({ route: null, section: "Choix du SCD", title: s.attr, text: s.attr + " " + s.ctx + " " + s.e, full: `<b>SCD type ${s.a}</b> — ${esc(s.ctx)}. ${esc(s.e)}` }));
  idx.forEach(e => { e.nTitle = norm(e.title); e.nText = norm(e.text); });
  return idx;
}

// extrait autour de la première occurrence, terme surligné
function snippet(text, nq) {
  const pos = norm(text).indexOf(nq);
  if (pos < 0) return esc(text.slice(0, 160)) + (text.length > 160 ? "…" : "");
  const a = Math.max(0, pos - 70), b = Math.min(text.length, pos + nq.length + 110);
  return (a > 0 ? "…" : "") + esc(text.slice(a, pos)) + "<mark>" + esc(text.slice(pos, pos + nq.length)) + "</mark>" + esc(text.slice(pos + nq.length, b)) + (b < text.length ? "…" : "");
}

let pendingHL = null;
function renderSearch(q) {
  searchIndex = searchIndex || buildIndex();
  const nq = norm(q.trim());
  $$(".sidebar a").forEach(a => a.classList.remove("active"));
  const hits = searchIndex
    .map(e => ({ e, score: (e.nTitle.includes(nq) ? 10 : 0) + e.nText.split(nq).length - 1 }))
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score);
  app.innerHTML = `<h1>Recherche : « ${esc(q.trim())} »</h1>
    <p class="lead">${hits.length ? hits.length + " résultat(s)" : "Aucun résultat. Essaie un autre mot (les accents sont ignorés)."} · Échap pour fermer</p>
    ${hits.slice(0, 60).map((h, i) => `<div class="res">
      <div class="res-head"><span><span class="tag">${esc(h.e.section)}</span> <b>${snippetTitle(h.e.title, nq)}</b></span>
      ${h.e.route ? `<button class="btn small open" data-i="${i}">Ouvrir →</button>` : ""}</div>
      <p class="${h.e.full ? "full" : ""}">${h.e.full ? h.e.full : snippet(h.e.text, nq)}</p></div>`).join("")}`;
  $$(".open", app).forEach(b => b.onclick = () => {
    const e = hits[+b.dataset.i].e;
    pendingHL = { term: nq, target: e.target, h2: e.h2 };
    if (location.hash === "#" + e.route) route(); else location.hash = e.route;
  });
}
const snippetTitle = (t, nq) => { const p = norm(t).indexOf(nq); return p < 0 ? esc(t) : esc(t.slice(0, p)) + "<mark>" + esc(t.slice(p, p + nq.length)) + "</mark>" + esc(t.slice(p + nq.length)); };

// surligne le terme dans la page ouverte, déplie les blocs concernés, défile jusqu'à la cible
function highlightInPage({ term, target, h2 }) {
  const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest("textarea,script,style,mark") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const marks = [];
  nodes.forEach(node => {
    let n = node;
    while (n && marks.length < 300) {
      const p = norm(n.nodeValue).indexOf(term);
      if (p < 0) break;
      const hit = n.splitText(p); const rest = hit.splitText(term.length);
      const m = document.createElement("mark"); hit.parentNode.replaceChild(m, hit); m.appendChild(hit);
      marks.push(m); n = rest;
    }
  });
  marks.forEach(m => {
    for (let d = m.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
    const ans = m.closest(".answer");
    if (ans && ans.hidden) { ans.hidden = false; const b = $(".reveal", ans.closest(".q")); if (b) b.textContent = "Masquer la correction"; }
  });
  let first = marks[0];
  if (target) {
    const el = app.querySelector(`[data-id="${CSS.escape(target)}"]`);
    if (el) { if (el.tagName === "DETAILS") el.open = true; const a = el.querySelector(".answer"); if (a && a.hidden) { a.hidden = false; $(".reveal", el).textContent = "Masquer la correction"; } first = el.querySelector("mark") || el; }
  } else if (h2) {
    const h = $$("h2", app).find(x => x.textContent.trim() === h2);
    if (h) first = marks.find(m => h.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING) || h;
  }
  if (first) { if (first.tagName === "MARK") first.classList.add("current"); first.scrollIntoView({ block: "center" }); }
}

(function initSearch() {
  const input = $("#searchInput");
  let lastRoute = "accueil", timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (input.value.trim().length >= 2) renderSearch(input.value);
      else if (!input.value.trim()) { location.hash === "#" + lastRoute ? route() : (location.hash = lastRoute); }
    }, 120);
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { const b = $(".open", app); if (b) b.click(); }
    if (e.key === "Escape") { input.value = ""; input.blur(); route(); }
  });
  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); input.focus(); input.select(); }
  });
  window.addEventListener("hashchange", () => { lastRoute = (location.hash || "#accueil").slice(1); });
  // un clic dans le menu ferme la recherche, même si la page visée est déjà dans l'URL
  $$(".sidebar a").forEach(a => a.addEventListener("click", () => {
    input.value = "";
    if (location.hash === a.getAttribute("href")) route();
  }));
})();

/* ---------- Routeur ---------- */
function route() {
  const r = (location.hash || "#accueil").slice(1);
  const v = views[r] ? r : "accueil";
  $$(".sidebar a").forEach(a => a.classList.toggle("active", a.dataset.route === v));
  $("#sidebar").classList.remove("open");
  views[v]();
  window.scrollTo(0, 0);
  if (pendingHL) { const h = pendingHL; pendingHL = null; setTimeout(() => highlightInPage(h), 0); }
}
window.addEventListener("hashchange", route);
route();
