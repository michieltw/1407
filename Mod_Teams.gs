// ==========================================
// 🛡️ MOD_TEAMS.GS - Teamsmodule
// ==========================================

var Mod_Teams = {

  haalTeamsOp: function() {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.TEAMS);
    return sheet.getDataRange().getDisplayValues();
  },

  voegTeamToe: function(data) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.TEAMS);
    const teamId = Utilities.getUuid();

    // Voeg de nieuwe velden toe in de juiste volgorde
    sheet.appendRow([teamId, data.naam, data.afkorting, data.kleur, data.competitieId, data.coach, 'Actief']);
    return "✅ Team succesvol toegevoegd!";
  }
};
