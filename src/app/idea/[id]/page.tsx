import { getIdeaById } from "@/lib/serverActions";
import { notFound } from "next/navigation";

export default async function IdeaDetails({ params }) {
  const idea = await getIdeaById(params.id);

  if (!idea) return notFound(); // Show 404 if idea is not found

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Idea Detail</h1>
      <div className="bg-white shadow-md rounded-md p-4">
        <h1 className="text-2xl font-bold mb-2">{idea.summary}</h1>
        <p className="text-gray-700 mb-4">{idea.description}</p>

        <p className="text-sm text-gray-500">Submitted by: {idea.employee}</p>
        <p className="text-sm text-gray-500">Priority: {idea.priority}</p>

        {/* Voting Info */}
        <div className="flex items-center space-x-4 mt-4">
          <p className="flex items-center bg-green-100 px-3 py-1 rounded-md">
            👍 {idea.upvotes}
          </p>
          <p className="flex items-center bg-red-100 px-3 py-1 rounded-md">
            👎 {idea.downvotes}
          </p>
        </div>
      </div>
    </div>
  );
}
