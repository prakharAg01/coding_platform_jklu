import React from "react";
import CountdownTimer from "./CountdownTimer";

export default function ContestSidebar({ contest, user, leaderboard = [] }) {
  // Find current user's rank from leaderboard
  const userRank = user?._id 
    ? leaderboard.find(entry => entry.user_id === user._id || entry.userId === user._id)
    : null;

  const rank = userRank?.rank ?? "-";

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card-dark border border-white/5 rounded-lg p-5">
        <h3 className="text-slate-400 text-sm font-medium mb-3">CURRENT RANK</h3>
        <div className="text-3xl font-bold text-white">#{rank}</div>
      </div>
      {contest?.end_time && <CountdownTimer endTime={contest.end_time} />}
    </div>
  );
}
