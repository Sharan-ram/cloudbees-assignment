import IdeaForm from "@/components/IdeaForm";
import { getEmployees } from "@/lib/serverActions";

export default async function IdeaPage() {
  const employees = await getEmployees();
  return (
    <div className="bg-white">
      <h1 className="text-2xl font-bold mb-4 text-black">Submit new idea</h1>
      <div className="rounded-md shadow-md p-4">
        <IdeaForm employees={employees} />
      </div>
    </div>
  );
}
