"use client";

export default function Shimmer() {
  return [1, 2, 3, 4, 5].map((num) => {
    return (
      <div
        key={num}
        className="w-full h-[122px] mb-4 rounded-md shadow-md border animate-pulse bg-gray-100"
      />
    );
  });
}
