"use server";

import fs from "fs/promises";
import path from "path";

const ideasFilePath = path.join(process.cwd(), "ideas.json");

// Fetch paginated ideas
export async function getIdeas(page = 1, limit = 20, search = "") {
  try {
    const data = await fs.readFile(ideasFilePath, "utf-8");
    let allIdeas = JSON.parse(data);

    // Ensure votes are numbers
    allIdeas.forEach((idea) => {
      idea.upvotes = Number(idea.upvotes) || 0;
      idea.downvotes = Number(idea.downvotes) || 0;
    });

    // Filter by search query (case-insensitive)
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      allIdeas = allIdeas.filter(
        (idea) =>
          idea.summary.toLowerCase().includes(lowerCaseSearch) ||
          idea.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Sort by upvotes (Descending)
    allIdeas.sort((a, b) => b.upvotes - a.upvotes);

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedIdeas = allIdeas.slice(startIndex, startIndex + limit);

    return { ideas: paginatedIdeas, total: allIdeas.length };
  } catch (error) {
    console.error("Error reading ideas.json:", error);
    return { ideas: [], total: 0 };
  }
}

export async function voteIdea(ideaId, type) {
  try {
    let data = await fs.readFile(ideasFilePath, "utf-8");
    let ideas = JSON.parse(data);

    // Ensure votes are numbers
    ideas = ideas.map((idea) => ({
      ...idea,
      upvotes: Number(idea.upvotes) || 0,
      downvotes: Number(idea.downvotes) || 0, // Fix for downvotes
    }));

    const updatedIdeas = ideas.map((idea) => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          upvotes:
            type === "upvote" ? (Number(idea.upvotes) || 0) + 1 : idea.upvotes,
          downvotes:
            type === "downvote"
              ? (Number(idea.downvotes) || 0) + 1
              : idea.downvotes, // Fix here
        };
      }
      return idea;
    });

    await fs.writeFile(
      ideasFilePath,
      JSON.stringify(updatedIdeas, null, 2),
      "utf-8"
    );

    return updatedIdeas;
  } catch (error) {
    console.error("Error updating votes:", error);
    return [];
  }
}

export async function getIdeaById(id) {
  try {
    const data = await fs.readFile(ideasFilePath, "utf-8");
    const ideas = JSON.parse(data);
    return ideas.find((idea) => idea.id.toString() === id) || null;
  } catch (error) {
    console.error("Error reading idea details:", error);
    return null;
  }
}

export async function addIdea(newIdea) {
  try {
    const ideas = await getIdeas();
    const updatedIdeas = [...ideas, { id: Date.now(), ...newIdea }];

    await fs.writeFile(
      ideasFilePath,
      JSON.stringify(updatedIdeas, null, 2),
      "utf-8"
    );

    return updatedIdeas;
  } catch (error) {
    console.error("Error writing to ideas.json:", error);
    return [];
  }
}
