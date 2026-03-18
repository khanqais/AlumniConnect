

const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "../backend/config/alumniStudent.json",
  scopes: ["https://www.googleapis.com/auth/calendar"]
});

const calendar = google.calendar({ version: "v3", auth });

async function createCalendarEvent({ startTime, endTime, summary }) {
  const event = {
    summary: summary || "Mentor Availability Slot",
    start: { dateTime: startTime },
    end: { dateTime: endTime },
  };

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: event
  });

  return event;
}

module.exports = createCalendarEvent;
