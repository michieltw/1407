// ==========================================
// 📋 MOD_VERSLAGEN.GS - Boxscore & Historie
// ==========================================

var Mod_Verslagen = {

  haalBoxscoreOp: function(wedstrijdId) {
    const db = getDatabase();

    // 1. Haal verslag info op (Stats, Uitslag, Signoff)
    let verslag = null;
    const vSheet = db.getSheetByName(CONFIG.TABS.VERSLAGEN);
    if(vSheet) {
      const vData = vSheet.getDataRange().getValues();
      for(let i = 1; i < vData.length; i++) {
        if(vData[i][1] === wedstrijdId) {
          verslag = {
            uitslag: vData[i][2],
            stats: JSON.parse(vData[i][3]),
            settings: JSON.parse(vData[i][4]),
            signoff: JSON.parse(vData[i][5])
          };
          break;
        }
      }
    }

    // 2. Haal Play-by-Play events op
    let events = [];
    const eSheet = db.getSheetByName(CONFIG.TABS.EVENTS);
    if(eSheet) {
      const eData = eSheet.getDataRange().getValues();
      for(let i = 1; i < eData.length; i++) {
        if(eData[i][1] === wedstrijdId) {
          let payload = {};
          try { payload = JSON.parse(eData[i][4]); } catch(e) {}
          events.push({
            minuut: eData[i][2],
            type: eData[i][3],
            payload: payload
          });
        }
      }
    }

    return { verslag: verslag, events: events };
  }
};
