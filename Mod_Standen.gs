// ==========================================
// 📊 MOD_STANDEN.GS - Standen & Statistieken
// ==========================================

var Mod_Standen = {

  haalStandenOp: function(competitieId) {
    const db = getDatabase();
    const tData = db.getSheetByName(CONFIG.TABS.TEAMS).getDataRange().getDisplayValues();
    const wData = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN).getDataRange().getDisplayValues();

    let standen = {};

    // 1. Zoek alle teams in deze competitie en zet ze op 0
    for(let i = 1; i < tData.length; i++) {
      if(tData[i][4] === competitieId) {
        standen[tData[i][0]] = {
          naam: tData[i][1], afkorting: tData[i][2], kleur: tData[i][3],
          gp: 0, w: 0, l: 0, t: 0, pts: 0, gf: 0, ga: 0
        };
      }
    }

    // 2. Verwerk de uitslagen van alle gespeelde wedstrijden
    for(let i = 1; i < wData.length; i++) {
      // Index: 1=Comp_ID, 4=Thuis_ID, 5=Uit_ID, 6=Status, 7=Uitslag
      if(wData[i][1] === competitieId && wData[i][6] === 'Gespeeld') {
        let thuisId = wData[i][4];
        let uitId = wData[i][5];
        let uitslag = wData[i][7].split(' - ');

        if(uitslag.length === 2 && standen[thuisId] && standen[uitId]) {
          let goalsThuis = parseInt(uitslag[0]);
          let goalsUit = parseInt(uitslag[1]);

          standen[thuisId].gp++; standen[uitId].gp++;
          standen[thuisId].gf += goalsThuis; standen[thuisId].ga += goalsUit;
          standen[uitId].gf += goalsUit; standen[uitId].ga += goalsThuis;

          // Puntenverdeling (3 voor winst, 1 voor gelijkspel)
          if(goalsThuis > goalsUit) {
            standen[thuisId].w++; standen[thuisId].pts += 3;
            standen[uitId].l++;
          } else if(goalsUit > goalsThuis) {
            standen[uitId].w++; standen[uitId].pts += 3;
            standen[thuisId].l++;
          } else {
            standen[thuisId].t++; standen[thuisId].pts += 1;
            standen[uitId].t++; standen[uitId].pts += 1;
          }
        }
      }
    }

    // 3. Zet om naar een lijst en sorteer op Punten (en daarna Doelsaldo)
    let klassement = Object.values(standen);
    klassement.sort((a, b) => {
      if(b.pts !== a.pts) return b.pts - a.pts;
      return (b.gf - b.ga) - (a.gf - a.ga);
    });

    return klassement;
  }

};
