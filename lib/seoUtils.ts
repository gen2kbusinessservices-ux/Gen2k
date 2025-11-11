/**
 * SEO Utility Functions
 * Auto-generate SEO-friendly metadata
 */

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by checking existing slugs
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  let slug = generateSlug(title);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Generate SEO title from collection title
 */
export function generateSeoTitle(title: string, categoryName?: string): string {
  if (categoryName) {
    return `${title} - ${categoryName} Project | JVA Designs`;
  }
  return `${title} | JVA Designs Architecture`;
}

/**
 * Generate SEO description from collection description
 */
export function generateSeoDescription(description: string, title: string): string {
  if (!description || description.trim().length === 0) {
    return `Explore ${title}, an architectural project by JVA Designs. Award-winning architecture firm specializing in modern, sustainable design.`;
  }
  
  // Trim to ideal length (150-160 characters)
  const maxLength = 155;
  if (description.length <= maxLength) {
    return description;
  }
  
  return description.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate image alt text from title and description
 */
export function generateImageAlt(
  title: string,
  index: number,
  description?: string
): string {
  const baseAlt = `${title} - View ${index + 1}`;
  
  if (description && description.length > 0) {
    const shortDesc = description.split('.')[0]; // Get first sentence
    return `${baseAlt} - ${shortDesc}`;
  }
  
  return baseAlt;
}

/**
 * Validate and sanitize title
 */
export function sanitizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

/**
 * Extract keywords from title and description
 */
export function extractKeywords(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\s+/);
  
  // Filter out common words and short words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const keywords = words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 keywords
  
  return keywords;
}

/**
 * Generate Open Graph metadata
 */
export function generateOpenGraphMeta(
  title: string,
  description: string,
  imageUrl?: string
) {
  return {
    title: title,
    description: description,
    image: imageUrl || '/og-image.jpg',
    type: 'article',
    siteName: 'JVA Designs',
  };
}
