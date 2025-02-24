export type VoteType = "upvote" | "downvote";

export interface Idea {
  id: string;
  summary: string;
  description: string;
  employee: string;
  priority: "High" | "Medium" | "Low";
  upvotes: number;
  downvotes: number;
}
