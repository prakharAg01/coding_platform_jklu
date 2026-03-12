import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../main";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import ActiveNowHero from "../components/challenges/ActiveNowHero";
import PickAChallenge from "../components/challenges/PickAChallenge";
import DailyTracker from "../components/challenges/DailyTracker";
import ChallengeRules from "../components/challenges/ChallengeRules";

export default function ChallengesPage() {
  const { isAuthenticated } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [activeContest, setActiveContest] = useState(null);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: contestsRes }, { data: problemsRes }] = await Promise.all([
          api.get("/contests"),
          api.get("/problems"),
        ]);

        const now = new Date();
        const live = (contestsRes.contests || []).find((c) => {
          const start = new Date(c.start_time);
          const end = new Date(c.end_time);
          return now >= start && now <= end;
        });

        setActiveContest(live || null);
        setProblems(problemsRes.problems || []);
      } catch {
        setActiveContest(null);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-accent-yellow selection:text-black">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <ActiveNowHero contest={activeContest} loading={loading} />

        <section>
          <PickAChallenge problems={problems} loading={loading} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 items-start">
          <DailyTracker />
          <ChallengeRules />
        </section>
      </main>
    </div>
  );
}

