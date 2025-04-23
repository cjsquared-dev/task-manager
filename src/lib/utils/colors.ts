export default function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent));
  const b = Math.min(255, Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent));
  return `rgb(${r}, ${g}, ${b})`;
}

// Usage example
// const originalColor = "#ff0000"; // Red
// const lightenedColor = lightenColor(originalColor, 0.2); // Lighten by 20%
// console.log(lightenedColor); // Outputs a lighter shade of red
