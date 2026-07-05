import { useEffect, useRef } from "react";

export const useHighlighter = (
  text: string | undefined,
  query: string | undefined,
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text || !containerRef.current) return;

    const container = containerRef.current;
    
    // Reset content to raw text first
    container.textContent = text;

    if (!query) return;
    
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    try {
      // Create a walker to iterate over all text nodes safely
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      const nodesToReplace: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue?.toLowerCase().includes(cleanQuery)) {
          nodesToReplace.push(node as Text);
        }
      }

      let firstMark: HTMLElement | null = null;

      for (const textNode of nodesToReplace) {
        const textContent = textNode.nodeValue || '';
        
        const regex = new RegExp(`(${cleanQuery})`, 'gi');
        const parts = textContent.split(regex);
        
        if (parts.length <= 1) continue;

        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (part.toLowerCase() === cleanQuery) {
            const mark = document.createElement('mark');
            mark.className = 'search-highlight';
            mark.textContent = part;
            
            fragment.appendChild(mark);
            
            if (!firstMark) firstMark = mark;
          } else if (part) {
            fragment.appendChild(document.createTextNode(part));
          }
        });

        const parent = textNode.parentNode;
        if (parent) {
          parent.replaceChild(fragment, textNode);
        }
      }

      if (firstMark) {
        setTimeout(() => {
          firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      
    } catch (err) {
      console.error("Highlighter failed:", err);
      container.textContent = text; // fallback
    }
    
  }, [text, query]);

  return { containerRef };
};
