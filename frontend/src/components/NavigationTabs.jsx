import { useState } from 'react';

function NavigationTabs({ tabs, onSelect }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  function handleClick(id) {
    setActiveTab(id);
    onSelect(id);
  }

  return (
    <div className="flex space-x-4 bg-gray-900 p-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`text-white px-4 py-2 rounded-md transition-colors duration-300 ${
            activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}
          onClick={() => handleClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default NavigationTabs;