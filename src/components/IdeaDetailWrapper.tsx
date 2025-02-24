"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteIdea } from "@/lib/serverActions";

import SingleIdea from "@/components/SingleIdea";

export default function IdeaDetailWrapper({ idea }) {
  const queryClient = useQueryClient();
  const [localIdea, setLocalIdea] = useState(idea);
  const [type, setType] = useState(null);

  const voteMutation = useMutation({
    mutationFn: async ({ ideaId, type }) => {
      return await voteIdea(ideaId, type);
    },
    onMutate: async ({ ideaId, type }) => {
      setType(type);
      await queryClient.cancelQueries(["idea", ideaId]);

      setLocalIdea((prev) => ({
        ...prev,
        upvotes: type === "upvote" ? prev.upvotes + 1 : prev.upvotes,
        downvotes: type === "downvote" ? prev.downvotes + 1 : prev.downvotes,
      }));
    },
    onSuccess: (updatedIdea) => {
      setLocalIdea(updatedIdea);
    },
    onSettled: () => {
      setType(null);
      queryClient.invalidateQueries(["idea", localIdea.id]);
    },
  });

  return (
    <ul className="space-y-4">
      <SingleIdea
        idea={localIdea}
        upvoteDisabled={voteMutation.isPending && type === "upvote"}
        downvoteDisabled={voteMutation.isPending && type === "downvote"}
        onVoteClick={(ideaId, type) => voteMutation.mutate({ ideaId, type })}
        onDeleteClick={() => {}}
        page="detail"
      />
    </ul>
  );
}
