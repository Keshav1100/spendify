import { CLOUDINARY_API_URI, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from "axios";
const cloudinary_url = CLOUDINARY_API_URI;
export const uploadFileCloudinary = async (
  file: { uri?: string } | string,
  folderName: string
): Promise<ResponseType> => {
  try {
    if (!file) return { success: true, data: null };
    if (typeof file === "string") {
      return { success: true, data: file };
    }
    if (file && file.uri) {
      const formData = new FormData();
      formData.append("file", {
        uri: file?.uri,
        type: "image/jpeg",
        name: file?.uri?.split("/").pop(),
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);
      const response = await axios.post(cloudinary_url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response?.data;
      console.log("data", data);
      return { success: true, data: data?.secure_url };
    }
    return { success: true };
  } catch (error: any) {
    let msg = error?.message || "Error uploading file";
    console.log("Error uploading file: ", error);
    return { success: false, msg: msg };
  }
};
export const getProfileImage = async (file: any) => {
  if (file && typeof file === "string") return file;
  if (file && typeof file === "object") {
    console.log("file", file.uri);
    return file.uri;
  }
  return require("../assets/images/defaultAvatar.png");
};
export const getFilePath = async (file: any) => {
  if (file && typeof file === "string") return file;
  if (file && typeof file === "object") {
    console.log("file", file.uri);
    return file.uri;
  }
  return null;
};
