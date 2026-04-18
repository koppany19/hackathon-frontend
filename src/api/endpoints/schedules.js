import client from "../client";

export function getSchedules() {
  return client.get("/schedules");
}

export function createSchedule({ day_of_week, subject_name, start_time, end_time }) {
  return client.post("/schedules", { day_of_week, subject_name, start_time, end_time });
}

export function updateSchedule(id, { day_of_week, subject_name, start_time, end_time }) {
  return client.put(`/schedules/${id}`, { day_of_week, subject_name, start_time, end_time });
}

export function replaceScheduleFromImage({ image }) {
  if (!image?.uri) throw new Error("Image is missing");

  const formData = new FormData();
  const mimeType = image.mimeType ?? image.type ?? "image/jpeg";
  const fileName = image.fileName ?? image.name ?? "timetable.jpg";

  formData.append("image", { uri: image.uri, name: fileName, type: mimeType });

  return client.post("/schedules/from-image", formData);
}
