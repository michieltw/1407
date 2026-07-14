// ==========================================
// 🏆 MOD_ACHIEVEMENTS.GS - Achievements
// ==========================================

var Mod_Achievements = {
  ACHIEVEMENTS_LIST: {
    "backpack_mode": { naam: "Backpack Mode", desc: "Meerdere assists in één wedstrijd.", icon: "🎒" },
    "game_winner": { naam: "Game Winner", desc: "Score the game winning goal.", icon: "🎯" },
    "saint": { naam: "Saint", desc: "0 strafminuten gedurende het seizoen.", icon: "😇" },
    "miracle": { naam: "Do you believe in Miracles, Yes!", desc: "Team from a lower division beats a top tier level team.", icon: "✨" },
    "shut_the_door": { naam: "Shut the Door!", desc: "+15 saves in a game.", icon: "🚪" },
    "shut_out": { naam: "Shut-out!", desc: "0 GA in a game.", icon: "🧱" },
    "old_time": { naam: "Old Time Hockey", desc: "Oudste speler op het team.", icon: "👴" },
    "hatchling": { naam: "Hatchling", desc: "Jongste speler op het team.", icon: "🐣" },
    "veteran": { naam: "Veteran", desc: "Heeft eerder in de league gespeeld.", icon: "🎖️" },
    "rookie": { naam: "Rookie", desc: "Eerste seizoen in de league.", icon: "🌱" },
    "trickster": { naam: "Trickster", desc: "Score a hat-trick.", icon: "🎩" },
    "hats_off": { naam: "Hats off", desc: "Score 3 goals in one period.", icon: "🧢" },
    "never_give_up": { naam: "Never give up", desc: "Win a game after trailing into the 3rd period.", icon: "🔥" },
    "ot_hero": { naam: "OT Hero", desc: "Score the game winner in OT.", icon: "🦸" },
    "shootout_spec": { naam: "Shootout Specialist", desc: "Score on a penalty shot/shootout.", icon: "🤠" },
    "sole_survivor": { naam: "Sole Survivor", desc: "Last team to lose points.", icon: "🏝️" },
    "winning": { naam: "#Winning", desc: "Win three games in a row.", icon: "📈" },
    "devastation": { naam: "Devastation", desc: "Lose a game you led by 2+ goals.", icon: "💔" },
    "dominating": { naam: "Dominating", desc: "Score 10+ points in the regular season.", icon: "👑" },
    "first_blood": { naam: "First Blood", desc: "Eerste doelpunt van de wedstrijd.", icon: "🩸" },
    "killing_spree": { naam: "Killing Spree", desc: "Score 3 goals in a row (Quake).", icon: "🔪" },
    "monster_kill": { naam: "Monster Kill", desc: "Score 5 goals in a game (Quake).", icon: "👹" },
    "unstoppable": { naam: "Unstoppable", desc: "Score 6 goals in a game (Quake).", icon: "🚂" },
    "wicked_sick": { naam: "Wicked Sick", desc: "Score 7 goals in a game (Quake).", icon: "🤢" },
    "godlike": { naam: "Godlike", desc: "Score 8+ goals in a game (Quake).", icon: "👼" }
  },

  // Evalueer achievements na een wedstrijd
  evalueerWedstrijd: function(wedstrijdId, stats, events, thuisId, uitId) {
    try {
      const db = getDatabase();
      let achSheet = db.getSheetByName(CONFIG.TABS.ACHIEVEMENTS);
      if (!achSheet) return;

      const uSheet = db.getSheetByName(CONFIG.TABS.USERS);
      const rSheet = db.getSheetByName(CONFIG.TABS.ROSTERS);
      if(!uSheet || !rSheet) return;

      const uData = uSheet.getDataRange().getValues();
      const rData = rSheet.getDataRange().getValues();

      let nameToUserId = {};
      let nameToTeamId = {};

      for(let i=1; i<rData.length; i++) {
        let tid = rData[i][1];
        let uid = rData[i][2];
        if (tid === thuisId || tid === uitId) {
           for(let j=1; j<uData.length; j++) {
             if(uData[j][0] === uid) {
               // Roster data holds "FirstName LastName" typically, so just mapping by that Name
               nameToUserId[uData[j][1].trim()] = uid;
               nameToTeamId[uData[j][1].trim()] = tid;
             }
           }
        }
      }

      function award(userId, teamId, achKey) {
         if (!userId && !teamId) return;
         achSheet.appendRow([Utilities.getUuid(), userId || "", teamId || "", achKey, new Date().toLocaleDateString('nl-NL')]);
      }

      if (events && events.length > 0) {
        let firstGoal = events.find(e => e.type === 'GOAL');
        if (firstGoal && firstGoal.payload.scorer) {
           let scorerName = firstGoal.payload.scorer.trim();
           if (scorerName.startsWith('#')) {
             scorerName = scorerName.substring(scorerName.indexOf(' ') + 1);
           }
           if(nameToUserId[scorerName]) {
             award(nameToUserId[scorerName], null, "first_blood");
           }
        }
      }

      let playerStats = {};
      if (events) {
        events.forEach(e => {
          if(e.type === 'PENALTY') {
             let penPlayer = e.payload.player ? e.payload.player.trim() : null;
             if (penPlayer && penPlayer.startsWith('#')) penPlayer = penPlayer.substring(penPlayer.indexOf(' ') + 1);
             if(penPlayer) {
                if(!playerStats[penPlayer]) playerStats[penPlayer] = { goals: 0, assists: 0, saves: 0, goalsByPeriod: {}, penMinutes: 0 };
                playerStats[penPlayer].penMinutes += 2;
             }
          } else if(e.type === 'GOAL') {
             let scorer = e.payload.scorer ? e.payload.scorer.trim() : null;
             if (scorer && scorer.startsWith('#')) scorer = scorer.substring(scorer.indexOf(' ') + 1);
             if(scorer) {
               if(!playerStats[scorer]) playerStats[scorer] = { goals: 0, assists: 0, saves: 0, goalsByPeriod: {}, penMinutes: 0 };
               playerStats[scorer].goals++;

               let timeParts = e.minuut.split(':');
               if (timeParts.length === 2) {
                  let mins = parseInt(timeParts[0]);
                  let period = mins < 20 ? 1 : (mins < 40 ? 2 : 3);
                  playerStats[scorer].goalsByPeriod[period] = (playerStats[scorer].goalsByPeriod[period] || 0) + 1;
               }
             }

             if(e.payload.assistText && e.payload.assistText.includes('Ast:')) {
                let astPart = e.payload.assistText.replace('Ast:', '').trim();
                let assisters = astPart.split(',');
                assisters.forEach(ast => {
                  let astName = ast.trim();
                  if (astName.startsWith('#')) astName = astName.substring(astName.indexOf(' ') + 1);
                  if(!playerStats[astName]) playerStats[astName] = { goals: 0, assists: 0, saves: 0, goalsByPeriod: {}, penMinutes: 0 };
                  playerStats[astName].assists++;
                });
             }
          } else if (e.type === 'SHOT') {
             let goalie = e.payload.goalie ? e.payload.goalie.trim() : null;
             if (goalie && goalie.startsWith('#')) goalie = goalie.substring(goalie.indexOf(' ') + 1);
             if(goalie) {
                if(!playerStats[goalie]) playerStats[goalie] = { goals: 0, assists: 0, saves: 0, goalsByPeriod: {}, penMinutes: 0 };
                playerStats[goalie].saves++;
             }
          }
        });

        for (let pName in playerStats) {
           let p = playerStats[pName];
           let uId = nameToUserId[pName];
           if (uId) {
              if (p.assists >= 2) award(uId, null, "backpack_mode");
              if (p.goals === 3) award(uId, null, "trickster");
              if (p.goals === 5) award(uId, null, "monster_kill");
              if (p.goals === 6) award(uId, null, "unstoppable");
              if (p.goals === 7) award(uId, null, "wicked_sick");
              if (p.goals >= 8) award(uId, null, "godlike");

              for(let per in p.goalsByPeriod) {
                 if(p.goalsByPeriod[per] >= 3) award(uId, null, "hats_off");
              }

              if (p.saves >= 15) award(uId, null, "shut_the_door");

              if (p.penMinutes > 0) {
                 // Remove Saint achievement
                 let aData = achSheet.getDataRange().getValues();
                 for(let i = aData.length - 1; i >= 1; i--) {
                    if(aData[i][1] === uId && aData[i][3] === 'saint') {
                       achSheet.deleteRow(i + 1);
                    }
                 }
              } else {
                 award(uId, null, "saint");
              }

           }
        }
      }

      if (stats.HOME.score === 0 && uitId) award(null, uitId, "shut_out");
      if (stats.AWAY.score === 0 && thuisId) award(null, thuisId, "shut_out");

    } catch(e) {
      console.log("Error in evalueerWedstrijd: " + e.toString());
    }
  },

  haalMijnAchievements: function(userId, teamId) {
    try {
      const db = getDatabase();
      const achSheet = db.getSheetByName(CONFIG.TABS.ACHIEVEMENTS);
      if (!achSheet) return [];

      const aData = achSheet.getDataRange().getValues();
      let unlocked = [];
      let seen = {};

      for(let i=1; i<aData.length; i++) {
        let aUserId = aData[i][1];
        let aTeamId = aData[i][2];
        let achKey = aData[i][3];

        if (aUserId === userId || (teamId && aTeamId === teamId)) {
           if (!seen[achKey] && this.ACHIEVEMENTS_LIST[achKey]) {
              unlocked.push(this.ACHIEVEMENTS_LIST[achKey]);
              seen[achKey] = true;
           }
        }
      }
      return unlocked;
    } catch(e) {
      return [];
    }
  }
};
