// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const waterCountElement = document.getElementById("waterCount");
const zeroCountElement = document.getElementById("zeroCount");
const powerCountElement = document.getElementById("powerCount");
const teamStats = document.querySelector(".team-stats");

//Track attendance
let count = 0;
const maxCount = 50;
let goalReached = false;

const totalCountKey = "totalAttendanceCount";
const waterCountKey = "waterTeamCount";
const zeroCountKey = "zeroTeamCount";
const powerCountKey = "powerTeamCount";
const attendeeListKey = "attendeeList";
let attendees = [];

const attendeeSection = document.createElement("div");
const attendeeHeading = document.createElement("h3");
const attendeeList = document.createElement("ul");

attendeeSection.style.marginTop = "30px";
attendeeSection.style.paddingTop = "30px";
attendeeSection.style.borderTop = "2px solid #f1f5f9";
attendeeSection.style.textAlign = "left";

attendeeHeading.textContent = "Attendee Check-In List";
attendeeHeading.style.color = "#64748b";
attendeeHeading.style.fontSize = "16px";
attendeeHeading.style.marginBottom = "16px";

attendeeList.style.listStyle = "none";
attendeeList.style.display = "flex";
attendeeList.style.flexDirection = "column";
attendeeList.style.gap = "10px";
attendeeList.style.margin = "0";
attendeeList.style.padding = "0";

attendeeSection.appendChild(attendeeHeading);
attendeeSection.appendChild(attendeeList);
teamStats.insertAdjacentElement("afterend", attendeeSection);

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No attendees checked in yet.";
    emptyItem.style.backgroundColor = "#f8fafc";
    emptyItem.style.color = "#64748b";
    emptyItem.style.borderRadius = "12px";
    emptyItem.style.padding = "12px 14px";
    emptyItem.style.textAlign = "center";
    attendeeList.appendChild(emptyItem);
    return;
  }

  let index = 0;

  while (index < attendees.length) {
    const attendee = attendees[index];
    const listItem = document.createElement("li");
    const nameSpan = document.createElement("span");
    const teamSpan = document.createElement("span");

    listItem.style.backgroundColor = "#f8fafc";
    listItem.style.borderRadius = "12px";
    listItem.style.padding = "12px 14px";
    listItem.style.display = "flex";
    listItem.style.alignItems = "center";
    listItem.style.justifyContent = "space-between";

    nameSpan.textContent = attendee.name;
    nameSpan.style.color = "#2c3e50";
    nameSpan.style.fontWeight = "600";

    teamSpan.textContent = attendee.teamName;
    teamSpan.style.color = "#64748b";
    teamSpan.style.fontSize = "14px";
    teamSpan.style.fontWeight = "500";

    listItem.appendChild(nameSpan);
    listItem.appendChild(teamSpan);
    attendeeList.appendChild(listItem);

    index++;
  }
}

function getSavedNumber(key) {
  const savedValue = localStorage.getItem(key);

  if (savedValue === null) {
    return 0;
  }

  const parsedValue = parseInt(savedValue);

  if (isNaN(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function saveCounts() {
  localStorage.setItem(totalCountKey, count);
  localStorage.setItem(waterCountKey, waterCountElement.textContent);
  localStorage.setItem(zeroCountKey, zeroCountElement.textContent);
  localStorage.setItem(powerCountKey, powerCountElement.textContent);
  localStorage.setItem(attendeeListKey, JSON.stringify(attendees));
}

function resetCounts() {
  count = 0;
  goalReached = false;

  attendeeCount.textContent = "0";
  progressBar.style.width = "0%";
  waterCountElement.textContent = "0";
  zeroCountElement.textContent = "0";
  powerCountElement.textContent = "0";

  localStorage.removeItem(totalCountKey);
  localStorage.removeItem(waterCountKey);
  localStorage.removeItem(zeroCountKey);
  localStorage.removeItem(powerCountKey);
  localStorage.removeItem(attendeeListKey);

  attendees = [];
  renderAttendeeList();

  greeting.textContent = "Counts reset.";
  greeting.style.display = "block";
  greeting.classList.remove("success-message");

  nameInput.value = "";
  teamSelect.selectedIndex = 0;
  nameInput.focus();
}

function loadCounts() {
  count = getSavedNumber(totalCountKey);
  waterCountElement.textContent = getSavedNumber(waterCountKey);
  zeroCountElement.textContent = getSavedNumber(zeroCountKey);
  powerCountElement.textContent = getSavedNumber(powerCountKey);

  const savedAttendees = localStorage.getItem(attendeeListKey);

  if (savedAttendees) {
    try {
      const parsedAttendees = JSON.parse(savedAttendees);

      if (Array.isArray(parsedAttendees)) {
        attendees = parsedAttendees;
      }
    } catch (error) {
      attendees = [];
    }
  }

  attendeeCount.textContent = count;

  const percentage = Math.round((count / maxCount) * 100);
  progressBar.style.width = `${percentage}%`;

  if (count >= maxCount) {
    goalReached = true;
  }

  renderAttendeeList();
}

function getWinningTeamName() {
  const waterCount = parseInt(waterCountElement.textContent);
  const zeroCount = parseInt(zeroCountElement.textContent);
  const powerCount = parseInt(powerCountElement.textContent);

  if (waterCount >= zeroCount && waterCount >= powerCount) {
    return "Team Water Wise";
  }

  if (zeroCount >= waterCount && zeroCount >= powerCount) {
    return "Team Net Zero";
  }

  return "Team Renewables";
}

loadCounts();

document.addEventListener("keydown", function (event) {
  if (event.metaKey && event.key.toLowerCase() === "r") {
    event.preventDefault();
    resetCounts();
  }
});

//Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from submitting normally

  form.insertAdjacentElement("beforebegin", greeting);

  if (goalReached) {
    const winningTeam = getWinningTeamName();
    greeting.textContent = `🎉 Check-in goal reached! Winning team: ${winningTeam}!`;
    greeting.style.display = "block";
    greeting.classList.add("success-message");
    return;
  }

  //Get forms values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  if (name === "") {
    greeting.textContent = "Please enter a name.";
    greeting.style.display = "block";
    greeting.classList.remove("success-message");
    return;
  }

  //Increment count
  count++;
  attendeeCount.textContent = count;

  //Update progress bar
  const percentage = Math.round((count / maxCount) * 100);
  progressBar.style.width = `${percentage}%`;

  //Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  attendees.push({
    name: name,
    teamName: teamName,
  });

  renderAttendeeList();

  saveCounts();

  if (count >= maxCount) {
    goalReached = true;
    const winningTeam = getWinningTeamName();
    greeting.textContent = `🎉 Check-in goal reached! Winning team: ${winningTeam}!`;
    greeting.style.display = "block";
    greeting.classList.add("success-message");

    nameInput.value = "";
    teamSelect.selectedIndex = 0;
    nameInput.focus();
    return;
  }

  //Show welcome message
  greeting.textContent = `Welcome, ${name} from ${teamName}!`;
  greeting.style.display = "block";
  greeting.classList.add("success-message");

  nameInput.value = "";
  teamSelect.selectedIndex = 0;
  nameInput.focus();
});
