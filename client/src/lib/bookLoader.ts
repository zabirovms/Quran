/**
 * Utility for loading and processing book HTM files
 */

// Create a mapping of file numbers to titles
// This will be used for navigation and chapter identification
export const chapterTitles: { [key: string]: string } = {
  "1": "БИСМИЛЛОҲИР РАҲМОНИР РАҲИМ",
  "2": "УСУЛИ ДИН",
  "3": "ТАРҶУМА",
  "4": "ФУРУЪИ ДИН",
  "5": "ТАҲОРАТ",
  "6": "ҒУСЛ",
  "7": "ТАЯММУМ",
  "8": "ҲУКМИ ОБИ ЧОҲ",
  "9": "АҲКОМИ ЧОҲ",
  "10": "ЛИБОСИ НАМОЗГУЗОР",
  "11": "ЛИБОСИ НАМОЗГУЗОР",
  "12": "МАКОНИ НАМОЗГУЗОР",
  "13": "ВАҚТҲОИ НАМОЗ",
  "14": "ВАҚТҲОИ НАМОЗ",
  "15": "НИЯТИ НАМОЗ",
  "16": "ТАКБИРИ ТАҲРИМА",
  "17": "ҚИЁМ",
  "18": "ҚИРОАТ",
  "19": "РУКУЪ",
  "20": "САҶДА",
  // Add the rest of the chapters as identified
  "90": "РӮЗА",
  "91": "ЗАКОТ",
  "92": "ҲАҶҶ"
};

// Function to extract HTML content for a given chapter number
export async function getChapterContent(chapterNumber: number): Promise<string> {
  try {
    // Fetch the HTM file content from the public assets directory
    const response = await fetch(`/assets/${chapterNumber}.htm`);
    if (!response.ok) {
      throw new Error(`Failed to load chapter ${chapterNumber}`);
    }
    
    const htmlContent = await response.text();
    
    // Extract only the body content without altering it
    // This preserves all the original text and formatting while removing HTML headers
    const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyContentMatch ? bodyContentMatch[1] : htmlContent;
    
    // Process the content to fix any potential display issues without changing the text
    // Convert relative image paths if needed
    bodyContent = bodyContent.replace(/src="(\.\/)?images\//g, 'src="/assets/images/');
    
    return bodyContent;
  } catch (error: any) {
    console.error("Error loading chapter:", error);
    return `<p class="text-red-500">Error loading chapter ${chapterNumber}: ${error.message || 'Unknown error'}</p>`;
  }
}

// Get a list of all available chapters
export function getAvailableChapters() {
  // Return an array of chapter numbers (1-92)
  return Array.from({ length: 92 }, (_, i) => i + 1);
}

// Get a chapter title by number
export function getChapterTitle(chapterNumber: number): string {
  return chapterTitles[chapterNumber.toString()] || `Боби ${chapterNumber}`;
}