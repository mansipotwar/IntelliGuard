
export default function TrendCard() {
  return (
    <div className="bg-[#21264b] rounded-xl p-5 shadow-lg text-white">
      <div className="text-lg font-bold">Trend Summary</div>
      <div className="my-3 text-3xl text-green-300 font-extrabold">22,870 <span className="text-base text-green-200">▲ 71.8%</span></div>
      <div className="text-gray-300 text-sm">This year versus last year</div>
    </div>
  );
}