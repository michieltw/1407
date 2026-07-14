// ==========================================
// 🚀 ROUTER.GS - De Verkeersregelaar (API)
// ==========================================

// 1. Deze functie laadt de User Interface wanneer een gebruiker de app opent
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('IJshockey Manager')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // Zorgt dat het goed schaalt op mobiel
}

// 2. Dit is de beveiligde poort waar ALLE data-aanvragen doorheen gaan.
// Als de frontend data nodig heeft, roept het deze functie aan.
function doAction(moduleName, actionName, payload) {
  try {
    // We zoeken naar een object met het voorvoegsel 'Mod_' (bijv. Mod_Users)
    const moduleObjectName = 'Mod_' + moduleName;

    // We checken of je de module (nog) hebt geïnstalleerd
    if (typeof this[moduleObjectName] === 'undefined') {
      throw new Error("Module '" + moduleName + "' is uitgeschakeld of bestaat niet.");
    }

    // We checken of de gevraagde actie bestaat binnen die module
    if (typeof this[moduleObjectName][actionName] !== 'function') {
      throw new Error("Actie '" + actionName + "' bestaat niet in module '" + moduleName + "'.");
    }

    // Alles is veilig! Voer de actie uit en stuur het resultaat (de data) netjes terug
    const result = this[moduleObjectName][actionName](payload);

    return {
      status: 'success',
      data: result
    };

  } catch (error) {
    // Als een module ontbreekt of er is een fout, crasht de app niet!
    // We vangen het hier op en sturen een nette foutmelding naar het scherm.
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

// ==========================================
// NIEUW: FUNCTIE OM LOSSE VIEWS OP TE HALEN
// ==========================================
function getViewHTML(viewNaam) {
  try {
    // We zoeken een bestand in GAS dat heet: View_Users.html of View_Dashboard.html
    const bestandsnaam = 'View_' + viewNaam;
    return HtmlService.createHtmlOutputFromFile(bestandsnaam).getContent();
  } catch(error) {
    throw new Error("Het scherm '" + viewNaam + "' bestaat nog niet.");
  }
}
