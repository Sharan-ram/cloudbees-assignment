export default function IdeaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Submit a New Idea</h1>
      {children}
    </div>
  );
}
