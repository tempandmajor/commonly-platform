
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param bucket Bucket name
 * @param path Path within the bucket (optional)
 * @returns URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  path?: string
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param url Full URL of the file to delete
 * @param bucket Bucket name
 * @returns boolean indicating success
 */
export const deleteFile = async (
  url: string,
  bucket: string
): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Get a signed URL for a file (for temporary access)
 * @param path File path
 * @param bucket Bucket name
 * @param expiresIn Expiry time in seconds (default: 60)
 * @returns Signed URL
 */
export const getSignedUrl = async (
  path: string,
  bucket: string,
  expiresIn = 60
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};
