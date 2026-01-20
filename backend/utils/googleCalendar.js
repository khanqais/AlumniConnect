// const { google } = require("googleapis");

// const calendar = google.calendar({ version: "v3" });

// const auth = new google.auth.JWT(
//   process.env.GOOGLE_CLIENT_EMAIL,
//   null,
//   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//   ["https://www.googleapis.com/auth/calendar"]
// );

// const createCalendarEvent = async ({ startTime, endTime, summary }) => {
//   await auth.authorize();

//   const event = {
//     summary,
//     start: { dateTime: startTime },
//     end: { dateTime: endTime }
//   };

//   await calendar.events.insert({
//     auth,
//     calendarId: "primary",
//     resource: event
//   });
// };

// module.exports = createCalendarEvent;
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
