function randomTeam() {
    clearTeam();
    let validTeamFound = false;
    let attempts = 0;
    
    // Dela upp förare efter kategorier för säker validering
    const ssDrivers = drivers.filter(d => d.category === "SS");
    const suDrivers = drivers.filter(d => d.category === "SU21");
    const u21Drivers = drivers.filter(d => d.category === "SU21" || d.category === "UU21");

    while (!validTeamFound && attempts < 500) {
        let tempTeam = [];
        
        // 1. Tvinga in 2 unika svenska seniorer (SS)
        while(tempTeam.length < 2) {
            let d = ssDrivers[Math.floor(Math.random() * ssDrivers.length)];
            if (!tempTeam.some(x => x.id === d.id)) tempTeam.push(d);
        }
        
        // 2. Tvinga in 1 svensk U21 (SU21)
        let su = suDrivers[Math.floor(Math.random() * suDrivers.length)];
        if (!tempTeam.some(x => x.id === su.id)) tempTeam.push(su);
        
        // 3. Tvinga in ytterligare 1 U21 (SU21 eller UU21) så att vi har minst två totalt
        while(tempTeam.length < 4) {
            let u21 = u21Drivers[Math.floor(Math.random() * u21Drivers.length)];
            if (!tempTeam.some(x => x.id === u21.id)) tempTeam.push(u21);
        }
        
        // 4. Fyll på med resterande 3 förare helt slumpmässigt från hela listan
        let fillAttempts = 0;
        while(tempTeam.length < 7 && fillAttempts < 200) {
            let randD = drivers[Math.floor(Math.random() * drivers.length)];
            if (!tempTeam.some(x => x.id === randD.id)) tempTeam.push(randD);
            fillAttempts++;
        }
        
        // 5. Godkänn ENDAST om laget har exakt 7 förare och håller sig under eller på snitt-taket
        let totalAvg = tempTeam.reduce((sum, x) => sum + x.avg, 0);
        if (tempTeam.length === 7 && totalAvg <= BUDGET) {
            myTeam = tempTeam;
            validTeamFound = true;
        }
        attempts++;
    }

    if (validTeamFound) {
        renderTeam();
        renderDrivers();
    } else {
        alert("Kunde inte slumpa ett giltigt lag direkt under budgeten. Testa att trycka på Slumpa igen!");
    }
}
