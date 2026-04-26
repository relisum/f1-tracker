const FERRARI_TEAM = {
    team_name: "Ferrari",
    logo_url: "https://upload.wikimedia.org/wikipedia/ru/thumb/c/c0/Scuderia_Ferrari_Logo.svg/120px-Scuderia_Ferrari_Logo.svg.png",
    country: "Italy",
    foundation_year: 1929,
    chief_engineer: "Enrico Cardile",
    points: 560,
    wins: 5,
    podiums: 12,
};
// ApiClient class with encapsulation
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async fetchJSON(path) {
        const res = await fetch(`${this.baseUrl}${path}`);
        if (!res.ok)
            throw new Error(`Request failed: ${this.baseUrl}${path}`);
        return res.json();
    }
}
// class BaseEntity with abstraction
class BaseEntity {
    constructor(client) {
        this.client = client;
    }
}
// class Driver with inherit
class Driver extends BaseEntity {
    constructor(client, data) {
        super(client);
        this.number = data.driver_number;
        this.name = data.full_name;
        this.team = data.team_name;
        this.headshotUrl = data.headshot_url;
        this.countryCode = data.country_code;
    }
    async fetch() {
        return this.getClosestLocation();
    }
    async getClosestLocation() {
        const data = await this.client.fetchJSON(`/v1/location?session_key=${Driver.SESSION_KEY}&driver_number=${this.number}`);
        if (!data.length)
            return null;
        const target = new Date(Driver.TARGET_TIME).getTime();
        return data.reduce((closest, point) => {
            const diff = Math.abs(new Date(point.date).getTime() - target);
            const bestDiff = Math.abs(new Date(closest.date).getTime() - target);
            return diff < bestDiff ? point : closest;
        });
    }
    static async fetchAll(client) {
        const data = await client.fetchJSON(`/v1/drivers?session_key=${Driver.SESSION_KEY}`);
        return data.map(d => new Driver(client, d));
    }
}
Driver.SESSION_KEY = 9158;
Driver.TARGET_TIME = "2024-03-02T15:23:45Z";
// class FerrariDriver with polymorphism
class FerrariDriver extends Driver {
    constructor(client, data, commandColor = "#DC0000") {
        super(client, data);
        this.commandColor = commandColor;
    }
    isFerrari() {
        return this.team.toLowerCase().includes("ferrari");
    }
    render(container) {
        const card = document.createElement("div");
        card.className = "card";
        card.style.borderTop = `3px solid ${this.commandColor}`;
        card.innerHTML = `
      <img src="${this.headshotUrl}" alt="${this.name}" />
      <h4>${this.name.split(" ")[1]}</h4>
      <div class="additional">
        ${this.team} | ${this.countryCode || "N/A"}
      </div>
    `;
        container.appendChild(card);
    }
}
// Render
class Renderer {
    constructor(containerId) {
        const el = document.getElementById(containerId);
        const driversEl = document.getElementById("drivers");
        if (!el || !driversEl)
            throw new Error(`Container #${containerId} not found`);
        this.container = el;
        this.driversContainer = driversEl;
    }
    renderTrack(meeting) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <h3>${meeting.location}</h3>
      <img src="${meeting.circuit_image}" alt="${meeting.location}" />
    `;
        this.container.appendChild(card);
    }
    renderTeamCard(team) {
        if (!this.driversContainer || !team)
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
        this.driversContainer.appendChild(card);
    }
    enableToggle() {
        const cards = this.container.querySelectorAll(".card");
        cards.forEach(card => {
            const add = card.querySelector(".additional");
            if (add) {
                add.style.maxHeight = "0px";
                add.style.overflow = "hidden";
                add.style.transition = "max-height 0.3s ease";
            }
        });
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const isOpen = Array.from(cards).some(c => {
                    const add = c.querySelector(".additional");
                    return add && add.style.maxHeight !== "0px";
                });
                cards.forEach(c => {
                    const add = c.querySelector(".additional");
                    if (add)
                        add.style.maxHeight = isOpen ? "0px" : `${add.scrollHeight}px`;
                });
            });
        });
    }
}
// App
class App {
    constructor() {
        this.client = new ApiClient("https://api.openf1.org");
        this.trackRenderer = new Renderer("track");
        this.driverRenderer = new Renderer("drivers");
    }
    async run() {
        const allDrivers = await Driver.fetchAll(this.client);
        const ferrariDrivers = allDrivers
            .filter(d => {
            const name = d.name.toLowerCase();
            return name.includes("leclerc") || name.includes("hamilton");
        })
            .map(d => new FerrariDriver(this.client, {
            driver_number: d.number,
            full_name: d.name,
            team_name: d.team,
            headshot_url: d.headshotUrl,
            country_code: d.countryCode,
        }));
        if (!ferrariDrivers.length)
            return;
        const location = await ferrariDrivers[0].getClosestLocation();
        if (!location)
            return;
        const [meeting] = await this.client.fetchJSON(`/v1/meetings?meeting_key=${location.meeting_key}`);
        this.trackRenderer.renderTrack(meeting);
        ferrariDrivers.forEach(driver => driver.render(this.driverRenderer["container"]));
        this.trackRenderer.renderTeamCard(FERRARI_TEAM);
        this.driverRenderer.enableToggle();
    }
}
(async () => {
    try {
        const app = new App();
        await app.run();
    }
    catch (err) {
        console.error("App error:", err);
    }
})();
