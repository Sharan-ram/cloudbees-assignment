import { getIdeaById } from "@/lib/serverActions";
import { notFound } from "next/navigation";

import IdeaDetail from "@/components/IdeaDetail";

export default async function IdeaDetails({ params }) {
  const idea = await getIdeaById(params.id);

  if (!idea) return notFound(); // Show 404 if idea is not found

  return <IdeaDetail idea={idea} />;
}
