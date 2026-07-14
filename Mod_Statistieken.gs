// ==========================================
// 📈 MOD_STATISTIEKEN.GS - Topscorers, PIM & Goalies
// ==========================================

var Mod_Statistieken = {

  // HIER EEN TOEVOEGING: parameter competitieId toegevoegd
  haalSpelerStatsOp: function(competitieId) {
    const db = getDatabase();

    // HIER EEN TOEVOEGING: Maak een lookup-table (Map) om Wedstrijd_ID aan Competitie_ID te koppelen
    let matchLeagueMap = {};
    const wSheet = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN);
    if (wSheet) {
      const wData = wSheet.getDataRange().getValues();
      for(let i = 1; i < wData.length; i++) {
        matchLeagueMap[wData[i][0]] = wData[i][1]; // ID -> Competitie_ID
      }
    }

    const eSheet = db.getSheetByName(CONFIG.TABS.EVENTS);
    if(!eSheet) return { skaters: [], goalies: [] };

    const eData = eSheet.getDataRange().getValues();
    let spelers = {};

    function getSpeler(naam) {
      if(!naam || naam === 'Onbekend' || naam === 'None' || naam === '' || naam === 'Unassisted' || naam === 'Empty Net') return null;
      let cleanNaam = naam.trim();

      if(!spelers[cleanNaam]) {
        spelers[cleanNaam] = { naam: cleanNaam, g: 0, a: 0, pts: 0, pim: 0, saves: 0, ga: 0, shotsAgainst: 0 };
      }
      return spelers[cleanNaam];
    }

    for(let i = 1; i < eData.length; i++) {
      if(eData[i][5] === 'Advanced') {

        // HIER EEN TOEVOEGING: Controleer of we moeten filteren op competitie
        let wedId = eData[i][1];
        if (competitieId && matchLeagueMap[wedId] !== competitieId) {
          continue; // Sla dit event over als de wedstrijd niet in de gevraagde competitie valt
        }

        try {
          let type = eData[i][3];
          let payload = JSON.parse(eData[i][4]);

          if(type === 'GOAL') {
            let scorer = getSpeler(payload.scorer);
            if(scorer) { scorer.g++; scorer.pts++; }

            if(payload.assistText && payload.assistText.includes('Ast:')) {
              let astPart = payload.assistText.replace('Ast:', '').trim();
              let assisters = astPart.split(',');
              assisters.forEach(ast => {
                let assister = getSpeler(ast);
                if(assister) { assister.a++; assister.pts++; }
              });
            }

            let goalieTegen = getSpeler(payload.goalieTegen);
            if(goalieTegen) { goalieTegen.ga++; goalieTegen.shotsAgainst++; }
          }
          else if(type === 'PENALTY') {
            let penPlayer = getSpeler(payload.player);
            if(penPlayer) { penPlayer.pim += 2; }
          }
          else if(type === 'SHOT') {
            let goalie = getSpeler(payload.goalie);
            if(goalie) { goalie.saves++; goalie.shotsAgainst++; }
          }
        } catch (err) {
          console.log("Kon event niet parsen op rij " + i);
        }
      }
    }

    let skaters = Object.values(spelers).filter(p => p.pts > 0 || p.pim > 0 || p.g > 0);
    skaters.sort((a, b) => {
      if(b.pts !== a.pts) return b.pts - a.pts;
      if(b.g !== a.g) return b.g - a.g;
      return a.naam.localeCompare(b.naam);
    });

    let goalies = Object.values(spelers).filter(p => p.shotsAgainst > 0);
    goalies.forEach(g => {
       g.svPct = g.shotsAgainst > 0 ? ((g.saves / g.shotsAgainst) * 100).toFixed(1) : 0;
    });
    goalies.sort((a, b) => {
      if(b.svPct !== a.svPct) return b.svPct - a.svPct;
      if(b.saves !== a.saves) return b.saves - a.saves;
      return a.naam.localeCompare(b.naam);
    });

    return { skaters: skaters, goalies: goalies };
  }
};
