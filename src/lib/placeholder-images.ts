import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;


/**
 * Resolves an avatar URL from various possible sources.
 * It checks if the provided string is a data URI, and if not,
 * treats it as an ID for the placeholder images.
 * @param avatar - The 'avatar' field from the user's Firestore profile. Can be a data URI or an ID.
 * @returns The best available avatar image URL.
 */
export function getAvatarUrl(avatar: string | undefined): string {
    if (!avatar) {
      // Default fallback if no avatar is set
      return PlaceHolderImages.find(img => img.id === '1')?.imageUrl || '';
    }
  
    // Check if the avatar string is a base64 data URI
    if (avatar.startsWith('data:image')) {
      return avatar;
    }
  
    // Otherwise, assume it's a placeholder ID and look it up
    const image = PlaceHolderImages.find((img) => img.id === avatar);
    if (image) {
      return image.imageUrl;
    }
  
    // Fallback for an old ID format that might not be in the JSON
    return `https://picsum.photos/seed/${avatar}/100/100`;
}
