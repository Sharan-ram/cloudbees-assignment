"use client";

import { ArrowFatUp, ArrowFatDown, Trash } from "phosphor-react";
import { useRouter } from "next/navigation";

export default function SingleIdea({
  idea,
  upvoteDisabled,
  downvoteDisabled,
  onVoteClick,
  onDeleteClick,
  page = "list",
}) {
  const router = useRouter();

  return (
    <li
      className="p-4 border rounded-md shadow-md cursor-pointer hover:bg-gray-100 transition bg-white"
      onClick={() => router.push(`/idea/${idea.id}`)} // Navigate to details page
    >
      <div className="flex items-center">
        <div className="w-[80%]">
          <h3 className="text-lg font-semibold text-black">{idea.summary}</h3>
        </div>
        <div className="w-[20%] flex justify-end">
          <Trash
            size={24}
            weight="bold"
            color="#EF4444"
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent click event
              // deleteIdea.mutate(idea.id);
              onDeleteClick(idea.id);
            }}
          />
          {/* </button> */}
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">Submitted by: {idea.employee}</p>
      </div>

      {page !== "list" && (
        <>
          <div>
            <p className="text-md text-gray-500">Priority: {idea.priority}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-4">{idea.description}</p>
          </div>
        </>
      )}

      {/* Voting Buttons with Upvote/Downvote Counts */}
      <div className="flex items-center space-x-4 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // handleVote.mutate({ ideaId: idea.id, type: "upvote" });
            onVoteClick(idea.id, "upvote");
          }}
          disabled={upvoteDisabled}
          className={`flex items-center px-3 py-1 rounded-md ${
            upvoteDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"
          }`}
        >
          <ArrowFatUp size={20} weight="bold" className="mr-2" />
          {idea.upvotes ?? 0}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // handleVote.mutate({ ideaId: idea.id, type: "downvote" });
            onVoteClick(idea.id, "downvote");
          }}
          disabled={downvoteDisabled}
          className={`flex items-center px-3 py-1 rounded-md ${
            downvoteDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-500"
          }`}
        >
          <ArrowFatDown size={20} weight="bold" className="mr-2" />
          {idea.downvotes ?? 0}
        </button>
      </div>
    </li>
  );
}
