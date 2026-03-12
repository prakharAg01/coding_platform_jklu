export default function RecentSubmissions() {
  return (
    <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden shadow-lg">
      <div className="p-5 px-6 flex justify-between items-center border-b border-white/5">
        <h3 className="font-semibold text-sm">Recent Submissions</h3>
        <a
          href="#"
          className="text-[#e6d15a] text-[11px] font-bold tracking-wide hover:underline underline-offset-4"
        >
          View All
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-white/40 text-[11px] border-b border-white/5 tracking-wider">
              <th className="py-4 px-6 font-medium w-2/5">Problem</th>
              <th className="py-4 px-6 font-medium w-1/5">Language</th>
              <th className="py-4 px-6 font-medium w-1/5">Status</th>
              <th className="py-4 px-6 font-medium w-1/5 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">
                Trapping Rain Water
              </td>
              <td className="py-5 px-6 text-white/60">C++</td>
              <td className="py-5 px-6">
                <span className="bg-[#95E935]/10 text-[#95E935] border border-[#95E935]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">
                  ACCEPTED
                </span>
              </td>
              <td className="py-5 px-6 text-white/40 text-right">2 hours ago</td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">
                Longest Palindromic Substring
              </td>
              <td className="py-5 px-6 text-white/60">Python</td>
              <td className="py-5 px-6">
                <span className="bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">
                  WRONG ANSWER
                </span>
              </td>
              <td className="py-5 px-6 text-white/40 text-right">5 hours ago</td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">
                Valid Parentheses
              </td>
              <td className="py-5 px-6 text-white/60">Java</td>
              <td className="py-5 px-6">
                <span className="bg-[#95E935]/10 text-[#95E935] border border-[#95E935]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">
                  ACCEPTED
                </span>
              </td>
              <td className="py-5 px-6 text-white/40 text-right">Yesterday</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

