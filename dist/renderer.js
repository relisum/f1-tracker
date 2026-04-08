const trackContainer = document.getElementById("track");
const driversContainer = document.getElementById("drivers");
const SESSION_KEY = 9158;
const TARGET_TIME = "2024-03-02T15:23:45Z";
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}`);
    return res.json();
}
const createCard = () => {
    const card = document.createElement("div");
    card.className = "card";
    return card;
};
const getDrivers = async () => {
    return await fetchJSON(`https://api.openf1.org/v1/drivers?session_key=${SESSION_KEY}`);
};
async function getClosestLocation(driverNumber) {
    const data = await fetchJSON(`https://api.openf1.org/v1/location?session_key=${SESSION_KEY}&driver_number=${driverNumber}`);
    if (!data.length)
        return null;
    const target = new Date(TARGET_TIME).getTime();
    let closest = null;
    let minDiff = Infinity;
    for (const point of data) {
        const pointTime = new Date(point.date).getTime();
        const diff = Math.abs(pointTime - target);
        if (diff < minDiff) {
            minDiff = diff;
            closest = point;
        }
    }
    return closest;
}
async function getMeeting(meetingKey) {
    const meetings = await fetchJSON(`https://api.openf1.org/v1/meetings?meeting_key=${meetingKey}`);
    return meetings[0];
}
// RENDER
function renderTrackCard(meeting) {
    if (!trackContainer)
        return;
    const card = createCard();
    card.innerHTML = `
    <h3>Closest: ${meeting.location}</h3>
    <img src="${meeting.circuit_image}" alt="${meeting.location}" />
  `;
    trackContainer.appendChild(card);
}
function renderDriverCard(driver) {
    if (!driversContainer)
        return;
    const card = createCard();
    card.innerHTML = `
    <img src="${driver.headshot_url}" alt="${driver.full_name}" />
    <h4>${driver.full_name.split(" ")[1]}</h4>
    <div class="additional">
        ${driver.team_name} | ${driver.country_code || "N/A"}
    </div>
  `;
    driversContainer.appendChild(card);
}
function renderTeamCard(team) {
    if (!driversContainer)
        return; // или отдельный контейнер для команд
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `
    <div class="team-header">
      <img src="${team.logo_url}" alt="${team.team_name}" />
      <h3>${team.team_name}</h3>
    </div>

    <div class="team-info">
      <p>Страна: ${team.country}</p>
      <p>Год основания: ${team.foundation_year}</p>
      <p>Главный инженер: ${team.chief_engineer}</p>
      <p>Очки: ${team.points} | Победы: ${team.wins} | Подиумы: ${team.podiums}</p>
    </div>
  `;
    driversContainer.appendChild(card);
}
// CLICK LISTENER
function enableGlobalToggle() {
    const cards = driversContainer?.querySelectorAll('.card');
    if (!cards)
        return;
    // Изначально скрываем все .additional
    cards.forEach(card => {
        const add = card.querySelector('.additional');
        if (add) {
            add.style.maxHeight = '0px';
            add.style.overflow = 'hidden';
            add.style.transition = 'max-height 0.3s ease';
        }
    });
    // При клике на любую карточку — переключаем все
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isOpen = Array.from(cards).some(c => {
                const add = c.querySelector('.additional');
                return add && add.style.maxHeight !== '0px';
            });
            cards.forEach(c => {
                const add = c.querySelector('.additional');
                if (add)
                    add.style.maxHeight = isOpen ? '0px' : add.scrollHeight + 'px';
            });
        });
    });
}
(async () => {
    try {
        const drivers = await getDrivers();
        const ferrariDrivers = drivers.filter(d => {
            const name = d.full_name.toLowerCase();
            return name.includes("leclerc") || name.includes("hamilton");
        });
        const closestLoc = await getClosestLocation(ferrariDrivers[0].driver_number);
        if (!closestLoc)
            return;
        const meeting = await getMeeting(closestLoc.meeting_key);
        renderTrackCard(meeting);
        ferrariDrivers.forEach(driver => renderDriverCard(driver));
        enableGlobalToggle();
        const ferrariTeam = {
            team_name: "Ferrari",
            logo_url: "https://upload.wikimedia.org/wikipedia/ru/thumb/c/c0/Scuderia_Ferrari_Logo.svg/120px-Scuderia_Ferrari_Logo.svg.png",
            country: "Italy",
            foundation_year: 1929,
            chief_engineer: "Enrico Cardile",
            points: 560,
            wins: 5,
            podiums: 12,
        };
        renderTeamCard(ferrariTeam);
    }
    catch (err) {
        console.error(err);
    }
})();
