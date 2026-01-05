// Generate YouTube search URL for pedal reviews, sorted by view count
export function getYouTubeReviewUrl(brand: string, model: string): string {
  const query = encodeURIComponent(`${brand} ${model} pedal review`);
  // sp=CAM%253D sorts by view count
  return `https://www.youtube.com/results?search_query=${query}&sp=CAM%253D`;
}

