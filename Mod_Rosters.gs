// ==========================================
// 📋 MOD_ROSTERS.GS - Rostersmodule
// ==========================================

var Mod_Rosters = {

  voegSpelerToe: function(data) {
    const db = getDatabase();
    let finalUserId = data.userId;

    // HIER DE TOEVOEGING: Als het een nieuwe gastspeler is, maak die dan direct op de achtergrond aan
    if (data.isNieuw && data.nieuweNaam) {
       const uSheet = db.getSheetByName(CONFIG.TABS.USERS);
       finalUserId = Utilities.getUuid();
       const datum = new Date().toLocaleDateString('nl-NL');

       // Schrijf weg in Users tab als 'Gastspeler' zonder e-mailadres
       uSheet.appendRow([
         finalUserId, data.nieuweNaam, '', 'Gastspeler', datum,
         '', '', '', '', '',
         data.rugnummer, '', '', '', '', ''
       ]);
    }

    const sheet = db.getSheetByName(CONFIG.TABS.ROSTERS);
    const rosterData = sheet.getDataRange().getValues();

    // Controleer op dubbele rugnummers (kolom 4 is Rugnummer, 1 is Team_ID)
    for(let i = 1; i < rosterData.length; i++) {
      if(rosterData[i][1] === data.teamId && rosterData[i][4] == data.rugnummer) {
        return "❌ Fout: Rugnummer " + data.rugnummer + " is al in gebruik binnen dit team!";
      }
    }

    // Koppel de (nieuwe of bestaande) speler aan het team
    sheet.appendRow([Utilities.getUuid(), data.teamId, finalUserId, data.positie, data.rugnummer, 'Actief']);
    return "✅ Speler succesvol toegevoegd aan het roster!";
  },

  haalRosterOp: function(teamId) {
    const db = getDatabase();
    const rosterData = db.getSheetByName(CONFIG.TABS.ROSTERS).getDataRange().getDisplayValues();
    const userData = db.getSheetByName(CONFIG.TABS.USERS).getDataRange().getDisplayValues();

    let teamRoster = [];
    teamRoster.push(["Naam", "Positie", "Rugnummer", "Status"]); // Headers

    for(let i = 1; i < rosterData.length; i++) {
      if(rosterData[i][1] === teamId) {
        let spelerNaam = "Onbekend";
        for(let j = 1; j < userData.length; j++) {
          if(userData[j][0] === rosterData[i][2]) {
            spelerNaam = userData[j][1];
            break;
          }
        }
        teamRoster.push([spelerNaam, rosterData[i][3], rosterData[i][4], rosterData[i][5]]);
      }
    }
    return teamRoster;
  }
};
