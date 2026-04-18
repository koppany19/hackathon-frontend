import client from "../client";

const EXTENSION_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

function inferMimeType(image) {
  if (image?.mimeType) return image.mimeType;
  if (image?.type && image.type.includes("/")) return image.type;
  const ext = (image?.fileName || image?.name || "").split(".").pop()?.toLowerCase();
  return EXTENSION_TO_MIME[ext] || "image/jpeg";
}

function inferFileName(image) {
  if (image?.fileName) return image.fileName;
  if (image?.name) return image.name;
  const ext = inferMimeType(image).split("/").pop() || "jpg";
  return `task.${ext}`;
}

export function getTodayTasks() {
  return client.get("/daily-tasks/today");
}

export function uploadTaskPhoto(taskId, image) {
  if (!image?.uri) throw new Error("Image file is missing");
  const formData = new FormData();
  formData.append("photo", {
    uri: image.uri,
    name: inferFileName(image),
    type: inferMimeType(image),
  });
  return client.post(`/daily-tasks/${taskId}/photo`, formData);
}

export function getAvailableDailyTasks() {
  return client.get("/daily-tasks/available");
}

export function getAvailableTasks() {
  return client.get("/tasks");
}

export function swapTask(dailyTaskId, targetTaskId) {
  return client.post(`/daily-tasks/${dailyTaskId}/swap`, { task_id: targetTaskId });
}
