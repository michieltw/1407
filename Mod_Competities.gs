// ==========================================
// 🏆 MOD_COMPETITIES.GS - Competitiemodule
// ==========================================

var Mod_Competities = {

  haalCompetitiesOp: function() {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.COMPETITIES);
    return sheet.getDataRange().getDisplayValues();
  },

  // We maken direct een functie om via de app een competitie toe te voegen!
  voegCompetitieToe: function(data) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.COMPETITIES);

    const compId = Utilities.getUuid();
    // data bevat de input uit ons HTML formulier: [Naam, Seizoen, Niveau]
    sheet.appendRow([compId, data.naam, data.seizoen, data.niveau, 'Actief']);

    return "✅ Competitie succesvol aangemaakt!";
  }

};
