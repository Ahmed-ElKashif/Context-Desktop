import { useState, useEffect, useRef } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { useNavigate, useLocation } from "react-router-dom";
import { searchService, SemanticSearchResult } from "../index";

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect (500ms for heavy embedding calls)
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchService.searchDocuments(searchQuery, 5);
        setSearchResults(result.data);
        setIsDropdownOpen(true);
      } catch (error: any) {
        console.error("Semantic search failed:", error);
        setSearchError(error.message || "Semantic search failed");
        setIsDropdownOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (docId: string) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
      navigate(`/read/${docId}`, { state: { returnUrl: location.pathname + location.search } });
  };

  return (
    <div className="w-[440px] relative" ref={dropdownRef}>
      <div className="relative flex items-center group">
        <div className="absolute left-4 inset-y-0 flex items-center z-10">
          <Icon name={isSearching ? "sync" : "search"} className={`text-[20px] text-light-primary dark:text-dark-primary ${isSearching ? "animate-spin" : ""}`} />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            setSearchError(null);
            if (!val.trim()) {
              setSearchResults([]);
              setIsDropdownOpen(false);
            }
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsDropdownOpen(true);
          }}
          placeholder="Ask anything,searching by meaning (Cmd+K)"
          className="w-full bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-xl py-2.5 pl-12 pr-12 text-sm font-medium text-light-text dark:text-white placeholder:text-light-text/60 dark:placeholder:text-white/60 focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary/50 dark:focus:ring-dark-primary/50 transition-all shadow-inner relative z-0"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              searchInputRef.current?.focus();
            }}
            className="absolute right-4 inset-y-0 flex items-center text-light-text/60 dark:text-white/50 hover:text-light-text dark:hover:text-white transition-colors z-10"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {searchError ? (
            <div className="p-6 text-center">
              <Icon name="error_outline" className="text-red-500/80 dark:text-red-400/80 text-[32px] mx-auto mb-2" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{searchError}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto p-2">
              <li className="px-3 py-2 text-xs font-bold text-light-text/80 dark:text-white/80 tracking-wide border-b border-light-border/50 dark:border-white/5 mb-1">
                Semantic Matches
              </li>
              {searchResults.map((chunk, index) => (
                <li key={`${chunk.documentId}-${chunk.chunkIndex}-${index}`}>
                  <button onClick={() => handleSelectResult(chunk.documentId)} className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg hover:bg-light-bg dark:hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <div className="w-8 h-8 rounded-lg bg-light-primary/10 dark:bg-white/5 text-light-primary dark:text-white/70 flex items-center justify-center shrink-0">
                        <Icon name={chunk.documentType === 'Image' ? 'image' : 'description'} className="text-[16px]" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h4 className="text-sm font-bold text-light-text dark:text-white truncate group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">{chunk.documentTitle}</h4>
                        <p className="text-xs text-light-text/70 dark:text-white/70 line-clamp-2 mt-1 font-serif bg-light-surface/50 dark:bg-black/20 p-1.5 rounded border border-light-border/50 dark:border-white/5 italic">
                          "{chunk.text}"
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-light-text/70 dark:text-white/60">
                          <span>Chunk #{chunk.chunkIndex + 1}</span>
                          <span>•</span>
                          <span>{chunk.documentType}</span>
                        </div>
                      </div>
                    </div>
                    
                    {chunk.confidenceScore && (
                      <div className="shrink-0 ml-3 px-2 py-1 rounded bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 flex items-center gap-1">
                        <Icon name="my_location" className="text-[12px] text-light-primary dark:text-dark-primary" />
                        <span className="text-[10px] font-bold text-light-primary dark:text-dark-primary">
                          {Math.round(chunk.confidenceScore)}%
                        </span>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <Icon name="travel_explore" className="text-light-text/50 dark:text-white/40 text-[32px] mx-auto mb-2" />
              <p className="text-sm font-bold text-light-text/80 dark:text-white/80">No semantic matches found</p>
              <p className="text-xs text-light-text/70 dark:text-white/70 mt-1">Try asking your question differently.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};