"use server";

import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const ideasFilePath = path.join(process.cwd(), "ideas.json");
const employeesFilePath = path.join(process.cwd(), "employees.json");

export async function getEmployees() {
  try {
    const data = await fs.readFile(employeesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading employees.json:", error);
    return [];
  }
}

// Fetch paginated ideas
export async function getIdeas(page = 1, limit = 20, search = "") {
  try {
    const data = await fs.readFile(ideasFilePath, "utf-8");
    let allIdeas = JSON.parse(data);

    if (allIdeas.length === 0) return { ideas: [], total: 0 };

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      allIdeas = allIdeas.filter(
        (idea) =>
          idea.summary.toLowerCase().includes(lowerCaseSearch) ||
          idea.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    allIdeas.sort((a, b) => b.upvotes - a.upvotes);

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedIdeas = allIdeas.slice(startIndex, startIndex + limit);

    return {
      ideas: paginatedIdeas.length ? paginatedIdeas : [],
      total: allIdeas.length,
    };
  } catch (error) {
    console.error("Error reading ideas.json:", error);
    return { ideas: [], total: 0 }; // ✅ Always return an empty array on error
  }
}

export async function voteIdea(ideaId, type) {
  try {
    console.log("inside voteIdea");
    let data = await fs.readFile(ideasFilePath, "utf-8");
    let ideas = JSON.parse(data);

    const updatedIdeas = ideas.map((idea) => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          upvotes:
            type === "upvote" ? (Number(idea.upvotes) || 0) + 1 : idea.upvotes,
          downvotes:
            type === "downvote"
              ? (Number(idea.downvotes) || 0) + 1
              : idea.downvotes,
        };
      }
      return idea;
    });

    console.log({ updatedIdeas });

    await fs.writeFile(
      ideasFilePath,
      JSON.stringify(updatedIdeas, null, 2),
      "utf-8"
    );

    return {
      ideas: updatedIdeas,
      total: updatedIdeas.length,
    };
  } catch (error) {
    console.error("Error updating votes:", error);
    return {
      ideas: [],
      total: 0,
    };
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
    const { ideas } = await getIdeas();
    const updatedIdeas = [
      { id: uuid(), ...newIdea, upvotes: 0, downvotes: 0 },
      ...ideas,
    ];

    // console.log({ updatedIdeas });

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

export async function deleteIdea(ideaId) {
  try {
    const data = await fs.readFile(ideasFilePath, "utf-8");
    let ideas = JSON.parse(data);

    // Remove the idea from the list
    const updatedIdeas = ideas.filter((idea) => idea.id !== ideaId);

    // Write back to ideas.json
    await fs.writeFile(
      ideasFilePath,
      JSON.stringify(updatedIdeas, null, 2),
      "utf-8"
    );

    return { ideas: updatedIdeas, total: updatedIdeas.length };
  } catch (error) {
    console.error("Error deleting idea:", error);
    return { ideas: [], total: 0 };
  }
}
