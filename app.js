const GROUPS_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1790291209&single=true&output=csv";

const TABLES_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1989085490&single=true&output=csv";

const KO_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrzWNiUjfIIyZAv9FzuXUf5MMZnwKMqN3FdGixf5Li5wSaUIA5NU-0pXMGNi2TKg/pub?gid=1216619965&single=true&output=csv";

let currentGroup = 0;

const GROUP_NAMES = [
    "Gruppe A",
    "Gruppe B",
    "Gruppe C",
    "Gruppe D"
];

function updateClock() {
    document.getElementById("clock").innerHTML =
        new Date().toLocaleTimeString("de-DE");
}

setInterval(updateClock, 1000);
updateClock();

function parseCSV(text) {
    return text
        .trim()
        .split("\n")
        .map(row => row.split(","));
}

async function loadGroups() {

    try {

        const response = await fetch(GROUPS_CSV);
        const csv = await response.text();

        const rows = parseCSV(csv);

        const played = [];
        const upcoming = [];

        rows.slice(1).forEach(row => {

            const slot = row[1] || "";
            const gate = row[3] || "";
            const group = row[4] || "";
            const team1 = row[7] || "";
            const team2 = row[8] || "";
            const result = row[9] || "";

            if (!team1 || !team2) return;

            if (result.trim() !== "") {

                played.push({
                    team1,
                    team2,
                    result,
                    group
                });

            } else {

                upcoming.push({
                    slot,
                    gate,
                    group,
                    team1,
                    team2
                });
            }
        });

        showResults(played);
        showUpcoming(upcoming);
        showCurrentSlot(upcoming);

    } catch (err) {

        console.error(err);

        document.getElementById("results").innerHTML =
            "Fehler beim Laden";

        document.getElementById("nextMatches").innerHTML =
            "Fehler beim Laden";

        document.getElementById("currentMatch").innerHTML =
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

    if (matches.length === 0) {

        document.getElementById("nextMatches").innerHTML =
            "Keine Spiele mehr offen";

        return;
    }

    const currentSlot = String(matches[0].slot).trim();

    const nextMatch = matches.find(match =>
        String(match.slot).trim() !== currentSlot
    );

    if (!nextMatch) {

        document.getElementById("nextMatches").innerHTML =
            "Keine weiteren Slots";

        return;
    }

    const nextSlot = String(nextMatch.slot).trim();

    const slotMatches = matches.filter(match =>
        String(match.slot).trim() === nextSlot
    );

    let html = `
        <div style="
            text-align:center;
            color:#ffd700;
            font-size:24px;
            font-weight:bold;
            margin-bottom:20px;
        ">
            NÄCHSTER SLOT ${nextSlot}
        </div>
    `;

    slotMatches.forEach(match => {

        html += `
            <div style="
                margin-bottom:15px;
                padding-bottom:15px;
                border-bottom:1px solid rgba(255,255,255,0.2);
            ">

                <div style="
                    color:#ffd700;
                    font-weight:bold;
                    margin-bottom:5px;
                ">
                    TOR ${match.gate}
                </div>

                <div style="
                    font-size:22px;
                    font-weight:bold;
                ">
                    ${match.team1}
                </div>

                <div style="
                    color:#ffd700;
                    margin:4px 0;
                ">
                    VS
                </div>

                <div style="
                    font-size:22px;
                    font-weight:bold;
                ">
                    ${match.team2}
                </div>

                <div style="
                    color:#cccccc;
                    margin-top:4px;
                ">
                    ${match.group}
                </div>

            </div>
        `;
    });

    document.getElementById("nextMatches").innerHTML = html;
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

    if (start === -1) return;

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

    for (let i = 2; i < rows.length; i++) {

        const cols = rows[i].split(",");

        const team = cols[1];

        if (!team) continue;
        if (team.trim() === "") continue;
        if (team === "Team") continue;

        teams.push({
            team,
            points: Number(cols[9] || 0),
            diff: Number(cols[8] || 0),
            goals: Number(cols[6] || 0)
        });
    }

    teams.sort((a, b) => {

        if (b.points !== a.points)
            return b.points - a.points;

        if (b.diff !== a.diff)
            return b.diff - a.diff;

        return b.goals - a.goals;
    });

    teams.forEach((t, index) => {

        const diff =
            t.diff > 0 ? "+" + t.diff : t.diff;

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${t.team}</td>
                <td>${t.points}</td>
                <td>${diff}</td>
            </tr>
        `;
    });

    html += "</table>";

    document.getElementById("liveTable").innerHTML = html;
}

async function loadKO() {

    try {

        const response = await fetch(KO_CSV);
        const csv = await response.text();

        const rows = csv
            .trim()
            .split("\n")
            .map(row => row.split(","));

        let html = "";
        let currentRound = "";

        rows.forEach(row => {

            const round = (row[0] || "").trim();
            const time = (row[3] || "").trim();
            const gate = (row[4] || "").trim();
            const team1 = (row[5] || "").trim();
            const team2 = (row[6] || "").trim();

            if (
                !round ||
                round === "Runde" ||
                round === "Gruppe" ||
                round.includes("qualifizierte")
            ) {
                return;
            }

            if (!team1 || !team2) {
                return;
            }

            if (round !== currentRound) {

                currentRound = round;

                html += `
                    <div style="
                        color:#ffd700;
                        font-size:24px;
                        font-weight:bold;
                        margin-top:20px;
                        margin-bottom:15px;
                    ">
                        🏆 ${round}
                    </div>
                `;
            }

            html += `
                <div style="
                    border:1px solid rgba(255,255,255,0.25);
                    border-radius:8px;
                    padding:12px;
                    margin-bottom:10px;
                    background:rgba(255,255,255,0.04);
                ">

                    <div style="
                        color:#ffd700;
                        font-size:14px;
                        font-weight:bold;
                        margin-bottom:8px;
                    ">
                        ${time} • TOR ${gate}
                    </div>

                    <div style="
                        font-size:18px;
                        font-weight:bold;
                    ">
                        ${team1}
                    </div>

                    <div style="
                        color:#ffd700;
                        margin:5px 0;
                    ">
                        VS
                    </div>

                    <div style="
                        font-size:18px;
                        font-weight:bold;
                    ">
                        ${team2}
                    </div>

                </div>
            `;
        });

        document.getElementById("koRound").innerHTML = html;

    } catch (err) {

        console.error(err);

        document.getElementById("koRound").innerHTML =
            "KO-Daten konnten nicht geladen werden";
    }
}

loadGroups();
loadTables();
loadKO();

setInterval(() => {

    currentGroup++;

    if (currentGroup >= GROUP_NAMES.length) {
        currentGroup = 0;
    }

    loadGroups();
    loadTables();
    loadKO();

}, 15000);
