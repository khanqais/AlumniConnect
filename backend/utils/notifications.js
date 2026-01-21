// utils/notifications.js

/**
 * Notify all students about a new mentor availability slot.
 * For now, it just logs the notification.
 * You can later integrate email, SMS, or push notifications here.
 */

const Student = require("../models/User"); // adjust if your student model is in a different path

async function notifyAllStudents(slot) {
  try {
    // Fetch all students (or filter based on mentor/skills if needed)
    const students = await Student.find();

    // Loop through students and "notify" them
    for (const student of students) {
      // Here you can integrate actual notifications later
      console.log(
        `Notifying student ${student.name} (${student.email}) about new slot:`,
        {
          mentorId: slot.mentorId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomId: slot.roomId,
        }
      );
    }

    return true;
  } catch (error) {
    console.error("Error notifying students:", error);
    throw error;
  }
}

module.exports = { notifyAllStudents };
