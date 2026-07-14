// ==========================================
// 🏒 MOD_LIJNEN.GS - Formaties & Lijnen
// ==========================================

var Mod_Lijnen = {

  haalLijnenOp: function(teamId) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.LIJNEN);
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    for(let i = 1; i < data.length; i++) {
      if(data[i][0] === teamId) {
        return JSON.parse(data[i][2]);
      }
    }
    return null; // Geen lijnen gevonden voor dit team
  },

  slaLijnenOp: function(data) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.LIJNEN);
    const datum = new Date().toLocaleDateString('nl-NL') + ' ' + new Date().toLocaleTimeString('nl-NL');
    const dbData = sheet.getDataRange().getValues();

    let rijIndex = -1;
    // Zoek of dit team al lijnen heeft
    for(let i = 1; i < dbData.length; i++) {
      if(dbData[i][0] === data.teamId) {
        rijIndex = i + 1;
        break;
      }
    }

    const lijnenJSON = JSON.stringify(data.lijnen);

    if(rijIndex > -1) {
      // Overschrijf bestaande
      sheet.getRange(rijIndex, 2).setValue(datum);
      sheet.getRange(rijIndex, 3).setValue(lijnenJSON);
    } else {
      // Maak nieuwe aan
      sheet.appendRow([data.teamId, datum, lijnenJSON]);
    }

    return "✅ Lijnen en formaties succesvol opgeslagen!";
  }
};
