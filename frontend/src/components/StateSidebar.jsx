
const stats = [
  { label: 'Location 1', value: 4504210, percent: '55%', color: 'bg-blue-500' },
  { label: 'Location 2', value: 2100590, percent: '25%', color: 'bg-green-500' },
  { label: 'Location 3', value: 980240, percent: '15%', color: 'bg-purple-500' },
  { label: 'Location 4', value: 504210, percent: '5%', color: 'bg-pink-500' }
];

export default function StatSidebar() {
  return (
    <div>
      <div className="font-semibold text-lg text-white mb-2">Key Locations</div>
      <ul>
        {stats.map(stat => (
          <li key={stat.label} className="flex items-center mb-2">
            <span className={`w-3 h-3 rounded-full mr-3 ${stat.color}`}></span>
            <span className="flex-1 text-white">{stat.label}</span>
            <span className="ml-2 text-blue-200 font-bold">{stat.value.toLocaleString()}</span>
            <span className="ml-2 text-gray-400">{stat.percent}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}