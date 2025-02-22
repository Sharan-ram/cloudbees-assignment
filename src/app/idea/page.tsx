"use client"; // 👈 Make the page interactive

import { useState } from "react";
import IdeaForm from "@/components/IdeaForm";
import { addIdea, getIdeas } from "@/lib/serverActions";

export default function IdeaPage() {
  const [ideas, setIdeas] = useState([]);

  const handleNewIdea = async (newIdea) => {
    const updatedIdeas = await addIdea(newIdea);
    setIdeas(updatedIdeas);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a New Idea</h1>
      <IdeaForm onSubmit={handleNewIdea} />
    </div>
  );
}
