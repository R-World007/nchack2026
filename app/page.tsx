"use client";

import { useEffect, useState } from "react";

type Score = {
  master_score: number;
  confidence: string;
  coverage: string;
  subscores: {
    market_integrity: number;
    dev_velocity: number;
    on_chain_security: number;
  };
  rationale: {
    market_integrity: string;
    dev_velocity: string;
    on_chain_security: string;
  };
  error?: string;
};

// Simple in-memory cache for serverless runs (resets on cold start)
const cache: Record<string, Score> = {};

export default function AIAsyncScore({ coin }: { coin: string }) {
  const [score, setScore] = useState<Score | null>(null);

  useEffect(() => {
    if (cache[coin]) {
      setScore(cache[coin]);
      return;
    }

    fetch(`/api/score?coin=${coin}`)
      .then((res) => res.json())
      .then((data) => {
        setScore(data);
        if (!data.error) cache[coin] = data; // cache successful results
      })
      .catch((err) => {
        setScore({ error: String(err) } as any);
      });
  }, [coin]);

  if (!score) return <p className="text-gray-400 mt-2">Loading AI score...</p>;
  if (score.error)
    return <p className="text-red-500 mt-2 text-sm">{score.error}</p>;

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <p className="mt-2 font-bold">
        Master Score:{" "}
        <span
          className={
            score.master_score >= 80
              ? "text-green-400"
              : score.master_score >= 60
                ? "text-yellow-400"
                : "text-red-500"
          }
        >
          {score.master_score}
        </span>
      </p>

      <p className="text-gray-300">
        Confidence: <span className="text-teal-300">{score.confidence}</span>{" "}
        <span className="text-gray-500">
          (coverage {score.coverage}, no social)
        </span>
      </p>

      <div className="mt-3">
        <p className="font-bold mb-2">Subscores</p>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>
            Market Integrity:{" "}
            <span className="text-gray-100">
              {score.subscores.market_integrity}
            </span>
          </li>
          <li>
            Dev Velocity:{" "}
            <span className="text-gray-100">
              {score.subscores.dev_velocity}
            </span>
          </li>
          <li>
            On-chain Security:{" "}
            <span className="text-gray-100">
              {score.subscores.on_chain_security}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-3">
        <p className="font-bold mb-2">Reasons</p>
        <div className="text-sm space-y-2 text-gray-300">
          <p>
            <span className="text-amber-300">Market:</span>{" "}
            {score.rationale.market_integrity}
          </p>
          <p>
            <span className="text-amber-300">Dev:</span>{" "}
            {score.rationale.dev_velocity}
          </p>
          <p>
            <span className="text-amber-300">On-chain:</span>{" "}
            {score.rationale.on_chain_security}
          </p>
        </div>
      </div>
    </div>
  );
}
