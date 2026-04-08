type LocationType = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

type DriverType = {
  full_name: string;
  driver_number: number;
  team_name: string;
  headshot_url: string;
}

type MeetingType = {
  circuit_image: string;
  location: string;
  meeting_official_name: string;
}


const trackContainer = document.getElementById("track");
const driversContainer = document.getElementById("drivers");

const SESSION_KEY = 9158;
const TARGET_TIME = "2024-03-02T15:23:45Z";


async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

const createCard = () => {
  const card = document.createElement("div");
  card.className = "card"
  return card
}

const getDrivers = async (): Promise<DriverType[]> => {
  return await fetchJSON<DriverType[]>(
      `https://api.openf1.org/v1/drivers?session_key=${SESSION_KEY}`
  )
}

async function getClosestLocation(driverNumber: number): Promise<LocationType | null> {
  const data: LocationType[] = await fetchJSON<LocationType[]>(
      `https://api.openf1.org/v1/location?session_key=${SESSION_KEY}&driver_number=${driverNumber}`
  );

  if (!data.length) return null;

  const target = new Date(TARGET_TIME).getTime();
  let closest: LocationType | null = null;
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

async function getMeeting(meetingKey: number): Promise<MeetingType> {
  const meetings = await fetchJSON<MeetingType[]>(`https://api.openf1.org/v1/meetings?meeting_key=${meetingKey}`);
  return meetings[0];
}

// --- Рендер ---
function renderTrackCard(meeting: MeetingType) {
  if (!trackContainer) return;
  const card = createCard()

  card.innerHTML = `
    <h3>${meeting.location}</h3>
    <img src="${meeting.circuit_image}" alt="${meeting.location}" style="width:100%; border-radius:6px;" />
  `;

  trackContainer.appendChild(card);
}

function renderDriverCard(driver: DriverType) {
  if (!driversContainer) return;

  const card = createCard();

  card.innerHTML = `
    <img src="${driver.headshot_url}" alt="${driver.full_name}" style="width:100px; height:100px; border-radius:50%;" />
    <h4>${driver.full_name.split(" ")[1]}</h4>
  `;

  driversContainer.appendChild(card);
}

(async () => {
  try {
    const drivers = await getDrivers();
    const ferrariDrivers = drivers.filter(d => {
      const name = d.full_name.toLowerCase();
      return name.includes("leclerc") || name.includes("hamilton");
    })

    // Берём первого пилота, чтобы найти ближайший трек
    const closestLoc = await getClosestLocation(ferrariDrivers[0].driver_number);
    if (!closestLoc) return;

    const meeting = await getMeeting(closestLoc.meeting_key);
    renderTrackCard(meeting);

    ferrariDrivers.forEach(driver => renderDriverCard(driver));

  } catch (err) {
    console.error(err);
  }
})();