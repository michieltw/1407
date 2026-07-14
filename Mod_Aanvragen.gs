// ==========================================
// 📩 MOD_AANVRAGEN.GS - Aanvragen & Transfers
// ==========================================

var Mod_Aanvragen = {

  voegAanvraagToe: function(data) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.AANVRAGEN);
    const datum = new Date().toLocaleDateString('nl-NL');

    sheet.appendRow([Utilities.getUuid(), datum, data.userId, data.teamId, data.positie, data.rugnummer, 'Open']);
    return "✅ Aanvraag succesvol verstuurd naar het team!";
  },

  haalOpenAanvragenOp: function() {
    const db = getDatabase();
    const aData = db.getSheetByName(CONFIG.TABS.AANVRAGEN).getDataRange().getDisplayValues();
    const uData = db.getSheetByName(CONFIG.TABS.USERS).getDataRange().getDisplayValues();
    const tData = db.getSheetByName(CONFIG.TABS.TEAMS).getDataRange().getDisplayValues();

    // Maak vertaal-woordenboeken voor ID -> Naam
    let users = {};
    for(let i = 1; i < uData.length; i++) users[uData[i][0]] = uData[i][1];

    let teams = {};
    for(let i = 1; i < tData.length; i++) teams[tData[i][0]] = tData[i][1];

    let resultaat = [];
    for(let i = 1; i < aData.length; i++) {
      if(aData[i][6] === 'Open') {
        resultaat.push({
          id: aData[i][0],
          datum: aData[i][1],
          userName: users[aData[i][2]] || 'Onbekend',
          teamName: teams[aData[i][3]] || 'Onbekend',
          positie: aData[i][4],
          rugnummer: aData[i][5]
        });
      }
    }
    return resultaat;
  },

  verwerkAanvraag: function(data) {
    const db = getDatabase();
    const aSheet = db.getSheetByName(CONFIG.TABS.AANVRAGEN);
    const aData = aSheet.getDataRange().getValues();

    for(let i = 1; i < aData.length; i++) {
      if(aData[i][0] === data.aanvraagId) {
        // Update de status in de Aanvragen sheet
        aSheet.getRange(i + 1, 7).setValue(data.actie);

        // Als goedgekeurd, voeg speler direct toe aan het Roster
        if(data.actie === 'Goedgekeurd') {
          const rSheet = db.getSheetByName(CONFIG.TABS.ROSTERS);
          // Roster structuur: Roster_ID, Team_ID, User_ID, Positie, Rugnummer, Status
          rSheet.appendRow([Utilities.getUuid(), aData[i][3], aData[i][2], aData[i][4], aData[i][5], 'Actief']);
          return "✅ Aanvraag goedgekeurd en speler is toegevoegd aan het roster!";
        }

        return "❌ Aanvraag succesvol afgewezen.";
      }
    }
    return "⚠️ Aanvraag niet gevonden.";
  }
};
