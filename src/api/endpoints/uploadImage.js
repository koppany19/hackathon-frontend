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

  const sourceName = image?.fileName || image?.name || "";
  const extension = sourceName.split(".").pop()?.toLowerCase();
  return EXTENSION_TO_MIME[extension] || "image/jpeg";
}

function inferFileName(image) {
  if (image?.fileName) return image.fileName;
  if (image?.name) return image.name;

  const mimeType = inferMimeType(image);
  const extension = mimeType.split("/").pop() || "jpg";
  return `avatar.${extension}`;
}

export function uploadProfileImage({ image }) {
  if (!image?.uri) {
    throw new Error("Image file is missing");
  }

  const formData = new FormData();
  formData.append("image", {
    uri: image.uri,
    name: inferFileName(image),
    type: inferMimeType(image),
  });

  return client.post("/users/avatar", formData);
}
