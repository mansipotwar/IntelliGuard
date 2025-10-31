// Sidebar.jsx (or keep in same file above Dashboard if you're not splitting components)


function Sidebar({ location, risk }) {
  return (
    <div
      className="
        absolute top-8 left-8 z-[1000] 
        w-72 p-6 
        bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl
        text-white space-y-4 pointer-events-auto
      "
    >
      {/* Logo */}
      <div className="text-2xl font-bold tracking-wide text-cyan-300">DisasterGuard AI</div>

      {/* Location Info */}
      <div>
        <div className="text-sm text-blue-200">Latitude:</div>
        <div className="font-mono text-lg">
          {location?.lat != null ? location.lat.toFixed(4) : 'Detecting...'}
        </div>
        <div className="text-sm text-blue-200 mt-2">Longitude:</div>
        <div className="font-mono text-lg">
          {location?.lng != null ? location.lng.toFixed(4) : 'Detecting...'}
        </div>
      </div>

      {/* Risk Status */}
      <div className="flex items-center">
        <span
          className={`w-3 h-3 rounded-full mr-3 ${
            risk === 'High' ? 'bg-red-500 animate-pulse' : 'bg-green-400'
          }`}
        />
        <span className={`font-bold ${risk === 'High' ? 'text-red-400' : 'text-green-300'}`}>
          Risk: {risk || 'Checking…'}
        </span>
      </div>
    </div>
  );
}

export default Sidebar;