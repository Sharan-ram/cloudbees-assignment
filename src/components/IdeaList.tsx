"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";
import { getIdeas, voteIdea } from "@/lib/serverActions";

export default function IdeaList({ initialIdeas, total }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef(null);
  const router = useRouter();

  useEffect(() => {
    observer.current = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && ideas.length < total && !loading) {
          setLoading(true);
          const newPage = page + 1;
          const { ideas: newIdeas } = await getIdeas(newPage);
          setIdeas((prev) => [...prev, ...newIdeas]);
          setPage(newPage);
          setLoading(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observer.current && document.getElementById("load-more-trigger")) {
      observer.current.observe(document.getElementById("load-more-trigger"));
    }

    return () => observer.current?.disconnect();
  }, [ideas, total, loading, page]);

  const handleVote = async (ideaId, type) => {
    const updatedIdeas = await voteIdea(ideaId, type);
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              upvotes: type === "upvote" ? idea.upvotes + 1 : idea.upvotes,
              downvotes:
                type === "downvote" ? idea.downvotes + 1 : idea.downvotes,
            }
          : idea
      )
    );
  };

  return (
    <div>
      <ul className="space-y-4">
        {ideas.map((idea, index) => (
          <li
            key={index}
            className="p-4 border rounded-md shadow-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => router.push(`/idea/${idea.id}`)} // Navigate to details page
          >
            <h3 className="text-lg font-semibold">{idea.summary}</h3>
            <p className="text-sm text-gray-500">
              Submitted by: {idea.employee}
            </p>

            {/* Voting Buttons with Upvote/Downvote Counts */}
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click event
                  handleVote(idea.id, "upvote");
                }}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md"
              >
                <ArrowFatUp size={20} weight="bold" className="mr-2" />
                {idea.upvotes ?? 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(idea.id, "downvote");
                }}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md"
              >
                <ArrowFatDown size={20} weight="bold" className="mr-2" />
                {idea.downvotes ?? 0}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div id="load-more-trigger" className="h-10"></div>
      {loading && (
        <p className="text-center text-gray-500">Loading more ideas...</p>
      )}
    </div>
  );
}
