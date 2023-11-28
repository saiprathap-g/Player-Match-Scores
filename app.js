const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertPlayerDbToResponseObject = (value) => {
  return {
    playerId: value.player_id,
    playerName: value.player_name,
  };
};

const convertMatchDetailsDbToResponseObject = (value) => {
  return {
    matchId: value.match_id,
    match: value.match,
    year: value.year,
  };
};

const getThePlayerTotalStats = (value) => {
  return {
    playerId: value.player_id,
    playerName: value.player_name,
    totalScore: value.score,
    totalFours: value.fours,
    totalSixes: value.sixes,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    
        SELECT * FROM player_details; 
    
    `;

  const dbResponse = await db.all(getPlayersQuery);
  response.send(
    dbResponse.map((eachItem) => convertPlayerDbToResponseObject(eachItem))
  );
});

//GET WITH ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `

    
        SELECT * FROM player_details WHERE player_id = ${playerId}; 
    
    `;

  const dbResponse = await db.get(getPlayerQuery);
  response.send(convertPlayerDbToResponseObject(dbResponse));
});

//put
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    
     UPDATE player_details SET player_name = "${playerName}" WHERE player_id = ${playerId};
    
    
    
    
    `;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `

    
        SELECT * FROM match_details WHERE match_id = ${matchId}; 
    
    `;

  const dbResponse = await db.get(getMatchQuery);
  response.send(convertMatchDetailsDbToResponseObject(dbResponse));
});

//get total player matches
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    
     SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id = ${playerId};
    
    
    
    
    
    `;

  const dbResponse = await db.all(getPlayerMatchesQuery);
  response.send(
    dbResponse.map((eachItem) =>
      convertMatchDetailsDbToResponseObject(eachItem)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchesQuery = `
    
     SELECT * FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId};
  
    
    
    `;

  const dbResponse = await db.all(getPlayerMatchesQuery);
  response.send(
    dbResponse.map((eachItem) => convertPlayerDbToResponseObject(eachItem))
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    
     SELECT
      player_id as player_id,
      player_name as player_name,
      SUM(score) as score,
      SUM(fours) as fours,
      SUM(sixes) as sixes
     FROM player_match_score NATURAL JOIN player_details WHERE player_id = ${playerId};
 
    
    
    `;

  const dbResponse = await db.get(getPlayerMatchesQuery);
  response.send(getThePlayerTotalStats(dbResponse));
});

module.exports = app;
