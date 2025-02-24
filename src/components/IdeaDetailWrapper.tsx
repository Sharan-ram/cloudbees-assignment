"use client";

import SingleIdea from "@/components/SingleIdea";

export default function IdeaDetailWrapper({ idea }) {
  return (
    <SingleIdea
      idea={idea}
      upvoteDisabled={false} //
      downvoteDisabled={false}
      onVoteClick={() => {}}
      onDeleteClick={() => {}}
      page="detail"
    />
  );
}
