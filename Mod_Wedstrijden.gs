// ==========================================
// 📅 MOD_WEDSTRIJDEN.GS - Kalendermodule
// ==========================================

var Mod_Wedstrijden = {

  // HIER DE TOEVOEGING: Check of de ingelogde Google User een Beheerder is
  checkIsBeheerder: function() {
    try {
      const db = getDatabase();
      const userEmail = Session.getActiveUser().getEmail();
      if (!userEmail) return false;

      const uSheet = db.getSheetByName(CONFIG.TABS.USERS);
      if(!uSheet) return false;

      const uData = uSheet.getDataRange().getValues();
      for(let i = 1; i < uData.length; i++) {
        // Kolom 3 (index 2) is Email, Kolom 4 (index 3) is Rol
        if(uData[i][2] === userEmail && (uData[i][3] === 'Beheerder' || uData[i][3] === 'Admin')) {
          return true;
        }
      }
      return false;
    } catch(e) {
      return false;
    }
  },

  voegWedstrijdToe: function(data) {
    // Harde check op de backend voordat we wegschrijven
    if(!this.checkIsBeheerder()) {
       return "❌ Fout: Je hebt geen beheerdersrechten om wedstrijden in te plannen.";
    }

    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN);
    sheet.appendRow([Utilities.getUuid(), data.competitieId, data.datum, data.tijd, data.thuisTeam, data.uitTeam, 'Gepland', '-']);
    return "✅ Wedstrijd succesvol ingepland!";
  },

  haalWedstrijdenOp: function() {
    const db = getDatabase();
    const wData = db.getSheetByName(CONFIG.TABS.WEDSTRIJDEN).getDataRange().getDisplayValues();
    const tData = db.getSheetByName(CONFIG.TABS.TEAMS).getDataRange().getDisplayValues();

    let teamNamen = {};
    for(let i = 1; i < tData.length; i++) teamNamen[tData[i][0]] = tData[i][1];

    let resultaat = [];
    resultaat.push(["ID", "Datum", "Tijd", "Thuis", "Uit", "Status", "Uitslag"]);

    for(let i = 1; i < wData.length; i++) {
      let thuisNaam = teamNamen[wData[i][4]] || "Onbekend";
      let uitNaam = teamNamen[wData[i][5]] || "Onbekend";
      resultaat.push([wData[i][0], wData[i][2], wData[i][3], thuisNaam, uitNaam, wData[i][6], wData[i][7]]);
    }
    // We reverse() zodat de nieuwste of laatst ingeplande bovenaan staan (optioneel aan te passen)
    return resultaat.reverse();
  },

  haalRuweWedstrijdenOp: function() {
    return getDatabase().getSheetByName(CONFIG.TABS.WEDSTRIJDEN).getDataRange().getDisplayValues();
  }
};
