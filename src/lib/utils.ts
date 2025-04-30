
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currencyCode} ${amount}`;
  }
}

/**
 * Format duration in seconds to a readable time format (mm:ss or hh:mm:ss)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Update user's online status and last seen time
 */
export async function updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
  try {
    if (!userId) return;
    
    await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: isOnline ? null : new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating user presence:', error);
  }
}

/**
 * Delete a file from Supabase storage bucket
 */
export async function deleteStorageFile(fileUrl: string, bucketName: string): Promise<boolean> {
  try {
    if (!fileUrl) return false;
    
    // Extract path from URL
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(new RegExp(`${bucketName}\/(.*)`));
    
    if (!pathMatch || !pathMatch[1]) {
      console.error('Could not parse storage path from URL:', fileUrl);
      return false;
    }
    
    const filePath = pathMatch[1];
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    
    if (error) {
      console.error('Error deleting file from storage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteStorageFile:', error);
    return false;
  }
}
