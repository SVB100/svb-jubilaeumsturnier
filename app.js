const GROUPS_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsivD74M4OG5UOHhOQUX5Q8vvYKVpFF2i4A4Y8gdt2wwWR-OxOYZKyF0qqdZxxg1YPKK5g7IBs-gHJ/pub?gid=1851533996&single=true&output=csv";

const TABLES_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsivD74M4OG5UOHhOQUX5Q8vvYKVpFF2i4A4Y8gdt2wwWR-OxOYZKyF0qqdZxxg1YPKK5g7IBs-gHJ/pub?gid=447541581&single=true&output=csv";

const KO_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsivD74M4OG5UOHhOQUX5Q8vvYKVpFF2i4A4Y8gdt2wwWR-OxOYZKyF0qqdZxxg1YPKK5g7IBs-gHJ/pub?gid=1400585892&single=true&output=csv";

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

setInterval(() => {

    loadGroups();
    loadKO();

}, 15000);
