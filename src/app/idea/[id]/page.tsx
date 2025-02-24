import { getIdeaById } from "@/lib/serverActions";
import { notFound } from "next/navigation";

import IdeaDetailWrapper from "@/components/IdeaDetailWrapper";

export default async function IdeaDetails({ params }) {
  const idea = await getIdeaById(params.id);

  if (!idea) return notFound(); // Show 404 if idea is not found

  return (
    <div>
      <div className="bg-white">
        <h1 className="text-2xl font-bold mb-4 text-black">Idea Detail Page</h1>
        <IdeaDetailWrapper idea={idea} />
      </div>
    </div>
  );
}
