// ==========================================
// 📢 MOD_ANNOUNCEMENTS.GS - Nieuwsfeed
// ==========================================

var Mod_Announcements = {

  voegBerichtToe: function(data) {
    const sheet = getDatabase().getSheetByName(CONFIG.TABS.ANNOUNCEMENTS);
    const datum = new Date().toLocaleDateString('nl-NL');

    // data.auteur vullen we later automatisch in via het ingelogde User account, nu is het een invulveld
    sheet.appendRow([Utilities.getUuid(), datum, data.titel, data.bericht, data.auteur]);
    return "✅ Bericht geplaatst op het dashboard!";
  },

  haalBerichtenOp: function() {
    const data = getDatabase().getSheetByName(CONFIG.TABS.ANNOUNCEMENTS).getDataRange().getDisplayValues();
    // We keren de array om zodat het nieuwste bericht bovenaan staat (let op: header komt dan onderaan, die filteren we in de frontend eruit)
    return data.reverse();
  }

};
