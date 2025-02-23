"use client";

import IdeaForm from "@/components/IdeaForm";
import { addIdea } from "@/lib/serverActions";
import { useRouter } from "next/navigation";

export default function IdeaPage() {
  const router = useRouter();

  const handleNewIdea = async (newIdea) => {
    await addIdea(newIdea);
    router.push("/");
  };

  return (
    <div className="bg-white">
      <h1 className="text-2xl font-bold mb-4 text-black">Submit new idea</h1>
      <div className="rounded-md shadow-md p-4">
        <IdeaForm onSubmit={handleNewIdea} />
      </div>
    </div>
  );
}
