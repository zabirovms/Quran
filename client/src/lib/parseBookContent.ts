/**
 * A utility to parse the Farzi Ayn book content from HTML
 */
import bookHtml from '../../attached_assets/merged_book.html?raw';

export interface BookSection {
  title: string;
  content: string[];
  id: string;
}

export function parseBookContent(): BookSection[] {
  // Parse the HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(bookHtml, 'text/html');
  
  // Get all the body elements
  const sections: BookSection[] = [];
  let currentSection: BookSection | null = null;
  
  // Find all centered paragraphs which are likely section titles
  const titleElements = doc.querySelectorAll('p[align="center"]');
  
  titleElements.forEach((titleEl) => {
    const titleText = titleEl.textContent?.trim();
    
    // Skip empty titles
    if (!titleText) return;
    
    // Create a section ID from the title
    const id = titleText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\wа-яА-ЯҳҲҷҶғҒӣӢқҚӯӮ\-]/g, '') // Keep Tajik characters
      .substring(0, 50); // Limit length
    
    currentSection = {
      title: titleText,
      content: [],
      id
    };
    
    // Find all paragraphs until the next title
    let nextEl = titleEl.nextElementSibling;
    while (nextEl && !nextEl.hasAttribute('align')) {
      const text = nextEl.textContent?.trim();
      if (text) {
        currentSection.content.push(text);
      }
      nextEl = nextEl.nextElementSibling;
    }
    
    // Add the section if it has content
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
  });
  
  return sections;
}

// For testing purposes, display the first few sections
export function getFarziAynSections(): BookSection[] {
  try {
    return parseBookContent();
  } catch (error) {
    console.error("Error parsing book content:", error);
    return [
      {
        id: "error",
        title: "Хатогӣ",
        content: ["Хатогӣ ҳангоми коркарди китоб: " + error]
      }
    ];
  }
}