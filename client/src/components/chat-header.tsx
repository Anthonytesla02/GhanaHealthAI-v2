export function ChatHeader() {
  return (
    <header className="bg-blue-600 text-white px-4 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-stethoscope text-white text-lg"></i>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Ghana STG Assistant</h1>
            <p className="text-blue-100 text-sm">Standard Treatment Guidelines</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-100">Online</span>
        </div>
      </div>
    </header>
  );
}
