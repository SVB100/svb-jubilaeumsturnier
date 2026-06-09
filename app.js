
const GROUPS_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsivD74M4OG5UOHhOQUX5Q8vvYKVpFF2i4A4Y8gdt2wwWR-OxOYZKyF0qqdZxxg1YPKK5g7IBs-gHJ/pub?gid=1851533996&single=true&output=csv";

function updateClock() {

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleTimeString("de-DE");
}

setInterval(updateClock,1000);

updateClock();

async function loadData(){

    try{

        const response = await fetch(GROUPS_CSV);

        const csv = await response.text();

        document.getElementById("results").innerHTML =
            "<pre style='white-space:pre-wrap'>" +
            csv.substring(0,1500) +
            "</pre>";

    }
    catch(error){

        document.getElementById("results").innerHTML =
            "Fehler beim Laden der Daten";
    }
}

loadData();
