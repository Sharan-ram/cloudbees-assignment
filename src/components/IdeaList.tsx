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
import Shimmer from "./Shimmer";
import { toast } from "react-toastify";
import { Idea, VoteType } from "@/types";

export default function IdeaList() {
  const [search, setSearch] = useState("");
  const [loadingIdea, setLoadingIdea] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const observer = useRef(null);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
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
    mutationFn: async ({
      ideaId,
      type,
    }: {
      ideaId: string;
      type: VoteType;
    }) => {
      return await voteIdea(ideaId, type);
    },
    // Optimistic UI updates
    onMutate: async ({ ideaId, type }: { ideaId: string; type: VoteType }) => {
      setLoadingIdea({ id: ideaId, type });
      await queryClient.cancelQueries({ queryKey: ["ideas", debouncedSearch] });

      const previousIdeas = queryClient.getQueryData([
        "ideas",
        debouncedSearch,
      ]);
      console.log({ ideaId, type, previousIdeas });

      // Optimistically update UI
      queryClient.setQueryData<{
        pages: { ideas: Idea[] }[];
        pageParams: number[];
      }>(["ideas", debouncedSearch], (oldData) => {
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
      queryClient.invalidateQueries({ queryKey: ["ideas", debouncedSearch] });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: (ideaId: string) => deleteIdea(ideaId),
    onMutate: async (ideaId) => {
      await queryClient.cancelQueries({ queryKey: ["ideas", debouncedSearch] });

      const previousIdeas = queryClient.getQueryData([
        "ideas",
        debouncedSearch,
      ]);

      queryClient.setQueryData<{
        pages: { ideas: Idea[] }[];
        pageParams: number[];
      }>(["ideas", debouncedSearch], (oldData) => {
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
    onSuccess: () => {
      toast.success("Idea deleted successfully");
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        ["ideas", debouncedSearch],
        context.previousIdeas
      );
      toast.error("Failed to delete the idea");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas", debouncedSearch] });
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
      {!isLoading ? (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <SingleIdea
              key={idea.id}
              idea={idea}
              onVoteClick={(ideaId, type) =>
                handleVote.mutate({ ideaId, type })
              }
              onDeleteClick={(ideaId) => deleteIdeaMutation.mutate(ideaId)}
              upvoteDisabled={
                loadingIdea?.id === idea.id && loadingIdea?.type === "upvote"
              }
              downvoteDisabled={
                loadingIdea?.id === idea.id && loadingIdea?.type === "downvote"
              }
              page="list"
            />
          ))}
        </ul>
      ) : (
        <Shimmer />
      )}
      {hasNextPage && <div id="load-more-trigger" className="h-10"></div>}

      {/* Loading Indicator */}
      {isFetchingNextPage && <Shimmer />}

      {/* No results message */}
      {ideas.length === 0 &&
        !isFetchingNextPage &&
        !hasNextPage &&
        !isLoading && (
          <p className="text-center text-gray-500 mt-4">
            No ideas found. Click on submit idea in the navbar to create one.
          </p>
        )}
    </div>
  );
}
