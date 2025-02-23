import IdeaList from "@/components/IdeaList";

export default async function HomePage() {
  return (
    <div className="">
      <h1 className="text-2xl text-black font-bold mb-4">Idea list</h1>

      {/* Pass first batch of ideas & total count */}
      <IdeaList />
    </div>
  );
}
