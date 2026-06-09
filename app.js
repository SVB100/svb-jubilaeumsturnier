const GROUPS_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1790291209&single=true&output=csv";

const TABLES_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1989085490&single=true&output=csv";

const KO_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1216619965&single=true&output=csv";

function updateClock() {
    document.getElementById("clock").innerHTML =
        new Date().toLocaleTimeString("de-DE");
}

setInterval(updateClock, 1000);
updateClock();

function parseCSV(text) {
    return text
        .split("\n")
        .map(row => row.split(","));
}
let currentGroup = 0;

const GROUP_NAMES = [
    "Gruppe A",
    "Gruppe B",
    "Gruppe C",
    "Gruppe D"
];
async function loadGroups() {

    try {

        const response = await fetch(GROUPS_CSV);
        const csv = await response.text();

        const rows = parseCSV(csv);

        const played = [];
        const upcoming = [];

        rows.slice(1).forEach(row => {

            const team1 = row[7] || "";
            const team2 = row[8] || "";
            const result = row[9] || "";
            const time = row[2] || "";
            const group = row[4] || "";

            if (!team1 || !team2) return;

            if (result.trim() !== "") {

                played.push({
                    group,
                    team1,
                    team2,
                    result
                });

            } else {

                upcoming.push({
                    group,
                    team1,
                    team2,
                    time
                });
            }
        });

        showResults(played);
        showUpcoming(upcoming);

    } catch (err) {

        document.getElementById("results").innerHTML =
            "Fehler beim Laden";

        document.getElementById("nextMatches").innerHTML =
            "Fehler beim Laden";
    }
}

function showResults(matches) {

    const lastMatches = matches.slice(-10).reverse();

    let html = "";

    lastMatches.forEach(match => {

        html += `
            <div style="margin-bottom:8px;">
                <strong>${match.team1}</strong>
                ${match.result}
                <strong>${match.team2}</strong>
            </div>
        `;
    });

    document.getElementById("results").innerHTML = html;
}

function showUpcoming(matches) {

    showCurrentMatch(matches);
    
    const nextMatches = matches.slice(0,10);

    let html = "";

    nextMatches.forEach(match => {

        html += `
            <div style="margin-bottom:8px;">
                ${match.time} |
                ${match.team1}
                vs
                ${match.team2}
            </div>
        `;
    });

    document.getElementById("nextMatches").innerHTML = html;
}
function showCurrentMatch(matches) {

    if(matches.length === 0) {

        document.getElementById("currentMatch").innerHTML =
            "Keine Spiele mehr offen";

        return;
    }

    const match = matches[0];

    document.getElementById("currentMatch").innerHTML = `
        <div style="
            text-align:center;
            padding-top:20px;
        ">

            <div style="
                color:#ffd700;
                font-size:18px;
                margin-bottom:20px;
            ">
                JETZT AUF TOR 1
            </div>

            <div style="
                font-size:34px;
                font-weight:bold;
                margin-bottom:15px;
            ">
                ${match.team1}
            </div>

            <div style="
                font-size:24px;
                color:#ffd700;
                margin-bottom:15px;
            ">
                VS
            </div>

            <div style="
                font-size:34px;
                font-weight:bold;
                margin-bottom:20px;
            ">
                ${match.team2}
            </div>

            <div style="
                font-size:20px;
                color:#cccccc;
            ">
                ${match.group}
            </div>

        </div>
    `;
}

async function loadTables() {

    try {

        const response = await fetch(TABLES_CSV);

        const csv = await response.text();

        showTable(csv);

    } catch (err) {

        document.getElementById("liveTable").innerHTML =
            "Tabelle konnte nicht geladen werden";
    }
}

function showTable(csv) {

    const groupName = GROUP_NAMES[currentGroup];

    const start = csv.indexOf(groupName);

    if(start === -1) return;

    let end = csv.length;

for (const name of GROUP_NAMES) {

    if (name === groupName) continue;

    const pos = csv.indexOf(name, start + 1);

    if (pos > start && pos < end) {
        end = pos;
    }
}

const section = csv.substring(start, end);

const rows = section.split("\n");

    let html = `
        <h2 style="color:#ffd700;margin-bottom:15px;">
            ${groupName}
        </h2>

        <table>
    <tr>
        <th>#</th>
        <th>Team</th>
        <th>Pkt</th>
        <th>Diff</th>
    </tr>
    `;

    const teams = [];

for(let i = 2; i < rows.length; i++) {

    const cols = rows[i].split(",");

    const team = cols[1];

    if(!team) continue;
    if(team.trim() === "") continue;
    if(team === "Team") continue;

    teams.push({
        team: team,
        points: Number(cols[9] || 0),
        diff: Number(cols[8] || 0),
        goals: Number(cols[6] || 0)
    });
}

teams.sort((a,b) => {

    if(b.points !== a.points)
        return b.points - a.points;

    if(b.diff !== a.diff)
        return b.diff - a.diff;

    return b.goals - a.goals;
});

teams.forEach((t,index) => {

    let diffText = t.diff;

    if(t.diff > 0) {
        diffText = "+" + t.diff;
    }

    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${t.team}</td>
            <td>${t.points}</td>
            <td>${diffText}</td>
        </tr>
    `;
});

    html += "</table>";

    document.getElementById("liveTable").innerHTML =
        html;
}
async function loadKO() {

    try {

        const response = await fetch(KO_CSV);

        const text = await response.text();

        document.getElementById("koRound").innerHTML =
            "<pre style='white-space:pre-wrap'>" +
            text.substring(0,800) +
            "</pre>";

    } catch (err) {

        document.getElementById("koRound").innerHTML =
            "KO-Daten konnten nicht geladen werden";
    }
}

loadGroups();
loadKO();
loadTables();

setInterval(() => {

    currentGroup++;

    if(currentGroup >= GROUP_NAMES.length) {
        currentGroup = 0;
    }

    loadGroups();
    loadKO();
    loadTables();

}, 15000);
