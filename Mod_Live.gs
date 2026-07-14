// ==========================================
// 🔴 MOD_LIVE.GS - Live Tracker Module
// ==========================================

var Mod_Live = {

  voegGeavanceerdEventToe: function(payload) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.EVENTS);
    sheet.appendRow([Utilities.getUuid(), payload.wedstrijdId, payload.minuut, payload.type, payload.data, 'Advanced']);
    return "✅ Event opgeslagen in sheet!";
  },

  finalizeWedstrijd: function(payload) {
    const db = getDatabase();
    const vSheet = db.getSheetByName(CONFIG.TABS.VERSLAGEN);
    vSheet.appendRow([Utilities.getUuid(), payload.wedstrijdId, payload.uitslag, JSON.stringify(payload.stats), JSON.stringify(payload.settings), JSON.stringify(payload.signoff)]);

    const wSheet = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN);
    const wData = wSheet.getDataRange().getValues();
    for(let i = 1; i < wData.length; i++) {
      if(wData[i][0] === payload.wedstrijdId) {
        wSheet.getRange(i + 1, 7).setValue('Gespeeld');
        wSheet.getRange(i + 1, 8).setValue(payload.uitslag);
        break;
      }
    }
    return "✅ Wedstrijd afgerond en verslag opgeslagen!";
  },

  // HIER DE NIEUWE TOEVOEGING: Real-time data berekenen
  haalLiveMatchData: function(wedstrijdId) {
    const db = getDatabase();
    const eSheet = db.getSheetByName(CONFIG.TABS.EVENTS);
    let events = [];
    let stats = {
      HOME: { score: 0, shots: 0, saves: 0, faceoffs: 0, penalties: 0 },
      AWAY: { score: 0, shots: 0, saves: 0, faceoffs: 0, penalties: 0 }
    };

    if (eSheet) {
      const eData = eSheet.getDataRange().getValues();
      for (let i = 1; i < eData.length; i++) {
        if (eData[i][1] === wedstrijdId) {
          let type = eData[i][3];
          let payload = {};
          try { payload = JSON.parse(eData[i][4]); } catch(e) {}

          events.push({ minuut: eData[i][2], type: type, payload: payload });

          let teamKey = payload.team;
          if (teamKey === 'HOME' || teamKey === 'AWAY') {
            let oppKey = teamKey === 'HOME' ? 'AWAY' : 'HOME';
            if (type === 'GOAL') { stats[teamKey].score++; stats[teamKey].shots++; }
            if (type === 'SHOT') { stats[teamKey].shots++; stats[oppKey].saves++; }
            if (type === 'PENALTY') { stats[teamKey].penalties++; }
            if (type === 'FACEOFF_WON') { stats[teamKey].faceoffs++; }
          }
        }
      }
    }

    let status = 'Live';
    const wSheet = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN);
    if(wSheet) {
       const wData = wSheet.getDataRange().getValues();
       for(let i=1; i<wData.length; i++) {
          if(wData[i][0] === wedstrijdId) {
             if(wData[i][6] === 'Gespeeld') status = 'Afgelopen';
             break;
          }
       }
    }

    return { stats: stats, events: events.reverse(), status: status };
  }
};
