/* =========================================================
   Contenu de révision — cours IEED (S. Leblic), TP1, TP3, sujet SportéO
   ========================================================= */

/* ---------- Fiches de cours ---------- */
const COURSE = [
{
id: "bases", titre: "OLTP vs décisionnel, Data Warehouse (Inmon)", html: `
<p><b>Système transactionnel (OLTP)</b> : gestion courante, modèle Entité/Relation <b>normalisé</b> (3FN), données <b>actuelles et brutes</b>, mises à jour fréquentes en temps réel, opérations lecture/mise à jour/suppression, volume en Go.</p>
<p><b>Système décisionnel</b> : analyse et aide à la décision, modèle <b>étoile / flocon</b>, données <b>dénormalisées, historisées, agrégées, calculées</b>, mise à jour différée (batch), lecture et analyse croisée, volume en To.</p>
<div class="callout"><b>Définition (Inmon)</b> — un Data Warehouse est une collection de données :
<ul><li><b>Orientée sujet</b> : organisée par thème métier (client, produit, vente)</li>
<li><b>Intégrée</b> : consolidée et rendue cohérente à partir de sources hétérogènes</li>
<li><b>Non volatile</b> : les données chargées ne sont ni modifiées ni supprimées (pas de correction dans le DWH !)</li>
<li><b>Historisée</b> : conserve l'historique pour analyser les tendances</li></ul></div>
<h3>Pourquoi ne pas requêter l'OLTP directement ?</h3>
<ul><li>L'OLTP ne garde que l'<b>état courant</b> : adresse, prix, région… sont <b>écrasés</b> → impossible d'analyser « tel que c'était au moment de… ».</li>
<li>Les requêtes analytiques lourdes (millions de lignes, nombreuses jointures) <b>ralentissent la production</b>.</li>
<li>Modèle normalisé = beaucoup de jointures, peu lisible pour un métier.</li>
<li>Pas de calendrier enrichi (fériés, vacances, N-1…), pas de consolidation multi-sources.</li></ul>`
},
{
id: "archi", titre: "Architecture d'un SID : ODS, DWH, Datamarts, ETL", html: `
<p><b>SI opérationnel</b> (ERP, CRM, RH…) → <b>ETL</b> → <b>ODS</b> → <b>Data Warehouse</b> → <b>Datamarts</b> → <b>Restitution</b> (rapports, dashboards, Power BI).</p>
<table><tr><th>Brique</th><th>Rôle</th></tr>
<tr><td>ODS (Operational Data Store)</td><td>Sas tampon d'intégration et de validation, copie des données opérationnelles, incrémental. Le DWH est en général chargé la nuit, en batch, depuis l'ODS. Peut servir au reporting opérationnel quotidien.</td></tr>
<tr><td>Data Warehouse</td><td>Base historisée et nettoyée, consolide les sources, conserve le détail. Non accessible en écriture directe.</td></tr>
<tr><td>Datamart</td><td>Sous-ensemble du DWH orienté un domaine métier (Ventes, RH, Finance…), avec agrégats pré-calculés. Plusieurs datamarts pour un DWH.</td></tr>
<tr><td>Métadonnées</td><td>Métier, techniques, opérationnelles, administratives. Analyse d'impact (source → restitution) et data lineage (restitution → source).</td></tr></table>
<h3>ETL vs ELT vs ESB</h3>
<ul><li><b>ETL</b> (Extract-Transform-Load) : transformation <b>avant</b> chargement, sur un serveur ETL dédié, batch planifié. Ex. Talend, Informatica, SSIS, ODI.</li>
<li><b>ELT</b> : on charge brut puis on transforme <b>dans la cible</b> (puissance du moteur, Cloud : Snowflake, BigQuery, Databricks).</li>
<li><b>ESB</b> : bus de messages temps réel (push) entre applications. Complémentaire de l'ETL (pull, gros volumes).</li></ul>
<h3>Détecter les changements (CDC)</h3>
<ol><li>Publication par les applications sources</li><li><b>Change Data Capture</b> (lecture des journaux de la base : GoldenGate, SQL Server CDC, Debezium)</li><li>Dates de modification (timestamp) — ex. <code>date_maj</code></li></ol>
<h3>Lakehouse & médaillon</h3>
<p>Data Lake = stockage brut (schéma à la lecture). <b>Lakehouse</b> = fiabilité du DWH + flexibilité du lake (Databricks, Fabric). Couches : <b>Bronze</b> (brut, tel que la source) → <b>Argent</b> (nettoyé, standardisé) → <b>Or</b> (logique métier, faits & dimensions).</p>`
},
{
id: "faits", titre: "Faits, dimensions, QQOQCCP", html: `
<p><b>Dimension</b> = axe d'analyse (le contexte : qui, quoi, où, quand, comment, pourquoi). <b>Fait</b> = ce qu'on mesure (le <b>combien</b>).</p>
<h3>Table de faits</h3>
<ul><li>Contient des <b>mesures numériques</b> + des <b>clés étrangères</b> vers les dimensions (la combinaison forme souvent la PK composite).</li>
<li>Définie par sa <b>granularité</b> : ce que représente exactement UNE ligne.</li>
<li>Règle d'or : <b>grain le plus fin possible</b> (on peut toujours agréger, jamais redescendre).</li>
<li><b>Unicité du grain</b> : ne jamais mélanger deux niveaux de détail (ex. tickets + objectifs mensuels).</li>
<li>Uniquement des <b>clés de substitution</b> (surrogate keys), jamais les ID sources.</li>
<li><b>Jamais de NULL dans les FK</b> → la ligne disparaîtrait des jointures. On pointe vers une ligne par défaut (« Non renseigné », sk = -1).</li>
<li><b>Pas de texte</b> (sauf dimension dégénérée).</li></ul>
<h3>Table de dimension</h3>
<ul><li>Descriptive, riche en texte, « courte et large » (peu de lignes, beaucoup de colonnes).</li>
<li><b>Dénormalisée</b> : la hiérarchie est aplatie (Ville, Département, Région sur la même ligne).</li>
<li>PK = <b>clé de substitution</b> générée par le DWH ; la clé naturelle (ID source) est gardée en attribut.</li>
<li>Gère son historique (<b>SCD</b>), garantit la qualité (standardisation « H/M » → « Masculin »), contient une <b>ligne par défaut</b>.</li></ul>`
},
{
id: "mesures", titre: "Additivité des mesures", html: `
<table><tr><th>Type</th><th>Définition</th><th>Exemples</th></tr>
<tr><td><b>Additive</b></td><td>Sommable sur <b>tous</b> les axes</td><td>CA, quantité vendue, marge en €, montant remise, nb de lignes (=1), flag 0/1</td></tr>
<tr><td><b>Semi-additive</b></td><td>Sommable sur certains axes, <b>pas sur le temps</b> (niveau / photo)</td><td>Quantité en stock, solde de compte, effectif, capacité d'un avion répétée à chaque vol</td></tr>
<tr><td><b>Non additive</b></td><td>Jamais sommée : on la <b>recalcule</b></td><td>Ratios, %, taux de marge, taux de remise, prix unitaire, taux de remplissage</td></tr></table>
<div class="callout warn"><b>Piège classique :</b> stock de 100 unités chaque jour de mars → SUM sur le mois = 3 100 : absurde. Sur le temps on prend la <b>moyenne</b> ou la <b>dernière valeur</b> (fin de période).</div>
<div class="callout">Les ratios : on stocke le numérateur et le dénominateur (additifs) et on calcule le ratio <b>à la volée</b> dans le rapport : taux de marge = SUM(marge) / SUM(CA HT).</div>`
},
{
id: "types-faits", titre: "Types de tables de faits", html: `
<table><tr><th>Type</th><th>Une ligne =</th><th>Exemple</th></tr>
<tr><td><b>Transaction</b></td><td>un événement, à l'instant où il se produit</td><td>une ligne de ticket de caisse, un mouvement de stock</td></tr>
<tr><td><b>Instantané périodique</b> (periodic snapshot)</td><td>une photo de l'état à intervalle régulier</td><td>stock d'un produit dans un magasin en fin de journée, solde mensuel</td></tr>
<tr><td><b>Instantané cumulatif</b> (accumulating snapshot)</td><td>un processus à jalons, la ligne est mise à jour à chaque étape</td><td>commande : date commande, date expédition, date livraison (plusieurs FK date)</td></tr>
<tr><td><b>Sans fait</b> (factless)</td><td>seulement des FK, on mesure par COUNT</td><td>présence d'un étudiant à un cours, produits éligibles à une promo, disponibilité des salles</td></tr></table>
<p>Factless : <b>table d'événements</b> (ce qui s'est passé) ou <b>table de couverture</b> (ce qui aurait pu se passer).</p>`
},
{
id: "schemas", titre: "Étoile, flocon, constellation", html: `
<table><tr><th>Modèle</th><th>Principe</th><th>+</th><th>−</th></tr>
<tr><td><b>Étoile</b></td><td>Dimensions reliées directement au fait, pas de lien entre dimensions</td><td>Navigation simple, peu de jointures → performance, gestion des agrégats</td><td>Redondance dans les dimensions, alimentation plus complexe</td></tr>
<tr><td><b>Flocon</b></td><td>Les dimensions sont normalisées en sous-tables pour modéliser la hiérarchie</td><td>Réduit le volume, drill down/up par palier</td><td>Plus de jointures, moins lisible. <b>À ne faire que pour des tables volumineuses</b></td></tr>
<tr><td><b>Constellation</b> (galaxie)</td><td>Plusieurs tables de faits partageant des dimensions</td><td>Mutualisation, analyses transverses (drill-across)</td><td>Complexité ; risque d'incohérence si les dimensions ne sont pas vraiment conformes</td></tr></table>`
},
{
id: "dimspe", titre: "Dimensions particulières (conforme, rôle, dégénérée, fourre-tout, pont)", html: `
<h3>Dimension conforme</h3><p>Strictement identique (structure, clés, libellés) et partagée par plusieurs tables de faits / processus. Permet le <b>drill-across</b> (croiser ventes et stocks). « Le Saint Graal du DWH d'entreprise ».</p>
<h3>Dimension à rôles multiples (role-playing)</h3><p>Une seule table physique utilisée plusieurs fois par un même fait via plusieurs FK : date de commande / d'expédition / de livraison ; aéroport de départ / d'arrivée. On crée des <b>vues/alias</b>, pas des copies.</p>
<h3>Dimension dégénérée</h3><p>Un numéro source (n° commande, n° facture, n° de vol) sans attribut descriptif : on le garde <b>directement dans la table de faits</b>. Utile pour regrouper les lignes (panier moyen = CA / COUNT DISTINCT commande).</p>
<h3>Dimension fourre-tout (junk)</h3><p>Regroupe de petits indicateurs à faible cardinalité (statut, mode de paiement, flags oui/non) dans <b>une seule</b> dimension contenant toutes leurs combinaisons → évite une dizaine de FK.</p>
<h3>Table de pont (bridge)</h3><p>Pour une relation plusieurs-à-plusieurs entre fait et dimension (équipage complet d'un vol) : PONT(vol, personnel, rôle) + <b>poids de pondération</b> (1/effectif) pour ne pas fausser les sommes.</p>
<h3>Membre inconnu / par défaut</h3><p>Ligne sk = -1 « Non renseigné » / « Client non identifié » / « Sans promotion » pour éviter les FK NULL.</p>`
},
{
id: "temps", titre: "La dimension Temps", html: `
<ul><li>Présente dans <b>tous</b> les DWH. Table physique où tout est pré-calculé (pas de fonctions SQL à la volée).</li>
<li><b>Grain : 1 jour = 1 ligne</b>. Générée une fois (ex. 10 ans passé + 10 ans futur ≈ 7 300 lignes).</li>
<li><b>Séparer la date de l'heure</b> : jours × minutes sur 20 ans = 10 M lignes ! Si besoin d'analyse horaire → <b>Dim_Heure</b> distincte (1 440 lignes à la minute, ou 24 à l'heure) et 2 FK dans le fait.</li>
<li>Clé = <b>smart key INT AAAAMMJJ</b> (ex. 20260315) : lisible, jointure rapide, tri chronologique sans jointure. Seule entorse à la règle de la clé de substitution.</li>
<li>Attributs : SK_Date, Date_Complete, Jour_Du_Mois, Nom_Jour, Mois, Nom_Mois, Trimestre, Nom_Trimestre, Année, Semaine, Est_WeekEnd, Est_Jour_Ferie, Nom_Jour_Ferie, Saison, Année/Trimestre fiscal, jour ouvré…</li>
<li>Hiérarchie : Jour → Mois → Trimestre → (Semestre) → Année ; et en parallèle Jour → Semaine → Année (une semaine peut chevaucher deux mois).</li>
<li>SCD : la dimension Temps est <b>statique</b> (type 0/1).</li></ul>`
},
{
id: "scdfiche", titre: "SCD — Slowly Changing Dimensions", html: `
<table><tr><th>Type</th><th>Mécanisme</th><th>Quand ?</th><th>Conséquence</th></tr>
<tr><td><b>0</b></td><td>Valeur figée, jamais modifiée</td><td>Attributs immuables (date de naissance, date d'ouverture, référence)</td><td>—</td></tr>
<tr><td><b>1</b></td><td>Écrasement (<code>UPDATE</code>)</td><td>Corrections de saisie, attributs sans valeur d'analyse historique</td><td>L'histoire est réécrite : les ventes passées basculent sur la nouvelle valeur</td></tr>
<tr><td><b>2</b></td><td>On <b>ferme</b> la ligne et on <b>insère</b> une nouvelle version (nouvelle SK)</td><td>La référence ; quand on veut analyser « tel que c'était au moment de »</td><td>Vérité historique parfaite ; la table grossit</td></tr>
<tr><td><b>3</b></td><td>Colonne <i>actuelle</i> + colonne <i>précédente</i></td><td>Comparer avant/après une réorganisation (ancien secteur vs nouveau)</td><td>Seulement les 2 dernières valeurs</td></tr></table>
<h3>Structure type SCD2</h3>
<pre><code>SK_KEY            INT PK       -- clé de substitution
KEY_SOURCE        VARCHAR      -- clé métier (pour l'ETL)
ATTRIBUT1..n                   -- vocabulaire métier
Date_Debut_Validite DATE
Date_Fin_Validite   DATE       -- 9999-12-31 pour la version courante
Est_Actif           INT        -- 1 = version courante</code></pre>
<p>Exemple du cours : Montpellier passe de SUD-EST à OCCITANIE le 01/07/2025 → ligne SK 5 fermée au 30/06/2025, nouvelle ligne SK 10 depuis le 01/07/2025. Les ventes 2024 restent liées à SK 5 (SUD-EST).</p>`
},
{
id: "kimball", titre: "Méthode Kimball en 4 étapes + matrice en bus", html: `
<ol class="steps">
<li><b>Choisir le processus métier</b> — un <i>événement</i> précis (passage en caisse, vente d'un billet), pas un département.</li>
<li><b>Déclarer la granularité</b> — « une ligne = … ». Étape la plus critique. Grain atomique.</li>
<li><b>Identifier les dimensions</b> — Qui, quoi, où, quand, comment, pourquoi ?</li>
<li><b>Identifier les faits</b> — les nombres issus de l'événement, cohérents avec le grain.</li></ol>
<p>(+ modéliser la solution en étoile.)</p>
<h3>Matrice en bus (Enterprise Bus Matrix)</h3>
<p>Tableau <b>processus en lignes × dimensions en colonnes</b> ; une case cochée = la dimension est utilisée par ce processus. Les colonnes cochées sur plusieurs lignes = <b>dimensions conformes</b>, à construire une seule fois pour toute l'entreprise.</p>`
},
{
id: "qualite", titre: "Qualité des données, MDM, Data Prep, BI", html: `
<ul><li><b>Qualité</b> : précision, homogénéité, validité, fiabilité, complétude, cohérence, unicité. Étapes : profilage → nettoyage → enrichissement → rapprochement (matching/dédoublonnage) → surveillance.</li>
<li><b>MDM</b> (Master Data Management) : référentiel unique des données maîtres (clients, produits) partagé par les applications.</li>
<li><b>Data Preparation</b> : self-service, no-code (Power Query, Tableau Prep, Alteryx, Dataiku). Règle des 80/20 inversée.</li>
<li><b>Couche sémantique</b> : traduit les objets techniques en langage métier. Dans Power BI : le <b>modèle sémantique</b> + les <b>mesures DAX</b>.</li>
<li><b>Restitution</b> : générateur d'états (Power BI Report Builder, états paginés), dashboarding, interrogation ad-hoc, data discovery.</li>
<li>BI d'entreprise (une seule version de la vérité, IT) vs <b>BI self-service</b> (analystes métier, autonomie).</li>
<li>Gouvernance projet : <b>MOA</b> (besoin), <b>MOE</b> (réalisation), Data Owner, Sponsor/COPIL.</li></ul>`
}
];

/* ---------- Méthode pour réussir un TP ---------- */
const METHODE = `
<div class="callout warn"><b>Barème du prof :</b> « un schéma juste sans argumentation ne rapporte que la moitié des points ». Chaque choix = <b>règle de gestion ou besoin d'analyse</b> qui le justifie.</div>
<ol class="steps">
<li><b>Lire les besoins d'analyse et les règles de gestion</b> en premier. Surligner : « au moment de… » (→ SCD2), « écrasé » (→ l'OLTP perd l'historique), « une seule valeur courante » (→ snapshot), « nullable » (→ membre inconnu), « fériés / vacances / week-end » (→ attributs de Dim_Temps), « par heure » (→ Dim_Heure).</li>
<li><b>Processus métier</b> : un par événement. Deux grains différents ⇒ deux tables de faits (constellation). Citer les tables OLTP sources.</li>
<li><b>Grain</b> : « Une ligne = … » le plus fin disponible (ligne de commande, billet, séance, produit×magasin×jour).</li>
<li><b>Matrice en bus</b> : processus en lignes, dimensions en colonnes. Dimensions cochées partout = <b>conformes</b>.</li>
<li><b>Dimensions</b> : pour chacune → SK, clé naturelle, attributs, hiérarchie, ligne par défaut, type de SCD par attribut.</li>
<li><b>Faits</b> : FK (toutes non NULL), dimensions dégénérées, mesures + additivité + intérêt métier.</li>
<li><b>Cas particuliers</b> à repérer : rôle multiple (2 dates, 2 lieux), dégénérée (n° commande), fourre-tout (statut/canal/paiement), pont (N-N), factless, snapshot.</li>
<li><b>Vérifier</b> : chaque besoin d'analyse est-il couvert ? Faire un tableau besoin → table/attribut.</li></ol>
<h2>Réflexes « mot-clé → réponse »</h2>
<div class="table-wrap"><table>
<tr><th>Dans le sujet…</th><th>Réponse attendue</th></tr>
<tr><td>« tel que c'était au moment de la vente »</td><td>SCD Type 2 sur l'attribut concerné</td></tr>
<tr><td>« corrections d'orthographe sans valeur d'analyse »</td><td>SCD Type 1</td></tr>
<tr><td>« comparer ancienne / nouvelle organisation »</td><td>SCD Type 3</td></tr>
<tr><td>« ne garde qu'une valeur courante », « niveau de stock fin de journée »</td><td>Fait <b>instantané périodique</b>, mesure semi-additive</td></tr>
<tr><td>FK « nullable » (client anonyme, vente web sans vendeur)</td><td>Ligne par défaut sk = -1 dans la dimension</td></tr>
<tr><td>n° de commande / facture / vol</td><td>Dimension dégénérée dans le fait</td></tr>
<tr><td>canal, mode de paiement, statut (peu de valeurs)</td><td>Dimension fourre-tout (junk)</td></tr>
<tr><td>deux aéroports / plusieurs dates sur un même fait</td><td>Dimension à rôles multiples (une table, plusieurs alias)</td></tr>
<tr><td>plusieurs membres d'équipage par vol</td><td>Table de pont + poids</td></tr>
<tr><td>« disponibilité », « présence », « éligible »</td><td>Table de faits sans fait (factless)</td></tr>
<tr><td>prix qui change souvent</td><td>Stocker le prix réellement payé / le coût <b>dans le fait</b> au moment de l'événement (pas de SCD2 qui exploserait la dimension)</td></tr>
<tr><td>comparaison N / N-1</td><td>Dim_Temps complète + time intelligence (SAMEPERIODLASTYEAR en DAX)</td></tr>
</table></div>`;

/* ---------- Cas SportéO : questions / réponses ---------- */
const SPORTEO_CONTEXTE = `
<p><b>SportéO</b> : 42 magasins dans 5 régions + site web + appli mobile. ~18 000 produits, 350 000 clients fidélité, 2,5 M lignes de vente/an. Source <b>SPORT-OLTP</b> (15 tables, 3FN) qui ne garde que l'<b>état courant</b>.</p>
<p><b>Règles de gestion</b> : un client peut changer d'adresse, de ville et de segment (Standard/Silver/Gold, recalculé chaque trimestre) ; un produit change de prix plusieurs fois par an et peut être reclassé (refonte annuelle) ; un magasin peut changer de région et de responsable ; corrections d'orthographe sans valeur ; vente magasin sans carte fidélité = pas de client ; vente web = pas de vendeur ; soldes 2×/an, fériés et vacances influencent les ventes. Commandes web → magasin fictif « WEB » (id 99). Statut ANNULEE ≠ vente.</p>
<details><summary>Tables source (rappel)</summary><div class="inner table-wrap"><table>
<tr><th>Table</th><th>Colonnes</th></tr>
<tr><td>COMMANDE</td><td>id_commande, date_commande, heure_commande, id_client (nullable), id_magasin, id_employe (nullable), canal, mode_paiement, statut</td></tr>
<tr><td>LIGNE_COMMANDE</td><td>id_commande, num_ligne, id_produit, quantite, prix_unitaire_ttc (réellement facturé), remise_pct, id_promotion (nullable)</td></tr>
<tr><td>CLIENT</td><td>id_client, civilite, nom, prenom, email, date_naissance, adresse, code_postal, ville, id_segment, date_inscription, optin_newsletter</td></tr>
<tr><td>SEGMENT_CLIENT</td><td>id_segment, libelle, ca_min_annuel</td></tr>
<tr><td>MAGASIN</td><td>id_magasin, nom, adresse, code_postal, ville, id_region, surface_m2, date_ouverture, id_responsable</td></tr>
<tr><td>REGION</td><td>id_region, libelle, directeur (5 lignes)</td></tr>
<tr><td>EMPLOYE</td><td>id_employe, nom, prenom, poste, id_magasin, date_embauche</td></tr>
<tr><td>PRODUIT</td><td>id_produit, reference, libelle, id_sous_categorie, id_marque, prix_vente_ttc, prix_achat_ht, taux_tva, actif</td></tr>
<tr><td>SOUS_CATEGORIE / CATEGORIE / MARQUE</td><td>libelle, id_categorie / libelle, rayon / nom, pays_origine</td></tr>
<tr><td>PROMOTION</td><td>id_promotion, libelle, type_promo (SOLDES, DESTOCKAGE, FIDELITE), taux_remise, date_debut, date_fin</td></tr>
<tr><td>STOCK</td><td>id_magasin, id_produit, qte_en_stock, seuil_alerte, date_maj — valeur courante écrasée</td></tr>
<tr><td>MOUVEMENT_STOCK</td><td>id_mouvement, id_magasin, id_produit, date_mouvement, type_mouvement (RECEPTION, VENTE, RETOUR, INVENTAIRE, TRANSFERT), quantite</td></tr>
<tr><td>JOUR_FERIE</td><td>date_ferie, libelle (référence pour Dim_Temps)</td></tr></table></div></details>
<details><summary>Les 10 besoins d'analyse</summary><div class="inner"><ol>
<li>CA HT, quantités, marge brute par jour/semaine/mois/trimestre/année, comparaison N/N-1</li>
<li>Ventes par produit, sous-catégorie, catégorie, rayon, marque</li>
<li>Ventes par magasin et région <b>telle qu'au moment de la vente</b></li>
<li>Ventes par segment client et ville <b>au moment de l'achat</b> ; suivi Silver → Gold</li>
<li>Comparaison par canal et mode de paiement</li>
<li>Impact promotions/soldes : CA avec et sans promo, taux de remise moyen</li>
<li>Ventes jours fériés, week-ends, vacances scolaires</li>
<li>Stock fin de journée par produit et magasin, valeur au prix d'achat, nb de jours de rupture par mois</li>
<li>Taux de couverture : stock moyen du mois / ventes moyennes journalières</li>
<li>Panier moyen (CA / nb commandes) par magasin et par mois</li></ol></div></details>`;

const SPORTEO = [
{ partie: "Partie 1 — Analyse de la source (2 pts)", qs: [
{ q: "Identifiez les deux processus métier à modéliser et les tables OLTP qui les alimentent.", pts: "1 pt", a: `
<p><b>Processus 1 — Les ventes</b> (tous canaux : magasin, web, appli). Événement : la vente d'un produit sur une commande.<br>
Tables : <b>COMMANDE</b> + <b>LIGNE_COMMANDE</b> (faits), enrichies par CLIENT, SEGMENT_CLIENT, EMPLOYE, MAGASIN, REGION, PRODUIT, SOUS_CATEGORIE, CATEGORIE, MARQUE, PROMOTION, JOUR_FERIE.</p>
<p><b>Processus 2 — L'état des stocks</b> en magasin. Événement : la photo du stock d'un produit dans un magasin.<br>
Tables : <b>STOCK</b> (valeur courante) + <b>MOUVEMENT_STOCK</b> (seule trace datée), enrichies par MAGASIN, PRODUIT (et sa hiérarchie, MARQUE).</p>
<p>Deux processus = deux grains différents ⇒ deux tables de faits (constellation) partageant des dimensions conformes.</p>`},
{ q: "Expliquez pourquoi SPORT-OLTP ne peut pas, en l'état, répondre aux besoins 3, 4 et 8.", pts: "1 pt", a: `
<p>SPORT-OLTP est optimisé pour la saisie et ne conserve que <b>l'état courant</b> :</p>
<ul><li><b>Besoin 3</b> (région au moment de la vente) : <code>MAGASIN.id_region</code> est <b>écrasé</b> lors d'une réorganisation. Une jointure COMMANDE → MAGASIN → REGION rattache toutes les ventes passées à la région <i>actuelle</i>.</li>
<li><b>Besoin 4</b> (segment et ville au moment de l'achat, suivi Silver → Gold) : <code>CLIENT.adresse/ville</code> et <code>id_segment</code> sont <b>écrasés</b> ; on ne connaît ni l'ancienne ville ni l'ancien segment, donc impossible de dater un passage Silver → Gold.</li>
<li><b>Besoin 8</b> (stock fin de journée, valeur au prix d'achat, jours de rupture) : <code>STOCK</code> ne garde qu'<b>une seule valeur courante</b> (date_maj écrasée) → aucune photo quotidienne. On pourrait la reconstituer depuis MOUVEMENT_STOCK, mais c'est un calcul lourd ; et <code>prix_achat_ht</code> est écrasé, donc la valorisation passée est impossible.</li></ul>
<p>En plus : requêtes analytiques lourdes sur 2,5 M lignes/an = risque de ralentir la caisse/ERP ; modèle 3FN = beaucoup de jointures ; pas de calendrier enrichi (vacances, N-1).</p>`}]},
{ partie: "Partie 2 — Matrice en bus (2 pts)", qs: [
{ q: "Construisez la matrice en bus (processus en lignes, dimensions en colonnes). Identifiez les dimensions conformes.", pts: "2 pts", a: `
<div class="table-wrap"><table class="bus"><tr><th>Processus \\ Dim.</th><th>Temps</th><th>Heure</th><th>Produit</th><th>Magasin</th><th>Client</th><th>Employé</th><th>Promotion</th><th>Indicateur vente</th></tr>
<tr><td><b>Ventes</b></td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
<tr><td><b>Stocks</b></td><td>✔</td><td></td><td>✔</td><td>✔</td><td></td><td></td><td></td><td></td></tr></table></div>
<p><b>Dimensions conformes</b> : <b>DIM_TEMPS, DIM_PRODUIT, DIM_MAGASIN</b>. Elles doivent être strictement identiques (mêmes SK, mêmes libellés) pour permettre le <b>drill-across</b>, indispensable au besoin 9 (taux de couverture = stock moyen / ventes moyennes, qui croise les deux faits).</p>
<p>Les autres sont spécifiques aux ventes. <code>id_commande</code> n'est pas une colonne de la matrice : c'est une dimension dégénérée.</p>`}]},
{ partie: "Partie 3 — Dimension Temps (4 pts)", qs: [
{ q: "Choisissez la granularité de la dimension Temps et justifiez-la au regard des deux faits. Faut-il une dimension Heure séparée ?", pts: "1 pt", a: `
<p><b>Grain : le jour</b> (une ligne = une date calendaire).</p>
<ul><li>Ventes : le besoin 1 descend au jour ; la date de commande est un jour.</li>
<li>Stock : le besoin 8 demande le stock <b>en fin de journée</b> → photo quotidienne, grain jour.</li>
<li>Le jour est le plus petit grain commun aux deux faits → DIM_TEMPS conforme.</li></ul>
<p><b>Heure</b> : <b>ne pas</b> la mettre dans DIM_TEMPS (jours × minutes sur 20 ans ≈ 10 M lignes au lieu de 7 300). Si l'on veut analyser l'affluence horaire (heure_commande existe), on crée une <b>DIM_HEURE séparée</b> (24 lignes à l'heure, ou 1 440 à la minute), utilisée <b>uniquement par FAIT_VENTES</b> ; FAIT_STOCK n'en a pas besoin. Aucun des 10 besoins ne l'exige explicitement : elle est optionnelle mais peu coûteuse.</p>`},
{ q: "Listez les attributs de DIM_TEMPS permettant de répondre aux besoins 1 et 7 (au moins 10), et décrivez sa hiérarchie.", pts: "1,5 pt", a: `
<div class="table-wrap"><table><tr><th>Attribut</th><th>Exemple</th><th>Besoin</th></tr>
<tr><td>sk_date (PK)</td><td>20260315</td><td>jointure</td></tr>
<tr><td>date_complete</td><td>2026-03-15</td><td>1</td></tr>
<tr><td>jour_du_mois, num_jour_semaine, nom_jour</td><td>15, 7, Dimanche</td><td>1, 7</td></tr>
<tr><td>num_semaine_iso, annee_iso</td><td>11, 2026</td><td>1 (semaine)</td></tr>
<tr><td>mois, nom_mois, annee_mois</td><td>3, Mars, 2026-03</td><td>1</td></tr>
<tr><td>trimestre, nom_trimestre</td><td>1, T1</td><td>1</td></tr>
<tr><td>semestre, annee</td><td>1, 2026</td><td>1</td></tr>
<tr><td>sk_date_n_1 (même jour N-1)</td><td>20250315</td><td>1 (N/N-1)</td></tr>
<tr><td>est_weekend</td><td>1</td><td>7</td></tr>
<tr><td>est_jour_ferie, nom_jour_ferie</td><td>0, N/A</td><td>7 (via JOUR_FERIE)</td></tr>
<tr><td>est_vacances_zone_A / B / C, nom_vacances</td><td>0/0/1, « Hiver »</td><td>7 (zones différentes selon le magasin)</td></tr>
<tr><td>est_periode_soldes, nom_soldes</td><td>0</td><td>6, 7</td></tr>
<tr><td>est_jour_ouvre</td><td>0</td><td>7</td></tr>
<tr><td>saison</td><td>Hiver</td><td>analyses saisonnières</td></tr></table></div>
<p><b>Hiérarchies</b> : Jour → Mois → Trimestre → Semestre → Année ; hiérarchie parallèle Jour → Semaine ISO → Année ISO (une semaine peut chevaucher deux mois/années, elle ne s'emboîte donc pas dans le mois).</p>
<p>Astuce : les vacances scolaires dépendent de la <b>zone</b> du magasin → soit trois flags (A/B/C) dans DIM_TEMPS, soit la zone dans DIM_MAGASIN pour choisir le bon flag.</p>`},
{ q: "Précisez le format de la clé de substitution et la manière de peupler la table.", pts: "0,5 pt", a: `
<p>Clé = <b>smart key entière AAAAMMJJ</b> (ex. 20260315) : INT compact, jointures rapides, lisible, tri chronologique sans jointure, et l'ETL la calcule directement depuis <code>date_commande</code> sans lookup.</p>
<p><b>Peuplement</b> : générée <b>une seule fois</b> par script (CTE récursive / generate_series / Power Query) sur une plage large (ex. 2015 → 2035 ≈ 7 300 lignes), indépendamment des ventes. Enrichie par <b>LEFT JOIN sur JOUR_FERIE</b> (est_jour_ferie, nom) et par un référentiel externe des vacances scolaires (calendrier de l'Éducation nationale) et des périodes de soldes. Mise à jour annuelle si nécessaire (SCD 0/1).</p>`}]},
{ partie: "Partie 4 — Autres dimensions (4 pts)", qs: [
{ q: "Pour Produit, Client et Magasin : attributs, clé de substitution, clé naturelle, hiérarchies.", pts: "2 pts", a: `
<h3>DIM_PRODUIT</h3>
<p>SK : <b>sk_produit</b> (INT auto-incrément) — clé naturelle : <b>id_produit</b> (+ reference).<br>
Attributs : reference, libelle, sous_categorie, categorie, rayon, marque, pays_origine_marque, prix_vente_ttc (catalogue courant), prix_achat_ht, taux_tva, actif + colonnes SCD2 (date_debut_validite, date_fin_validite, est_actif).<br>
Hiérarchies : <b>Produit → Sous-catégorie → Catégorie → Rayon</b> ; <b>Produit → Marque → Pays d'origine</b>.</p>
<h3>DIM_CLIENT</h3>
<p>SK : <b>sk_client</b> — clé naturelle : <b>id_client</b>.<br>
Attributs : civilite, nom, prenom, email, date_naissance, tranche_age, adresse, code_postal, ville, departement, segment (libellé), ca_min_segment, date_inscription, optin_newsletter + colonnes SCD2.<br>
Hiérarchies : <b>Ville → Département</b> (géographique) ; <b>Segment</b> (Standard &lt; Silver &lt; Gold).<br>
Ligne par défaut : sk = -1 « Client non identifié ».</p>
<h3>DIM_MAGASIN</h3>
<p>SK : <b>sk_magasin</b> — clé naturelle : <b>id_magasin</b>.<br>
Attributs : nom, adresse, code_postal, ville, region, directeur_region, surface_m2, date_ouverture, nom_responsable, type_magasin (PHYSIQUE / WEB), zone_vacances + colonnes SCD2.<br>
Hiérarchie : <b>Magasin → Ville → Région</b>. Le magasin fictif WEB (id 99) a une ligne avec region = « Web ».</p>
<p>Également : <b>DIM_EMPLOYE</b> (sk_employe, id_employe, nom, prenom, poste, magasin de rattachement, date_embauche ; ligne -1 « Sans vendeur (web) »), <b>DIM_PROMOTION</b> (sk_promotion, id_promotion, libelle, type_promo, taux_remise, date_debut, date_fin ; ligne -1 « Sans promotion »), <b>DIM_INDICATEUR_VENTE</b> (junk).</p>`},
{ q: "Étoile ou flocon ? Justifiez pour Produit (Catégorie / Sous-catégorie / Marque) et Magasin (Région).", pts: "0,5 pt", a: `
<p><b>Étoile</b> dans les deux cas : on <b>dénormalise</b> la hiérarchie dans la dimension.</p>
<ul><li><b>Produit</b> : 18 000 lignes, les libellés de catégorie/sous-catégorie/marque sont courts → la redondance est négligeable. Moins de jointures = meilleures performances et un modèle plus lisible dans Power BI (le cours : flocon « à ne faire que pour des tables volumineuses »). La hiérarchie reste exploitable en drill-down via les colonnes aplaties.</li>
<li><b>Magasin / Région</b> : REGION n'a que <b>5 lignes</b> → aucun intérêt à normaliser. Surtout, avec la région <b>dans</b> DIM_MAGASIN historisée en SCD2, chaque version du magasin porte la région en vigueur : c'est ce qui répond au besoin 3. En flocon, une FK vers une table REGION ne garderait pas l'historique du rattachement si on ne versionne pas aussi le lien.</li></ul>`},
{ q: "Que faites-vous de canal, mode_paiement et statut ? Proposez une solution argumentée.", pts: "0,5 pt", a: `
<p><b>Dimension fourre-tout (junk) DIM_INDICATEUR_VENTE</b> (sk_indicateur, canal, mode_paiement, statut) contenant toutes les combinaisons : 3 canaux × 4 modes de paiement × quelques statuts ≈ quelques dizaines de lignes.</p>
<ul><li>Attributs à <b>faible cardinalité</b> sans autre attribut descriptif → une dimension chacun ajouterait 3 FK au fait pour rien.</li>
<li>Ils ne peuvent pas rester en texte dans le fait (règle : pas de texte dans le fait).</li>
<li>Répond au besoin 5 (CA par canal et par mode de paiement).</li>
<li><b>Statut</b> : les commandes ANNULEE sont <b>exclues à l'ETL</b> (ne sont pas des ventes) ; il reste peu de valeurs utiles. On pourrait même le supprimer.</li></ul>
<p>Alternative acceptable si bien argumentée : une DIM_CANAL dédiée si le canal porte des attributs propres (ex. type physique/digital).</p>`},
{ q: "Comment traitez-vous les ventes sans client identifié et les ventes web sans vendeur, sans clé étrangère nulle dans les faits ?", pts: "0,5 pt", a: `
<p>On ajoute des <b>lignes par défaut (membres inconnus / non applicables)</b> dans les dimensions, créées une fois à l'initialisation :</p>
<ul><li>DIM_CLIENT : <b>sk_client = -1</b>, nom = « Client non identifié », segment = « Non renseigné ».</li>
<li>DIM_EMPLOYE : <b>sk_employe = -1</b> « Sans vendeur (vente web/appli) » (on peut distinguer -1 « Inconnu » et -2 « Non applicable »).</li>
<li>Même logique pour DIM_PROMOTION : sk = -1 « Sans promotion » (id_promotion nullable).</li></ul>
<p>À l'ETL : <code>COALESCE(lookup_sk, -1)</code>. Pourquoi ? Une FK NULL casse la jointure interne : la vente <b>disparaîtrait silencieusement</b> des rapports et le CA serait faux. Avec -1, elle reste comptée et peut être filtrée/analysée (« part des ventes anonymes »).</p>`},
{ q: "Où placez-vous id_commande ? Nommez le concept.", pts: "0,5 pt", a: `
<p>Dans <b>FAIT_VENTES</b>, comme simple colonne : c'est une <b>dimension dégénérée</b>. Toutes les infos de la commande (date, client, magasin, vendeur, canal) sont déjà dans les vraies dimensions ; il ne reste aucun attribut descriptif qui justifierait une table. Il sert à regrouper les lignes d'une même commande : <b>panier moyen</b> (besoin 10) = SUM(CA) / COUNT(DISTINCT id_commande), et à remonter à la source en cas d'anomalie. (num_ligne aussi.)</p>`}]},
{ partie: "Partie 5 — Tables de faits (4 pts)", qs: [
{ q: "FAIT_VENTES : déclarez le grain, les clés étrangères et les mesures. Classez chaque mesure.", pts: "1,5 pt", a: `
<p><b>Grain</b> : une ligne = <b>une ligne de commande</b> (un produit vendu dans une commande non annulée), tous canaux confondus.</p>
<p><b>FK</b> : sk_date, sk_heure, sk_produit, sk_magasin, sk_client, sk_employe, sk_promotion, sk_indicateur (toutes NOT NULL). <b>Dimensions dégénérées</b> : id_commande, num_ligne.</p>
<div class="table-wrap"><table><tr><th>Mesure</th><th>Calcul</th><th>Additivité</th></tr>
<tr><td>quantite</td><td>source</td><td>Additive</td></tr>
<tr><td>montant_ttc</td><td>quantite × prix_unitaire_ttc</td><td>Additive</td></tr>
<tr><td>montant_ht (CA HT)</td><td>montant_ttc / (1 + taux_tva)</td><td>Additive</td></tr>
<tr><td>montant_remise_ht</td><td>prix catalogue × qte − montant facturé</td><td>Additive</td></tr>
<tr><td>cout_achat_ht</td><td>quantite × prix_achat_ht <b>au moment de la vente</b></td><td>Additive</td></tr>
<tr><td>marge_brute</td><td>montant_ht − cout_achat_ht</td><td>Additive</td></tr>
<tr><td>prix_unitaire_ttc</td><td>source</td><td>Non additive</td></tr>
<tr><td>remise_pct / taux_marge</td><td>ratios</td><td>Non additives (recalculer : SUM(remise)/SUM(brut))</td></tr></table></div>
<p>Le coût d'achat est figé dans le fait car <code>prix_achat_ht</code> est écrasé dans l'OLTP : sinon la marge passée changerait à chaque modification de prix.</p>`},
{ q: "FAIT_STOCK : quel type de table de faits ? Grain, mesures. Pourquoi la quantité en stock est-elle semi-additive ? Exemple d'agrégation interdite.", pts: "1,5 pt", a: `
<p><b>Instantané périodique</b> (periodic snapshot) quotidien : on photographie STOCK chaque soir (l'OLTP n'en garde qu'une valeur courante).</p>
<p><b>Grain</b> : une ligne = <b>un produit × un magasin × un jour</b> (stock en fin de journée). FK : sk_date, sk_produit, sk_magasin.</p>
<div class="table-wrap"><table><tr><th>Mesure</th><th>Additivité</th></tr>
<tr><td>qte_en_stock</td><td>Semi-additive</td></tr>
<tr><td>valeur_stock_achat = qte × prix_achat_ht du jour</td><td>Semi-additive</td></tr>
<tr><td>seuil_alerte</td><td>Non additive</td></tr>
<tr><td>est_en_rupture (1 si qte = 0)</td><td>Additive → SUM = nb de jours de rupture (besoin 8)</td></tr>
<tr><td>qte_entree / qte_sortie du jour (depuis MOUVEMENT_STOCK)</td><td>Additives (flux)</td></tr></table></div>
<p><b>Semi-additive</b> : c'est un <b>niveau</b> (une photo), pas un flux. On peut sommer sur les magasins ou les produits un même jour (stock total de la région), mais pas sur le temps : la même marchandise serait comptée chaque jour.</p>
<p><b>Agrégation interdite</b> : <code>SUM(qte_en_stock)</code> sur mars 2026 pour un produit → 100 unités chaque jour donnent 3 100, absurde. Sur le temps : <b>AVG</b> (stock moyen, besoin 9) ou <b>dernière valeur</b> (stock fin de mois).</p>
<p>Volume : 18 000 produits × 41 magasins physiques × 365 j ≈ 270 M lignes/an → on peut limiter aux produits référencés par magasin, ou partitionner par mois.</p>`}]},
{ partie: "Partie 6 — Historisation (4 pts)", qs: [
{ q: "Tableau : pour chaque attribut susceptible de changer, type de SCD (0, 1, 2 ou 3) et justification.", pts: "2,5 pts", a: `
<div class="table-wrap"><table><tr><th>Dimension</th><th>Attribut</th><th>SCD</th><th>Justification</th></tr>
<tr><td>Client</td><td>segment</td><td><b>2</b></td><td>Besoin 4 : segment au moment de l'achat + suivi Silver→Gold (recalcul trimestriel)</td></tr>
<tr><td>Client</td><td>adresse, code_postal, ville</td><td><b>2</b></td><td>Besoin 4 : ville au moment de l'achat (déménagement)</td></tr>
<tr><td>Client</td><td>nom, prénom, email, civilité</td><td>1</td><td>Corrections sans valeur d'analyse</td></tr>
<tr><td>Client</td><td>optin_newsletter</td><td>1</td><td>Pas de besoin historique</td></tr>
<tr><td>Client</td><td>date_naissance, date_inscription</td><td>0</td><td>Immuables (une erreur se corrige en 1)</td></tr>
<tr><td>Produit</td><td>sous_categorie, categorie, rayon</td><td><b>2</b></td><td>Reclassement annuel : les ventes passées restent dans leur ancienne catégorie (besoin 2 cohérent dans le temps). Type 3 possible pour comparer ancien/nouveau catalogue.</td></tr>
<tr><td>Produit</td><td>prix_vente_ttc</td><td>1</td><td>Change plusieurs fois/an ; le prix réellement payé est déjà dans le fait. Un SCD2 ferait exploser la dimension.</td></tr>
<tr><td>Produit</td><td>prix_achat_ht</td><td>1</td><td>Figé dans le fait (cout_achat, valeur_stock) au chargement</td></tr>
<tr><td>Produit</td><td>libelle, marque</td><td>1</td><td>Corrections d'orthographe sans valeur d'analyse</td></tr>
<tr><td>Produit</td><td>actif, taux_tva</td><td>1</td><td>État courant suffit (montant HT calculé dans le fait)</td></tr>
<tr><td>Produit</td><td>reference</td><td>0</td><td>Identifiant</td></tr>
<tr><td>Magasin</td><td>region (+ directeur)</td><td><b>2</b></td><td>Besoin 3 : région au moment de la vente</td></tr>
<tr><td>Magasin</td><td>responsable</td><td>1</td><td>Pas de besoin d'analyse par responsable (type 3 si on veut ancien/nouveau)</td></tr>
<tr><td>Magasin</td><td>nom, adresse, surface_m2</td><td>1</td><td>Pas de besoin historique</td></tr>
<tr><td>Magasin</td><td>date_ouverture</td><td>0</td><td>Immuable</td></tr>
<tr><td>Employé</td><td>poste, magasin, nom</td><td>1</td><td>Aucun besoin d'analyse sur l'historique vendeur</td></tr>
<tr><td>Promotion</td><td>libelle, taux_remise, dates</td><td>0/1</td><td>Une promo est un événement ponctuel ; le taux réel est dans le fait</td></tr>
<tr><td>Temps / Heure / Indicateur</td><td>tous</td><td>0</td><td>Tables statiques générées</td></tr></table></div>`},
{ q: "Concluez : quelles tables de dimension doivent être historisées, et lesquelles non ?", pts: "0,5 pt", a: `
<p><b>Historisées (SCD2)</b> : <b>DIM_CLIENT</b> (segment, ville), <b>DIM_MAGASIN</b> (région), <b>DIM_PRODUIT</b> (classement catégorie). Ce sont exactement celles dont un besoin dit « au moment de » ou dont la règle de gestion modifie un axe d'analyse.</p>
<p><b>Non historisées</b> (SCD 0/1) : DIM_TEMPS, DIM_HEURE, DIM_EMPLOYE, DIM_PROMOTION, DIM_INDICATEUR_VENTE.</p>
<p>Une dimension SCD2 garde aussi des attributs en type 1 (SCD hybride) : la nouvelle version n'est créée que si un attribut « type 2 » change.</p>`},
{ q: "Pour une dimension en type 2 : colonnes techniques et étapes de l'ETL quand un client passe de Silver à Gold.", pts: "1 pt", a: `
<p><b>Colonnes techniques</b> : <code>sk_client</code> (clé de substitution, nouvelle à chaque version), <code>id_client</code> (clé naturelle), <code>date_debut_validite</code>, <code>date_fin_validite</code> (9999-12-31 pour la version courante), <code>est_actif</code> (1/0). Optionnel : <code>num_version</code>, <code>hash</code> des attributs.</p>
<ol><li><b>Extraction</b> des clients modifiés (CDC ou comparaison complète) ; le recalcul trimestriel met id_segment = Gold.</li>
<li><b>Lookup</b> dans DIM_CLIENT : <code>id_client = X AND est_actif = 1</code> → version Silver (sk 1042).</li>
<li><b>Comparaison</b> des attributs suivis en type 2 : segment Silver ≠ Gold → changement de type 2 détecté.</li>
<li><b>Fermeture</b> : UPDATE de sk 1042 → date_fin_validite = date du changement − 1 jour, est_actif = 0.</li>
<li><b>Insertion</b> d'une nouvelle ligne : nouvelle sk (ex. 98 311), mêmes id_client et attributs, segment = Gold, date_debut = date du changement, date_fin = 9999-12-31, est_actif = 1.</li>
<li>(Attributs type 1 modifiés en même temps → UPDATE sur toutes les versions.)</li>
<li><b>Chargement des faits</b> : les nouvelles ventes reçoivent sk 98 311 (lookup sur la version active, ou sur date_vente BETWEEN debut AND fin). Les ventes passées restent sur sk 1042 → toujours comptées « Silver ».</li></ol>
<p>Suivi Silver → Gold : auto-jointure de DIM_CLIENT sur id_client où une version Silver est suivie d'une version Gold.</p>`}]},
{ partie: "Partie 7 — Implémentation SQL (2 pts bonus)", qs: [
{ q: "CREATE TABLE de DIM_CLIENT (avec SCD2) et de FAIT_VENTES.", pts: "1 pt", a: `<p>Voir la page <a href="#sql">SQL de l'entrepôt</a> pour le script complet commenté.</p>`},
{ q: "Requête du besoin 3 pour 2025, puis stock moyen par catégorie pour mars 2026.", pts: "1 pt", a: `<p>Voir la page <a href="#sql">SQL de l'entrepôt</a> (avec le piège du stock moyen expliqué).</p>`}]}
];

/* ---------- TP1 et TP3 (résumés des corrigés) ---------- */
const TPS = [
{ titre: "TP1 — Planning des cours (étoile simple)", sujet: "docs/tp1-sujet.pdf", corrige: "docs/tp1-corrige.pdf", html: `
<p><b>Contexte</b> : application de planning (SEANCE, PROFESSEUR, SALLE, MATIERE, GROUPE). Besoin : charge des profs, taux d'occupation des salles, volume d'heures par matière et semestre.</p>
<ol class="steps">
<li><b>Processus</b> : la programmation des séances de cours (seul processus de la source, entité SEANCE).</li>
<li><b>Grain</b> : une ligne = une séance programmée, à un créneau, dans une salle, par un prof, pour un groupe (le plus fin : une occurrence de SEANCE).</li>
<li><b>Dimensions</b> : Dim_Date (T1), <b>Dim_Creneau</b> séparée de la date (motif hebdo récurrent ; T1), Dim_Professeur (<b>T2</b> : statut vacataire/permanent change), Dim_Salle (<b>T2</b> : capacité modifiable), Dim_Matiere (T1), Dim_Groupe (T1/T2 selon l'effectif).</li>
<li><b>Mesures</b> de FAIT_SEANCE : NbSeances = 1 (additive), DureeSeance (additive), EffectifGroupe (<b>semi-additive</b> : photo répétée à chaque séance), TauxOccupationSalle = effectif/capacité (<b>non additive</b>, calculée à la volée), SeanceAnnulee 0/1 (additive → taux d'annulation).</li></ol>
<div class="star"><div class="col"><div class="box"><b>DIM_DATE</b>Jour, Semaine, Mois, Semestre</div><div class="box"><b>DIM_GROUPE</b>NomGroupe, Filière, Effectif</div><div class="box"><b>DIM_MATIERE</b>Intitulé, Filière, Niveau</div></div>
<div class="box fact"><b>FAIT_SEANCE</b>6 FK<br>NbSeances, DureeSeance, EffectifGroupe, TauxOccupation, SeanceAnnulee</div>
<div class="col"><div class="box"><b>DIM_CRENEAU</b>HeureDébut, HeureFin, Plage</div><div class="box"><b>DIM_PROFESSEUR</b> (SCD2)Nom, Département, Statut</div><div class="box"><b>DIM_SALLE</b> (SCD2)NomSalle, Bâtiment, Capacité</div></div></div>
<p><b>Bonus</b> : FAIT_DISPONIBILITE_SALLE (Salle, Date, Créneau) = <b>factless fact table</b> (couverture) pour détecter conflits et disponibilités. Évolution : Dim_TypeSeance (CM/TD/TP).</p>`},
{ titre: "TP3 — Compagnie aérienne (constellation)", sujet: "docs/tp3-sujet.pdf", corrige: "docs/tp3-corrige.pdf", html: `
<p><b>Contexte</b> : billetterie (CLIENT, RESERVATION, BILLET, TARIF) + exploitation des vols (VOL, AVION, AEROPORT, PORTE, PERSONNEL_NAVIGANT, AFFECTATION).</p>
<ol class="steps">
<li><b>Deux processus</b> : la <b>billetterie</b> (vente de billets) et l'<b>exploitation des vols</b>. Deux grains différents ⇒ deux faits ⇒ <b>constellation</b>.</li>
<li><b>Grains</b> : FAIT_RESERVATION = un <b>billet</b> vendu (pas la réservation, qui regroupe plusieurs billets) ; FAIT_VOL = un vol programmé (une occurrence datée d'un numéro de vol).</li>
<li><b>Dimensions conformes</b> : Date, Aéroport départ, Aéroport arrivée, Avion. Spécifiques billetterie : Client (T2 statut fidélité), Tarif (T2 le prix évolue), Canal. Spécifiques vol : Commandant (T2 base), Porte départ.</li>
<li><b>Aéroport = dimension à rôles multiples</b> : une seule table DIM_AEROPORT, deux FK (départ/arrivée), deux vues/alias. Ne pas dupliquer les données.</li>
<li><b>FAIT_RESERVATION</b> : NbBillets=1, MontantPaye, Remise (additives), BilletAnnuleRembourse 0/1. NumSiège/NumBillet = attributs dégénérés.</li>
<li><b>FAIT_VOL</b> : NbPassagers (additive), CapaciteAvion (<b>semi-additive</b>), TauxRemplissage (<b>non additive</b>), RetardDepart min, VolAnnule 0/1 (additives). NumeroVol = <b>dimension dégénérée</b>.</li></ol>
<div class="star"><div class="col"><div class="box"><b>DIM_CLIENT</b> (T2)</div><div class="box"><b>DIM_TARIF</b> (T2)</div><div class="box"><b>DIM_CANAL</b></div></div>
<div class="col"><div class="box fact"><b>FAIT_RESERVATION</b>NbBillets, MontantPaye, Remise, BilletAnnule</div><div class="box conf"><b>Conformes</b> : DIM_DATE · DIM_AEROPORT (départ/arrivée) · DIM_AVION</div><div class="box fact"><b>FAIT_VOL</b>NbPassagers, TauxRemplissage, RetardDepart, VolAnnule</div></div>
<div class="col"><div class="box"><b>DIM_COMMANDANT</b> (T2)</div><div class="box"><b>DIM_PORTE_DEPART</b></div></div></div>
<h3>Questions complémentaires</h3>
<ul><li><b>Pourquoi deux faits ?</b> Grains différents (billet vs vol) : une seule table mélangerait les niveaux de détail et compterait en double (NbPassagers répété sur chaque billet).</li>
<li><b>Mauvais SCD pour Tarif/Avion ?</b> En type 1, un changement de montant ou de capacité réécrirait l'histoire : recettes passées et taux de remplissage passés recalculés avec les nouvelles valeurs → faux. D'où le type 2.</li>
<li><b>Équipage complet</b> : <b>table de pont</b> PONT_EQUIPAGE_VOL(vol, personnel, rôle) + <b>poids</b> 1/effectif pour ne pas gonfler les mesures.</li>
<li><b>Drill-across</b> : croiser les deux faits uniquement via les dimensions conformes.</li></ul>`}
];

/* ---------- Quiz ---------- */
const QUIZ = [
{q:"Quelle est la première étape de la méthode Kimball ?", c:["Identifier les dimensions","Choisir le processus métier","Déclarer la granularité","Identifier les faits"], a:1, e:"Ordre : processus métier → granularité → dimensions → faits."},
{q:"Quelle étape Kimball est jugée la plus critique ?", c:["Choisir les mesures","Déclarer la granularité","Choisir le SCD","Dessiner l'étoile"], a:1, e:"Un grain mal défini produit des doublons ou empêche de descendre dans le détail."},
{q:"Le stock d'un produit en magasin est une mesure…", c:["Additive","Semi-additive","Non additive","Dégénérée"], a:1, e:"Sommable par magasin/produit un même jour, mais pas sur le temps."},
{q:"Le taux de marge (%) est une mesure…", c:["Additive","Semi-additive","Non additive"], a:2, e:"Un ratio se recalcule : SUM(marge)/SUM(CA)."},
{q:"Le chiffre d'affaires HT est une mesure…", c:["Additive","Semi-additive","Non additive"], a:0, e:"Sommable sur tous les axes."},
{q:"Quel SCD conserve l'historique complet en créant une nouvelle ligne ?", c:["Type 0","Type 1","Type 2","Type 3"], a:2, e:"Type 2 : on ferme la version et on insère une nouvelle ligne avec une nouvelle clé de substitution."},
{q:"Correction de « Pris » en « Paris » dans l'adresse : quel SCD ?", c:["Type 1","Type 2","Type 3","Pont"], a:0, e:"Erreur de saisie sans valeur d'analyse → écrasement."},
{q:"Comparer ancienne et nouvelle organisation commerciale (avant/après seulement) : quel SCD ?", c:["Type 1","Type 2","Type 3","Type 0"], a:2, e:"Type 3 : colonne actuelle + colonne précédente."},
{q:"Le n° de commande conservé dans la table de faits est une…", c:["Dimension conforme","Dimension dégénérée","Dimension fourre-tout","Table de pont"], a:1, e:"Pas d'attribut descriptif propre : il reste dans le fait."},
{q:"Canal, mode de paiement et statut regroupés dans une seule dimension :", c:["Dimension dégénérée","Dimension à rôles multiples","Dimension fourre-tout (junk)","Dimension conforme"], a:2, e:"Junk dimension = combinaisons de petits indicateurs."},
{q:"Aéroport de départ et aéroport d'arrivée pointant vers la même table :", c:["Dimension à rôles multiples","Table de pont","Flocon","SCD3"], a:0, e:"Une table physique, plusieurs FK et alias."},
{q:"Une dimension partagée à l'identique par plusieurs tables de faits est…", c:["Dégénérée","Conforme","Fourre-tout","Factless"], a:1, e:"Elle permet le drill-across entre processus."},
{q:"Format recommandé pour la clé de Dim_Temps :", c:["GUID","Auto-incrément aléatoire","INT AAAAMMJJ","La date en VARCHAR"], a:2, e:"Smart key lisible, rapide, triable."},
{q:"Pourquoi séparer Dim_Heure de Dim_Date ?", c:["Pour respecter la 3FN","Pour éviter une table de ~10 M lignes","Parce que Power BI l'impose","Pour faire un flocon"], a:1, e:"Jours × minutes sur 20 ans ≈ 10 M lignes ; deux dimensions = 7 300 + 1 440 lignes."},
{q:"Que faire d'une vente sans client identifié ?", c:["Mettre NULL dans sk_client","Supprimer la ligne","Pointer vers une ligne par défaut sk = -1","Créer un client fictif par vente"], a:2, e:"Jamais de FK NULL : la ligne disparaîtrait des jointures."},
{q:"Une table de faits contenant seulement des clés étrangères est…", c:["Un instantané périodique","Une factless fact table","Une table de pont","Une dimension"], a:1, e:"Mesure par COUNT : présence, éligibilité, disponibilité."},
{q:"Le stock de fin de journée par produit et magasin se modélise en…", c:["Fait de transaction","Instantané périodique","Instantané cumulatif","Factless"], a:1, e:"Une photo à intervalle régulier."},
{q:"Une commande suivie de jalons (commandée, expédiée, livrée) mis à jour :", c:["Instantané cumulatif","Instantané périodique","Transaction","Pont"], a:0, e:"Accumulating snapshot avec plusieurs dates."},
{q:"Le modèle en flocon est recommandé…", c:["Toujours","Pour les tables de dimension volumineuses","Pour les tables de faits","Jamais pour Power BI"], a:1, e:"Selon le cours : à ne faire que dans le cas de tables volumineuses."},
{q:"Plusieurs tables de faits partageant des dimensions :", c:["Étoile","Flocon","Constellation","Cube"], a:2, e:"Aussi appelé galaxy schema."},
{q:"Les 4 propriétés d'Inmon d'un DWH :", c:["Rapide, sûr, normalisé, temps réel","Orienté sujet, intégré, non volatile, historisé","Distribué, volatil, agrégé, temps réel","Étoile, flocon, constellation, cube"], a:1, e:"À connaître par cœur."},
{q:"Dans un DWH, peut-on corriger une donnée directement ?", c:["Oui, par UPDATE","Non, il est non volatile : on corrige à la source/l'ETL","Oui, via Power BI","Seulement les faits"], a:1, e:"Le DWH n'est pas accessible en écriture directe."},
{q:"Rôle de l'ODS :", c:["Restitution","Sas tampon d'intégration et de validation","Stockage des agrégats","Bus temps réel"], a:1, e:"Operational Data Store : copie des données opérationnelles avant le DWH."},
{q:"Un datamart est…", c:["Une source OLTP","Un sous-ensemble du DWH orienté métier","Un outil ETL","Un cube Power BI"], a:1, e:"Ventes, RH, Finance… avec agrégats."},
{q:"Différence ELT / ETL :", c:["ELT transforme dans la cible après chargement","ELT est temps réel","ELT ne transforme pas","Aucune"], a:0, e:"ELT profite de la puissance de la plateforme cible (Cloud)."},
{q:"Un ESB est…", c:["Un ETL plus rapide","Un bus de messages temps réel entre applications","Un datamart","Un type de SCD"], a:1, e:"Push vs pull ; complémentaire de l'ETL."},
{q:"Colonnes techniques d'une dimension SCD2 :", c:["date_creation, auteur","date_debut_validite, date_fin_validite, est_actif","version_ETL, hash uniquement","Aucune"], a:1, e:"Plus la clé de substitution, qui change à chaque version."},
{q:"Date de fin de validité de la version courante (SCD2) :", c:["NULL","La date du jour","Une date lointaine (31/12/9999)","La date de début"], a:2, e:"Convention qui simplifie les BETWEEN."},
{q:"Quand un client SCD2 change de segment, ses ventes passées…", c:["Basculent sur le nouveau segment","Restent sur l'ancienne version (ancien segment)","Sont supprimées","Sont dupliquées"], a:1, e:"Elles gardent l'ancienne SK."},
{q:"Pour représenter tout l'équipage d'un vol :", c:["Une FK par membre","Une table de pont avec un poids","Une dimension dégénérée","Un SCD3"], a:1, e:"Relation N-N fait/dimension → bridge table."},
{q:"Pourquoi utiliser des clés de substitution plutôt que les ID sources ?", c:["Pour faire joli","Indépendance vis-à-vis de la source et indispensable au SCD2","Obligatoire en SQL","Pour chiffrer les données"], a:1, e:"Un client SCD2 a plusieurs lignes : il faut une clé par version."},
{q:"Le prix d'un produit change plusieurs fois par an. Meilleure solution ?", c:["SCD2 sur le prix","Stocker le prix réellement payé/le coût dans le fait","SCD3","Ne rien stocker"], a:1, e:"Évite l'explosion de la dimension ; le fait capture la valeur au moment de l'événement."},
{q:"Quel objet Power BI joue le rôle de couche sémantique ?", c:["Power Query","Le modèle sémantique + mesures DAX","Le visuel carte","Report Builder"], a:1, e:"Cf. chapitre Front End."},
{q:"Dans Power BI, relation entre dimension et fait :", c:["Plusieurs-à-plusieurs","Un-à-plusieurs (1 côté dimension)","Un-à-un","Aucune"], a:1, e:"1 → * de la dimension vers le fait, filtrage simple."},
{q:"Fonction DAX pour comparer N / N-1 :", c:["SAMEPERIODLASTYEAR","RELATED","SWITCH","DISTINCT"], a:0, e:"CALCULATE([CA], SAMEPERIODLASTYEAR('Dim_Temps'[date]))."},
{q:"Fonction DAX qui modifie le contexte de filtre :", c:["SUM","CALCULATE","FORMAT","VALUES"], a:1, e:"CALCULATE est la fonction centrale du DAX."},
{q:"Panier moyen en DAX :", c:["AVERAGE(montant)","DIVIDE([CA], DISTINCTCOUNT(id_commande))","SUM(id_commande)","COUNT(montant)"], a:1, e:"id_commande = dimension dégénérée."},
{q:"Dans Power BI, une relation en pointillés est…", c:["Une erreur","Inactive (activable avec USERELATIONSHIP)","Bidirectionnelle","Un-à-un"], a:1, e:"Typique des dimensions à rôles multiples."},
{q:"Colonne calculée vs mesure : une mesure…", c:["Est stockée ligne à ligne","Est calculée au moment de l'affichage selon le contexte de filtre","Ne fonctionne qu'en Power Query","Est en langage M"], a:1, e:"Préférer les mesures pour les agrégats."},
{q:"Où exclure les commandes ANNULEE dans Power BI ?", c:["Dans chaque visuel","Dans Power Query (filtre de ligne) ou à l'ETL","Dans le thème","Impossible"], a:1, e:"On nettoie en amont : ce ne sont pas des ventes."},
{q:"Pourquoi « Marquer comme table de dates » ?", c:["Pour l'esthétique","Pour que les fonctions de time intelligence fonctionnent correctement","Pour la sécurité","Pour créer des relations"], a:1, e:"Power BI utilise alors cette table pour SAMEPERIODLASTYEAR, TOTALYTD…"},
{q:"Pour trier « Nom_Mois » dans l'ordre chronologique :", c:["Tri alphabétique","Trier par colonne = Num_Mois","Créer une hiérarchie","Impossible"], a:1, e:"Outils de colonne → Trier par colonne."}
];

/* ---------- Flashcards ---------- */
const FLASH = [
["Granularité","Ce que représente exactement UNE ligne de la table de faits. Viser le grain le plus fin."],
["Dimension conforme","Dimension identique (clés, libellés) partagée par plusieurs faits → drill-across."],
["Dimension dégénérée","N° source (commande, facture, vol) gardé dans le fait, sans table de dimension."],
["Junk dimension","Dimension fourre-tout regroupant des indicateurs à faible cardinalité (statut, canal, paiement)."],
["Role-playing dimension","Une table physique utilisée plusieurs fois par un fait (date commande/livraison, aéroport départ/arrivée) via des alias."],
["Bridge table","Table de pont pour une relation N-N entre fait et dimension, avec un poids de pondération."],
["Factless fact table","Fait sans mesure (que des FK). Événements ou couverture. On compte."],
["Instantané périodique","Photo de l'état à intervalle régulier (stock fin de journée). Mesures souvent semi-additives."],
["Instantané cumulatif","Ligne mise à jour à chaque jalon d'un processus (commande → expédition → livraison)."],
["SCD 0","Valeur figée, jamais modifiée."],
["SCD 1","Écrasement (UPDATE). Pas d'historique. Corrections."],
["SCD 2","Nouvelle ligne + nouvelle SK, ancienne fermée. Historique complet. La référence."],
["SCD 3","Colonne actuelle + colonne précédente. Historique partiel."],
["Clé de substitution (surrogate key)","Entier technique généré par le DWH, PK de la dimension. Indépendante de la source, indispensable au SCD2."],
["Clé naturelle","Identifiant issu de la source (id_client), gardé en attribut pour que l'ETL retrouve la ligne."],
["Smart key de Dim_Temps","INT AAAAMMJJ, ex. 20260315."],
["Matrice en bus","Processus en lignes × dimensions en colonnes. Colonnes partagées = dimensions conformes."],
["Étoile","Dimensions dénormalisées reliées directement au fait. Simple et performant."],
["Flocon","Dimensions normalisées en sous-tables (hiérarchie). Seulement si tables volumineuses."],
["Constellation","Plusieurs faits partageant des dimensions."],
["Inmon (4 propriétés)","Orienté sujet, intégré, non volatile, historisé."],
["ODS","Operational Data Store : sas tampon d'intégration/validation avant le DWH."],
["Datamart","Sous-ensemble du DWH orienté un métier, avec agrégats."],
["ETL / ELT","ETL : transformer avant de charger (serveur dédié). ELT : charger brut puis transformer dans la cible."],
["CDC","Change Data Capture : détection non intrusive des changements dans la base source."],
["Drill-across","Analyse croisant deux faits via leurs dimensions conformes."],
["Médaillon","Bronze (brut) → Argent (nettoyé) → Or (métier, faits & dimensions)."],
["CALCULATE","Fonction DAX qui évalue une expression dans un contexte de filtre modifié."],
["Mesure vs colonne calculée","Mesure : calculée à l'affichage selon le contexte. Colonne : stockée ligne par ligne au rafraîchissement."],
["Power Query","Outil de préparation des données de Power BI (langage M) : nettoyer, typer, fusionner, filtrer."]
];

/* ---------- Jeux de classement ---------- */
const MEASURE_GAME = [
{m:"Quantité vendue", ctx:"FAIT_VENTES", a:"additive", e:"Flux : sommable partout."},
{m:"Montant HT", ctx:"FAIT_VENTES", a:"additive", e:"Le CA se somme sur tous les axes."},
{m:"Marge brute en €", ctx:"FAIT_VENTES", a:"additive", e:"Montant en € : additif."},
{m:"Taux de marge %", ctx:"FAIT_VENTES", a:"non", e:"Ratio : recalculer SUM(marge)/SUM(CA)."},
{m:"Prix unitaire TTC", ctx:"FAIT_VENTES", a:"non", e:"Sommer des prix n'a pas de sens."},
{m:"Remise %", ctx:"FAIT_VENTES", a:"non", e:"Pourcentage."},
{m:"Quantité en stock", ctx:"FAIT_STOCK", a:"semi", e:"Niveau : pas sommable sur le temps."},
{m:"Valeur du stock au prix d'achat", ctx:"FAIT_STOCK", a:"semi", e:"Même logique que la quantité en stock."},
{m:"Indicateur de rupture (0/1)", ctx:"FAIT_STOCK", a:"additive", e:"SUM = nombre de jours de rupture."},
{m:"Seuil d'alerte", ctx:"FAIT_STOCK", a:"non", e:"Paramètre : ni sommable ni moyennable utilement."},
{m:"Effectif du groupe", ctx:"FAIT_SEANCE (TP1)", a:"semi", e:"Photo répétée à chaque séance."},
{m:"Durée de la séance (h)", ctx:"FAIT_SEANCE (TP1)", a:"additive", e:"Volume d'heures."},
{m:"Taux d'occupation de la salle", ctx:"FAIT_SEANCE (TP1)", a:"non", e:"Ratio effectif/capacité."},
{m:"Capacité de l'avion", ctx:"FAIT_VOL (TP3)", a:"semi", e:"Répétée à chaque vol : pas sur le temps."},
{m:"Nombre de passagers", ctx:"FAIT_VOL (TP3)", a:"additive", e:"Flux."},
{m:"Retard au départ (min)", ctx:"FAIT_VOL (TP3)", a:"additive", e:"On cumule ou moyenne les minutes."},
{m:"Solde du compte bancaire", ctx:"Banque", a:"semi", e:"Exemple typique de semi-additivité."},
{m:"Nombre de billets (=1)", ctx:"FAIT_RESERVATION (TP3)", a:"additive", e:"Comptage."}
];

const SCD_GAME = [
{attr:"Segment client (Standard/Silver/Gold)", ctx:"Besoin : ventes par segment au moment de l'achat", a:"2", e:"« Au moment de » → historique complet."},
{attr:"Ville du client", ctx:"Besoin : ventes par ville au moment de l'achat", a:"2", e:"Déménagement à historiser."},
{attr:"Email du client", ctx:"Aucun besoin d'analyse", a:"1", e:"Écrasement."},
{attr:"Nom du produit (correction d'orthographe)", ctx:"Les corrections n'ont aucune valeur d'analyse", a:"1", e:"Écrasement."},
{attr:"Date de naissance", ctx:"Ne change jamais", a:"0", e:"Figée."},
{attr:"Région du magasin", ctx:"Besoin : ventes par région telle qu'au moment de la vente", a:"2", e:"Cas d'école du cours (Montpellier → Occitanie)."},
{attr:"Secteur commercial", ctx:"La direction veut comparer ancien secteur vs nouveau secteur", a:"3", e:"Colonne actuelle + précédente."},
{attr:"Catégorie du produit", ctx:"Reclassement lors de la refonte annuelle ; analyses dans le temps", a:"2", e:"Les ventes passées gardent leur catégorie d'origine."},
{attr:"Prix de vente catalogue", ctx:"Change plusieurs fois par an ; le prix payé est dans le fait", a:"1", e:"SCD2 ferait exploser la dimension."},
{attr:"Statut du professeur (vacataire/permanent)", ctx:"TP1 : charge historisée", a:"2", e:"Corrigé du TP1."},
{attr:"Montant d'un tarif aérien", ctx:"TP3 : le prix évolue, recettes passées à préserver", a:"2", e:"Corrigé du TP3."},
{attr:"Date d'ouverture du magasin", ctx:"Immuable", a:"0", e:"Figée."},
{attr:"Responsable du magasin", ctx:"Change parfois, aucun besoin d'analyse", a:"1", e:"Écrasement (type 3 si comparaison voulue)."},
{attr:"Opt-in newsletter", ctx:"Seul l'état courant compte", a:"1", e:"Écrasement."}
];
