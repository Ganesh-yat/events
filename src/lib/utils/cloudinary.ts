import { CLOUD_NAME } from "../../../config"
import { UPLOAD_PRESET } from "../../../config"

export type UploadableFile = {
    uri: string;
    name?: string;
    type?: string;
};

/**
 * Uploads one or more images to Cloudinary from React Native (Expo).
 */
export const uploadToCloudinary = async (files: UploadableFile[]): Promise<string[]> => {

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary environment variables are not defined.");
    }

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const uploadedUrls: string[] = [];

    for (const file of files) {
        try {
            if (!file.uri) {
                console.warn("Skipping file with no URI:", file);
                continue;
            }

            const uriParts = file.uri.split(".");
            const fileType = uriParts[uriParts.length - 1];

            const formData = new FormData();
            formData.append("file", {
                uri: file.uri,
                name: file.name || `upload.${fileType}`,
                type: file.type || `image/${fileType}`,
            } as any); // RN FormData doesn't type-check `file` objects

            formData.append("upload_preset", UPLOAD_PRESET);

            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.secure_url) {
                console.error("Cloudinary upload failed:", data);
                throw new Error(data.error?.message || "Image upload failed");
            }

            uploadedUrls.push(data.secure_url);
        } catch (error) {
            console.error("Upload failed for file:", file.uri, error);
            throw error;
        }
    }

    return uploadedUrls;
};
