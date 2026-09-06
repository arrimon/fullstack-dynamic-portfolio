import axios from "axios";

export async function uploadProjectImages(projectId, files, { onProgress } = {}) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const { data } = await axios.post(`/api/admin/projects/${projectId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}
