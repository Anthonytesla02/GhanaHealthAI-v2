export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-white text-xs"></i>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div 
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" 
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div 
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" 
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-xs text-slate-500">Analyzing guidelines...</span>
        </div>
      </div>
    </div>
  );
}
