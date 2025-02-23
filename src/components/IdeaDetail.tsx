"use client";

import { ArrowFatUp, ArrowFatDown } from "phosphor-react";

export default function IdeaDetail({ idea }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Idea Detail</h1>
      <div className="bg-white shadow-md rounded-md p-4">
        <h1 className="text-2xl font-bold mb-2">{idea.summary}</h1>
        <p className="text-gray-700 mb-4">{idea.description}</p>

        <p className="text-sm text-gray-500">Submitted by: {idea.employee}</p>
        <p className="text-sm text-gray-500">Priority: {idea.priority}</p>

        {/* Voting Info */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center bg-green-100 px-3 py-1 rounded-md">
            <ArrowFatUp size={20} weight="bold" className="mr-2" />
            {idea.upvotes}
          </div>
          <div className="flex items-center bg-red-100 px-3 py-1 rounded-md">
            <ArrowFatDown size={20} weight="bold" className="mr-2" />
            {idea.downvotes}
          </div>
        </div>
      </div>
    </div>
  );
}
