"use client";

import { useState, useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getIdeas, voteIdea, deleteIdea } from "@/lib/serverActions";
import { useDebounce } from "@/hooks/useDebounce";
import SingleIdea from "./SingleIdea";

export default function IdeaList() {
  const [search, setSearch] = useState("");
  const [loadingIdea, setLoadingIdea] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const observer = useRef(null);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["ideas", debouncedSearch],
      queryFn: ({ pageParam = 1 }) => getIdeas(pageParam, 20, debouncedSearch),
      getNextPageParam: (lastPage, allPages) =>
        lastPage.ideas.length < 20 ? undefined : allPages.length + 1,
      initialPageParam: 1,
    });

  useEffect(() => {
    if (!hasNextPage) return;
    observer.current = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage) {
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

  const handleVote = useMutation({
    mutationKey: ["voteIdea"],
    mutationFn: ({ ideaId, type }) => voteIdea(ideaId, type),
    // Optimistic UI updates
    onMutate: async ({ ideaId, type }) => {
      setLoadingIdea({ id: ideaId, type });
      await queryClient.cancelQueries(["ideas", debouncedSearch]);

      const previousIdeas = queryClient.getQueryData([
        "ideas",
        debouncedSearch,
      ]);
      console.log({ ideaId, type, previousIdeas });

      // Optimistically update UI
      queryClient.setQueryData(["ideas", debouncedSearch], (oldData) => {
        console.log({ oldData });
        if (!oldData || !oldData.pages) {
          return { pages: [], pageParams: [] };
        }

        const obj = {
          pages: oldData.pages.map((page) => ({
            ...page,
            ideas: page.ideas.map((idea) =>
              idea.id === ideaId
                ? {
                    ...idea,
                    upvotes:
                      type === "upvote"
                        ? Number(idea.upvotes) + 1
                        : idea.upvotes,
                    downvotes:
                      type === "downvote"
                        ? Number(idea.downvotes) + 1
                        : idea.downvotes,
                  }
                : idea
            ),
          })),
          pageParams: oldData.pageParams,
        };

        console.log({ obj });

        return obj;
      });

      console.log({ previousIdeas });

      return { previousIdeas };
    },
    onError: (_error, _variables, context) => {
      console.log("onError is called", _error);
      queryClient.setQueryData(
        ["ideas", debouncedSearch],
        context.previousIdeas
      );
    },
    onSettled: () => {
      setLoadingIdea(null);
      queryClient.invalidateQueries(["ideas", debouncedSearch]);
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: (ideaId) => deleteIdea(ideaId),
    onMutate: async (ideaId) => {
      await queryClient.cancelQueries(["ideas", debouncedSearch]);

      const previousIdeas = queryClient.getQueryData([
        "ideas",
        debouncedSearch,
      ]);

      queryClient.setQueryData(["ideas", debouncedSearch], (oldData) => {
        console.log({ oldData });
        if (!oldData) return { pages: [], pageParams: [] };

        return {
          pages: oldData.pages.map((page) => ({
            ...page,
            ideas: page.ideas.filter((idea) => idea.id !== ideaId),
          })),
          pageParams: oldData.pageParams,
        };
      });

      return { previousIdeas };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        ["ideas", debouncedSearch],
        context.previousIdeas
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["ideas", debouncedSearch]);
    },
  });

  console.log({ data });

  const ideas = data?.pages?.flatMap((page) => page.ideas) || [];

  return (
    <div>
      <input
        type="text"
        placeholder="Search ideas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4 text-gray-600"
      />
      <ul className="space-y-4">
        {ideas.map((idea) => (
          <SingleIdea
            key={idea.id}
            idea={idea}
            handleVote={handleVote}
            deleteIdea={deleteIdeaMutation}
            loadingIdea={loadingIdea}
          />
        ))}
      </ul>
      {hasNextPage && <div id="load-more-trigger" className="h-10"></div>}

      {/* Loading Indicator */}
      {isFetchingNextPage && (
        <p className="text-center text-gray-500 mt-4">Loading more ideas...</p>
      )}

      {/* No results message */}
      {ideas.length === 0 && !isFetchingNextPage && !hasNextPage && (
        <p className="text-center text-gray-500 mt-4">
          No ideas found. Click on submit idea in the navbar to create one.
        </p>
      )}
    </div>
  );
}
