"use client";

import { useState, useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowFatUp, ArrowFatDown, Trash } from "phosphor-react";
import { getIdeas, voteIdea } from "@/lib/serverActions";

export default function IdeaList({ initialIdeas, total }) {
  const [search, setSearch] = useState("");

  const observer = useRef(null);
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["ideas", search], // Ensures re-fetch when search changes
      queryFn: ({ pageParam = 1 }) => getIdeas(pageParam, 20, search),
      getNextPageParam: (lastPage, allPages) =>
        lastPage.ideas.length < 20 ? undefined : allPages.length + 1, // Stop fetching when no more pages
      initialPageParam: 1,
    });

  useEffect(() => {
    if (!hasNextPage) return;
    observer.current = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const trigger = document.getElementById("load-more-trigger");
    if (observer.current && trigger) {
      observer.current.observe(trigger);
    }

    return () => observer.current?.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const mutation = useMutation({
    mutationFn: ({ ideaId, type }) => voteIdea(ideaId, type),
    onMutate: async ({ ideaId, type }) => {
      await queryClient.cancelQueries(["ideas", search]); // Stop other fetches

      const previousIdeas = queryClient.getQueryData(["ideas", search]); // Get current data

      // Optimistically update UI
      queryClient.setQueryData(["ideas", search], (oldData) => {
        if (!oldData) return oldData;
        return {
          pages: oldData.pages.map((page) => ({
            ...page,
            ideas: page.ideas.map((idea) =>
              idea.id === ideaId
                ? {
                    ...idea,
                    upvotes:
                      type === "upvote" ? idea.upvotes + 1 : idea.upvotes,
                    downvotes:
                      type === "downvote" ? idea.downvotes + 1 : idea.downvotes,
                  }
                : idea
            ),
          })),
        };
      });

      return { previousIdeas };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["ideas", search], context.previousIdeas); // Revert if error
    },
    onSettled: () => {
      queryClient.invalidateQueries(["ideas", search]); // Ensure correct data
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ideaId) => deleteIdea(ideaId),
    onMutate: async (ideaId) => {
      await queryClient.cancelQueries(["ideas", search]);

      const previousIdeas = queryClient.getQueryData(["ideas", search]);

      queryClient.setQueryData(["ideas", search], (oldData) => {
        if (!oldData) return { pages: [] }; // ✅ Ensure pages always exists

        return {
          pages: oldData.pages.map((page) => ({
            ...page,
            ideas: page.ideas.filter((idea) => idea.id !== ideaId),
          })),
        };
      });

      return { previousIdeas };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["ideas", search], context.previousIdeas);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["ideas", search]);
    },
  });

  const ideas = data?.pages?.flatMap((page) => page.ideas) || [];

  return (
    <div>
      <input
        type="text"
        placeholder="Search ideas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />
      <ul className="space-y-4">
        {ideas.map((idea, index) => (
          <li
            key={index}
            className="p-4 border rounded-md shadow-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => router.push(`/idea/${idea.id}`)} // Navigate to details page
          >
            <div className="flex items-center">
              <div className="w-[80%]">
                <h3 className="text-lg font-semibold">{idea.summary}</h3>
              </div>
              <div className="w-[20%] flex justify-end">
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent click event
                    deleteMutation.mutate(idea.id);
                  }}
                  className="ml-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                > */}
                <Trash
                  size={24}
                  weight="bold"
                  color="#EF4444"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent click event
                    deleteMutation.mutate(idea.id);
                  }}
                />
                {/* </button> */}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Submitted by: {idea.employee}
            </p>

            {/* Voting Buttons with Upvote/Downvote Counts */}
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click event
                  mutation.mutate({ ideaId: idea.id, type: "upvote" });
                }}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md"
              >
                <ArrowFatUp size={20} weight="bold" className="mr-2" />
                {idea.upvotes ?? 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  mutation.mutate({ ideaId: idea.id, type: "downvote" });
                }}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md"
              >
                <ArrowFatDown size={20} weight="bold" className="mr-2" />
                {idea.downvotes ?? 0}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* Infinite Scroll Trigger */}
      {hasNextPage && <div id="load-more-trigger" className="h-10"></div>}

      {/* Loading Indicator */}
      {isFetchingNextPage && (
        <p className="text-center text-gray-500 mt-4">Loading more ideas...</p>
      )}

      {/* No results message */}
      {ideas.length === 0 && search && (
        <p className="text-center text-gray-500 mt-4">
          No matching ideas found.
        </p>
      )}
    </div>
  );
}
