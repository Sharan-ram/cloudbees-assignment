import IdeaList from "@/components/IdeaList";
import { getIdeas } from "@/lib/serverActions";

export default async function HomePage() {
  const { ideas, total } = await getIdeas(1);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Idea list</h1>

      {/* Pass first batch of ideas & total count */}
      <IdeaList initialIdeas={ideas} total={total} />
    </div>
  );
}
