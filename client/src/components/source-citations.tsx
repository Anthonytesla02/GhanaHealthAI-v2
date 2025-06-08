import { useState } from "react";
import { type Source } from "@shared/schema";

interface SourceCitationsProps {
  sources: Source[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-medium text-slate-600 flex items-center">
          <i className="fas fa-book-medical mr-1 text-green-600"></i>
          Sources ({sources.length})
        </span>
        <i
          className={`fas fa-chevron-down text-xs text-slate-400 transform transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {sources.map((source, index) => (
            <div key={source.id || index} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">
                  {source.title || source.section || "Reference"}
                </span>
                {source.page && (
                  <span className="text-xs text-slate-500">{source.page}</span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{source.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
