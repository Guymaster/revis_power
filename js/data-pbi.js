/* =========================================================
   Power BI, DAX et SQL
   ========================================================= */

const PBI = `
<div class="callout">Power BI Desktop s'utilise <b>sans compte</b> en local (fichiers <code>.pbix</code>). Disponible sans compte : connexion aux fichiers/bases, Power Query, modélisation, relations, mesures DAX, rapports, export PDF. Nécessite un compte : publication sur le service, partage, actualisation planifiée, visuels AppSource, Copilot/Fabric. Fermer la fenêtre de connexion au démarrage ; vérifier <i>Fichier › Options › Paramètres régionaux</i> = Français (France).</div>

<h2>Le flux de travail en 6 étapes</h2>
<ol class="steps">
<li><b>Obtenir des données</b> : Accueil › Obtenir des données › Classeur Excel / Texte-CSV / SQL Server. Dans le Navigateur, cocher les tables puis <b>Transformer les données</b> (plutôt que Charger directement).</li>
<li><b>Power Query (préparer)</b> : typer, nettoyer, filtrer, fusionner → construire les tables de dimensions et de faits. Puis <b>Fermer et appliquer</b>.</li>
<li><b>Vue Modèle (relations)</b> : relier chaque dimension au fait en <b>1 → *</b>, filtrage <b>unique</b> (dimension → fait). Le modèle doit ressembler à une étoile.</li>
<li><b>Table de dates</b> : créer/importer Dim_Temps, <b>Marquer comme table de dates</b>, trier Nom_Mois par Num_Mois.</li>
<li><b>Mesures DAX</b> : CA, marge, N-1, panier moyen… dans une table de mesures dédiée.</li>
<li><b>Rapport</b> : visuels, segments, hiérarchies (drill-down), mise en page, puis <b>Enregistrer sous .pbix</b>.</li></ol>

<h2>Power Query : les transformations à connaître</h2>
<div class="table-wrap"><table>
<tr><th>Besoin</th><th>Manipulation</th><th>Équivalent DW</th></tr>
<tr><td>Changer les types</td><td>Clic sur l'icône du type de colonne / Transformer › Type de données</td><td>Nettoyage</td></tr>
<tr><td>Exclure les commandes ANNULEE</td><td>Filtre de colonne sur <code>statut</code> ≠ ANNULEE</td><td>Règle de gestion ETL</td></tr>
<tr><td>Aplatir Produit → Sous-catégorie → Catégorie</td><td>Accueil › <b>Fusionner des requêtes</b> (jointure externe gauche) puis développer les colonnes</td><td>Dénormaliser (étoile)</td></tr>
<tr><td>Joindre COMMANDE et LIGNE_COMMANDE</td><td>Fusionner sur id_commande</td><td>Construire le fait au grain ligne</td></tr>
<tr><td>Empiler deux fichiers de même structure</td><td><b>Ajouter des requêtes</b></td><td>UNION</td></tr>
<tr><td>Calculer montant HT</td><td>Ajouter une colonne › <b>Colonne personnalisée</b> : <code>[quantite]*[prix_unitaire_ttc]/(1+[taux_tva])</code></td><td>Mesure du fait</td></tr>
<tr><td>Remplacer client NULL</td><td>Remplacer les valeurs : null → -1</td><td>Membre inconnu</td></tr>
<tr><td>Créer la clé AAAAMMJJ</td><td>Colonne personnalisée : <code>Date.Year([date])*10000 + Date.Month([date])*100 + Date.Day([date])</code></td><td>Smart key Dim_Temps</td></tr>
<tr><td>Supprimer les doublons</td><td>Clic droit › Supprimer les doublons</td><td>Qualité</td></tr>
<tr><td>Colonnes ↔ lignes</td><td>Pivoter / <b>Dépivoter</b> les colonnes</td><td>Normaliser un tableau croisé Excel</td></tr>
<tr><td>Grouper</td><td>Accueil › Regrouper par</td><td>Agrégat (attention à ne pas perdre le grain)</td></tr>
<tr><td>Copie indépendante vs liée</td><td><b>Dupliquer</b> (copie des étapes) / <b>Référencer</b> (part du résultat d'une autre requête)</td><td>—</td></tr></table></div>
<p>Chaque transformation devient une <b>étape appliquée</b> (panneau de droite), écrite en <b>langage M</b> (Affichage › Éditeur avancé). On peut supprimer/réordonner les étapes.</p>

<h2>Modélisation dans Power BI</h2>
<ul>
<li><b>Cardinalité</b> : un-à-plusieurs (1 côté dimension, * côté fait). Éviter le plusieurs-à-plusieurs.</li>
<li><b>Direction du filtre croisé</b> : <b>unique</b> (la dimension filtre le fait). Le bidirectionnel crée des ambiguïtés.</li>
<li><b>Une seule relation active</b> entre deux tables. Les autres (pointillés) sont <b>inactives</b> → <code>USERELATIONSHIP</code> dans une mesure. Cas typique : dimension à rôles multiples (date commande / date livraison). Alternative : dupliquer la dimension en deux requêtes référencées.</li>
<li><b>Masquer</b> les clés techniques (sk_…) dans la vue rapport ; ranger les mesures dans une table « _Mesures ».</li>
<li><b>Hiérarchies</b> : clic droit sur Categorie › Créer une hiérarchie, puis ajouter Sous-catégorie, Produit → drill-down dans les visuels.</li>
<li><b>Trier par colonne</b> : Nom_Mois trié par Num_Mois, Nom_Jour par Num_Jour.</li>
<li><b>Catégorie de données</b> : Ville / Code postal / Région → pour les cartes géographiques.</li>
<li><b>Format</b> : € avec 2 décimales, % pour les taux.</li>
<li>Désactiver <i>Options › Chargement des données › Date/heure automatique</i> quand on a sa propre table de dates.</li></ul>

<h2>Visuels et interactions</h2>
<div class="table-wrap"><table>
<tr><th>Question</th><th>Visuel conseillé</th></tr>
<tr><td>Un KPI (CA total, panier moyen)</td><td>Carte / Carte à plusieurs lignes / KPI (avec objectif)</td></tr>
<tr><td>Évolution dans le temps, N vs N-1</td><td>Graphique en courbes (2 mesures) ou histogramme groupé</td></tr>
<tr><td>Comparer des catégories (CA par canal)</td><td>Histogramme / graphique à barres</td></tr>
<tr><td>Part d'un tout (paiement)</td><td>Anneau (peu de valeurs)</td></tr>
<tr><td>Détail croisé (magasin × mois)</td><td>Matrice (avec drill-down sur hiérarchie)</td></tr>
<tr><td>Géographie (région, ville)</td><td>Carte / Carte choroplèthe</td></tr>
<tr><td>Filtrer tout le rapport</td><td>Segment (slicer) : année, région, canal</td></tr></table></div>
<ul><li>Filtres : niveau <b>visuel</b>, <b>page</b>, <b>toutes les pages</b>.</li>
<li>Format › <b>Modifier les interactions</b> : filtrer / mettre en surbrillance / aucune.</li>
<li><b>Extraction (drill-through)</b> : page de détail produit accessible par clic droit.</li>
<li>Info-bulles, signets, thème, export PDF (Fichier › Exporter).</li></ul>

<h2>Pièges fréquents en TP</h2>
<div class="callout warn"><ul>
<li>Totaux faux / identiques sur chaque ligne → <b>relation manquante</b> ou mauvaise direction.</li>
<li>Chiffres en double → relation plusieurs-à-plusieurs ou grain mélangé.</li>
<li>Stock énorme sur un mois → SUM d'une mesure <b>semi-additive</b> : utiliser la moyenne ou la dernière valeur.</li>
<li>N-1 vide → table de dates non marquée, ou dates manquantes (la table doit être <b>continue</b>).</li>
<li>Mois triés alphabétiquement → Trier par colonne.</li>
<li>Somme d'un taux → créer une <b>mesure</b> ratio avec DIVIDE.</li>
<li>Virgule décimale / dates mal lues → paramètres régionaux Français ; typer dans Power Query.</li></ul></div>`;

const DAX_INTRO = `
<p><b>Mesure</b> : calculée à l'affichage selon le <b>contexte de filtre</b> (segments, lignes de la matrice…). <b>Colonne calculée</b> : calculée une fois par ligne au rafraîchissement (contexte de ligne), stockée. → Pour les agrégats, toujours des <b>mesures</b>.</p>
<ul><li><code>SUM / AVERAGE / MIN / MAX / COUNTROWS / DISTINCTCOUNT</code> : agrégations simples.</li>
<li><code>SUMX(table, expression)</code> : itérateur (calcule ligne par ligne puis somme).</li>
<li><code>CALCULATE(expression, filtre1, …)</code> : évalue dans un contexte de filtre modifié. La fonction clé.</li>
<li><code>DIVIDE(a, b)</code> : division sûre (pas d'erreur si b = 0).</li>
<li><code>RELATED(col)</code> : récupère une colonne de la dimension dans une colonne calculée du fait.</li>
<li><code>ALL / REMOVEFILTERS</code> : ignorer des filtres (parts, %).</li>
<li>Time intelligence : <code>SAMEPERIODLASTYEAR, DATEADD, TOTALYTD, DATESMTD, LASTDATE, ENDOFMONTH</code> (nécessite une table de dates marquée).</li>
<li><code>USERELATIONSHIP</code> : activer une relation inactive dans une mesure.</li>
<li><code>VAR … RETURN</code> : variables pour lisibilité.</li></ul>`;

const DAX = [
{t:"Table de dates en DAX (si pas de Dim_Temps)", b:"Prérequis besoins 1, 7", c:`Dim_Temps =
ADDCOLUMNS (
    CALENDAR ( DATE ( 2023, 1, 1 ), DATE ( 2026, 12, 31 ) ),
    "sk_date",     YEAR ( [Date] ) * 10000 + MONTH ( [Date] ) * 100 + DAY ( [Date] ),
    "Annee",       YEAR ( [Date] ),
    "Trimestre",   "T" & QUARTER ( [Date] ),
    "Num_Mois",    MONTH ( [Date] ),
    "Nom_Mois",    FORMAT ( [Date], "mmmm" ),
    "Semaine",     WEEKNUM ( [Date], 21 ),          -- semaine ISO
    "Num_Jour",    WEEKDAY ( [Date], 2 ),           -- 1 = lundi
    "Nom_Jour",    FORMAT ( [Date], "dddd" ),
    "Est_WeekEnd", IF ( WEEKDAY ( [Date], 2 ) >= 6, 1, 0 )
)`, e:"Puis : Outils de table › Marquer comme table de dates. Est_Jour_Ferie s'obtient en fusionnant JOUR_FERIE dans Power Query (ou LOOKUPVALUE)."},
{t:"Mesures de base", b:"Besoin 1", c:`CA HT        = SUM ( FAIT_VENTES[montant_ht] )
Quantite     = SUM ( FAIT_VENTES[quantite] )
Cout achat   = SUM ( FAIT_VENTES[cout_achat_ht] )
Marge brute  = [CA HT] - [Cout achat]
Taux marge % = DIVIDE ( [Marge brute], [CA HT] )`, e:"Le taux est non additif : on le calcule à partir de sommes, jamais en sommant des taux."},
{t:"Comparaison N / N-1", b:"Besoin 1", c:`CA HT N-1 =
CALCULATE ( [CA HT], SAMEPERIODLASTYEAR ( Dim_Temps[Date] ) )

Evol CA % = DIVIDE ( [CA HT] - [CA HT N-1], [CA HT N-1] )

CA cumul annuel = TOTALYTD ( [CA HT], Dim_Temps[Date] )`, e:"Visuel : courbe avec Mois en axe, CA HT et CA HT N-1 en valeurs ; segment sur l'année."},
{t:"Ventes par hiérarchie produit", b:"Besoin 2", c:`-- Aucune mesure nouvelle : [CA HT] dans une matrice
-- Lignes = hiérarchie Rayon > Catégorie > Sous-catégorie > Produit
Part du CA % =
DIVIDE ( [CA HT], CALCULATE ( [CA HT], ALL ( Dim_Produit ) ) )`, e:"ALL retire le filtre produit pour calculer le total au dénominateur."},
{t:"Région au moment de la vente", b:"Besoin 3", c:`-- Pas de DAX particulier : c'est la MODÉLISATION qui répond.
-- Dim_Magasin est en SCD2 ; FAIT_VENTES[sk_magasin] pointe la version
-- valable à la date de vente => Dim_Magasin[region] est la région d'alors.

CA région actuelle =      -- si on voulait la vue "organisation actuelle"
CALCULATE ( [CA HT], Dim_Magasin[est_actif] = 1 )   -- ⚠ faux pour l'historique`, e:"Point à verbaliser à l'oral : avec SCD2, la jointure par sk donne automatiquement la bonne région."},
{t:"Suivi Silver → Gold", b:"Besoin 4", c:`Nb clients passés Gold =
VAR ClientsGold   = CALCULATETABLE ( VALUES ( Dim_Client[id_client] ),
                                     Dim_Client[segment] = "Gold" )
VAR ClientsSilver = CALCULATETABLE ( VALUES ( Dim_Client[id_client] ),
                                     Dim_Client[segment] = "Silver" )
RETURN COUNTROWS ( INTERSECT ( ClientsGold, ClientsSilver ) )`, e:"Grâce au SCD2, un même id_client a une version Silver et une version Gold."},
{t:"Canal et mode de paiement", b:"Besoin 5", c:`Nb commandes = DISTINCTCOUNT ( FAIT_VENTES[id_commande] )
-- Histogramme groupé : axe = Dim_Indicateur[canal],
-- légende = Dim_Indicateur[mode_paiement], valeur = [CA HT]`, e:"La junk dimension fournit canal et paiement comme axes."},
{t:"Promotions", b:"Besoin 6", c:`CA avec promo =
CALCULATE ( [CA HT], Dim_Promotion[sk_promotion] <> -1 )

CA sans promo =
CALCULATE ( [CA HT], Dim_Promotion[sk_promotion] = -1 )

Taux remise moyen =
DIVIDE ( SUM ( FAIT_VENTES[montant_remise_ht] ),
         [CA HT] + SUM ( FAIT_VENTES[montant_remise_ht] ) )`, e:"La ligne -1 « Sans promotion » rend le filtre simple. Taux pondéré, pas AVERAGE(remise_pct)."},
{t:"Fériés, week-ends, vacances", b:"Besoin 7", c:`CA week-end  = CALCULATE ( [CA HT], Dim_Temps[Est_WeekEnd] = 1 )
CA férié     = CALCULATE ( [CA HT], Dim_Temps[Est_Jour_Ferie] = 1 )
CA vacances  = CALCULATE ( [CA HT], Dim_Temps[Est_Vacances] = 1 )

CA moyen / jour =
AVERAGEX ( VALUES ( Dim_Temps[Date] ), [CA HT] )`, e:"Comparer le CA moyen par jour (férié vs normal), pas le total : il y a beaucoup moins de jours fériés."},
{t:"Stock (semi-additif)", b:"Besoin 8", c:`Stock fin de période =
CALCULATE ( SUM ( FAIT_STOCK[qte_en_stock] ),
            LASTDATE ( Dim_Temps[Date] ) )

Valeur stock fin période =
CALCULATE ( SUM ( FAIT_STOCK[valeur_stock_achat] ),
            LASTDATE ( Dim_Temps[Date] ) )

Nb jours rupture = SUM ( FAIT_STOCK[est_en_rupture] )   -- additive`, e:"Sur un mois, SUM(qte_en_stock) compterait 30 fois le même stock. LASTDATE prend la dernière photo (attention : si le dernier jour n'a pas de ligne, utiliser LASTNONBLANK)."},
{t:"Taux de couverture", b:"Besoin 9", c:`Stock moyen =
AVERAGEX ( VALUES ( Dim_Temps[Date] ),
           CALCULATE ( SUM ( FAIT_STOCK[qte_en_stock] ) ) )

Ventes moy / jour =
AVERAGEX ( VALUES ( Dim_Temps[Date] ), [Quantite] )

Taux couverture (jours) = DIVIDE ( [Stock moyen], [Ventes moy / jour] )`, e:"Drill-across : la mesure croise FAIT_STOCK et FAIT_VENTES via les dimensions conformes Temps, Produit, Magasin."},
{t:"Panier moyen", b:"Besoin 10", c:`Panier moyen =
DIVIDE ( [CA HT], DISTINCTCOUNT ( FAIT_VENTES[id_commande] ) )`, e:"id_commande = dimension dégénérée. Matrice : lignes = magasin, colonnes = mois."}
];

const SQL = `
<h2>DIM_CLIENT (SCD2)</h2>
<pre><code>CREATE TABLE DIM_CLIENT (
    sk_client            INT           NOT NULL PRIMARY KEY,   -- clé de substitution
    id_client            INT           NOT NULL,               -- clé naturelle (source)
    civilite             VARCHAR(10),
    nom                  VARCHAR(50),
    prenom               VARCHAR(50),
    email                VARCHAR(100),
    date_naissance       DATE,
    tranche_age          VARCHAR(20),
    adresse              VARCHAR(150),
    code_postal          VARCHAR(10),
    ville                VARCHAR(60),
    segment              VARCHAR(20),                          -- Standard / Silver / Gold
    date_inscription     DATE,
    optin_newsletter     SMALLINT,
    -- colonnes techniques SCD2
    date_debut_validite  DATE          NOT NULL,
    date_fin_validite    DATE          NOT NULL DEFAULT '9999-12-31',
    est_actif            SMALLINT      NOT NULL DEFAULT 1
);
-- membre inconnu
INSERT INTO DIM_CLIENT (sk_client, id_client, nom, segment, date_debut_validite)
VALUES (-1, -1, 'Client non identifié', 'Non renseigné', '1900-01-01');</code></pre>

<h2>FAIT_VENTES</h2>
<pre><code>CREATE TABLE FAIT_VENTES (
    sk_date            INT           NOT NULL REFERENCES DIM_TEMPS(sk_date),
    sk_heure           INT           NOT NULL REFERENCES DIM_HEURE(sk_heure),
    sk_produit         INT           NOT NULL REFERENCES DIM_PRODUIT(sk_produit),
    sk_magasin         INT           NOT NULL REFERENCES DIM_MAGASIN(sk_magasin),
    sk_client          INT           NOT NULL REFERENCES DIM_CLIENT(sk_client),
    sk_employe         INT           NOT NULL REFERENCES DIM_EMPLOYE(sk_employe),
    sk_promotion       INT           NOT NULL REFERENCES DIM_PROMOTION(sk_promotion),
    sk_indicateur      INT           NOT NULL REFERENCES DIM_INDICATEUR_VENTE(sk_indicateur),
    id_commande        INT           NOT NULL,      -- dimension dégénérée
    num_ligne          INT           NOT NULL,      -- dimension dégénérée
    quantite           INT           NOT NULL,
    prix_unitaire_ttc  DECIMAL(10,2),               -- non additive
    montant_ttc        DECIMAL(12,2),
    montant_ht         DECIMAL(12,2),
    montant_remise_ht  DECIMAL(12,2),
    cout_achat_ht      DECIMAL(12,2),               -- figé au moment de la vente
    marge_brute        DECIMAL(12,2),
    PRIMARY KEY (id_commande, num_ligne)            -- grain = une ligne de commande
);</code></pre>
<p>La PK peut aussi être une clé technique <code>sk_vente</code>. Toutes les FK sont NOT NULL (lignes -1 dans les dimensions).</p>

<h2>Besoin 3 — ventes par magasin et région (au moment de la vente), année 2025</h2>
<pre><code>SELECT m.region,
       m.nom                          AS magasin,
       SUM(f.montant_ht)              AS ca_ht,
       SUM(f.quantite)                AS quantite,
       SUM(f.marge_brute)             AS marge_brute
FROM   FAIT_VENTES f
JOIN   DIM_MAGASIN m ON m.sk_magasin = f.sk_magasin   -- version SCD2 valable à la date de vente
JOIN   DIM_TEMPS   t ON t.sk_date    = f.sk_date
WHERE  t.annee = 2025                                  -- ou f.sk_date BETWEEN 20250101 AND 20251231
GROUP  BY m.region, m.nom
ORDER  BY m.region, ca_ht DESC;</code></pre>
<div class="callout ok">Pas de filtre <code>est_actif = 1</code> ! On joint par la SK stockée dans le fait : c'est elle qui « se souvient » de la région du moment. Filtrer sur la version active donnerait l'organisation actuelle (et perdrait les ventes des anciennes versions).</div>

<h2>Stock moyen par catégorie — mars 2026</h2>
<pre><code>SELECT categorie,
       AVG(stock_jour) AS stock_moyen
FROM (
    SELECT p.categorie,
           f.sk_date,
           SUM(f.qte_en_stock) AS stock_jour     -- 1) somme OK sur produits/magasins pour un même jour
    FROM   FAIT_STOCK  f
    JOIN   DIM_PRODUIT p ON p.sk_produit = f.sk_produit
    JOIN   DIM_TEMPS   t ON t.sk_date    = f.sk_date
    WHERE  t.annee = 2026 AND t.mois = 3
    GROUP  BY p.categorie, f.sk_date
) s
GROUP BY categorie;                               -- 2) moyenne sur le temps (semi-additivité)</code></pre>
<div class="callout warn"><b>Piège :</b> <code>AVG(f.qte_en_stock)</code> directement donnerait le stock moyen <i>par produit×magasin</i>, pas par catégorie ; <code>SUM</code> sur le mois compterait 31 fois le stock. Il faut d'abord <b>sommer par jour</b>, puis <b>moyenner sur les jours</b>.</div>

<h2>Bonus : ETL SCD2 (Silver → Gold) en SQL</h2>
<pre><code>-- 1) fermer la version courante si le segment a changé
UPDATE DIM_CLIENT d
SET    date_fin_validite = :date_chgt - INTERVAL '1' DAY,
       est_actif = 0
WHERE  d.id_client = :id AND d.est_actif = 1 AND d.segment &lt;&gt; :nouveau_segment;

-- 2) insérer la nouvelle version
INSERT INTO DIM_CLIENT (sk_client, id_client, nom, prenom, ville, segment,
                        date_debut_validite, date_fin_validite, est_actif)
SELECT NEXT VALUE FOR seq_client, id_client, nom, prenom, ville, :nouveau_segment,
       :date_chgt, DATE '9999-12-31', 1
FROM   DIM_CLIENT
WHERE  id_client = :id AND date_fin_validite = :date_chgt - INTERVAL '1' DAY;

-- 3) lookup lors du chargement des faits
SELECT sk_client FROM DIM_CLIENT
WHERE  id_client = :id_client_source
AND    :date_vente BETWEEN date_debut_validite AND date_fin_validite;</code></pre>

<h2>Générer DIM_TEMPS (CTE récursive)</h2>
<pre><code>WITH RECURSIVE jours(d) AS (
    SELECT DATE '2015-01-01'
    UNION ALL
    SELECT d + INTERVAL '1' DAY FROM jours WHERE d &lt; DATE '2035-12-31'
)
INSERT INTO DIM_TEMPS (sk_date, date_complete, annee, mois, jour_du_mois, est_weekend, est_jour_ferie, nom_jour_ferie)
SELECT EXTRACT(YEAR FROM d)*10000 + EXTRACT(MONTH FROM d)*100 + EXTRACT(DAY FROM d),
       d, EXTRACT(YEAR FROM d), EXTRACT(MONTH FROM d), EXTRACT(DAY FROM d),
       CASE WHEN EXTRACT(ISODOW FROM d) IN (6,7) THEN 1 ELSE 0 END,
       CASE WHEN jf.date_ferie IS NOT NULL THEN 1 ELSE 0 END,
       COALESCE(jf.libelle, 'N/A')
FROM   jours
LEFT JOIN JOUR_FERIE jf ON jf.date_ferie = jours.d;</code></pre>`;
