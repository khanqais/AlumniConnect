

const cron = require("node-cron");
const Webinar = require("../models/Webinar");
const { sendWebinarNotificationEmail } = require("../utils/emailService");

console.log("🔥 Webinar Reminder Cron Loaded");


cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("⏰ Cron: Checking upcoming webinars...");

    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

    const webinars = await Webinar.find({
      scheduledAt: { $gte: now, $lte: in15Minutes },
    }).populate("registeredUsers");

    console.log("📌 Webinars found:", webinars.length);

    for (const webinar of webinars) {
      console.log(
        `🎯 Webinar: ${webinar.webinarName}, Registered: ${webinar.registeredUsers.length}`
      );

      for (const user of webinar.registeredUsers) {
        console.log(`📧 Sending reminder to ${user.email}`);

        await sendWebinarNotificationEmail({
          toEmail: user.email,
          studentName: user.name,
          webinarName: webinar.webinarName,
          speakerName: "Alumni",
          date: webinar.scheduledAt.toDateString(),
          time: webinar.scheduledAt.toLocaleTimeString(),
          roomId: webinar.roomId,
        });
      }
    }
  } catch (err) {
    console.error("❌ Cron error:", err);
  }
});
