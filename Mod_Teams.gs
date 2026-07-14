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
  },
  wijzigTeam: function(data) {
    const db = getDatabase();
    const sheet = db.getSheetByName(CONFIG.TABS.TEAMS);
    const tData = sheet.getDataRange().getValues();
    for(let i=1; i<tData.length; i++) {
       if(tData[i][0] === data.teamId) {
          if(data.coach !== undefined) sheet.getRange(i+1, 6).setValue(data.coach);
          if(data.kleur !== undefined) sheet.getRange(i+1, 4).setValue(data.kleur);
          return "✅ Team succesvol geüpdatet!";
       }
    }
    return "❌ Team niet gevonden.";
  }
};