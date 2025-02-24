"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addIdea } from "@/lib/serverActions";
import { useRouter } from "next/navigation";

const ideaSchema = z.object({
  summary: z.string().min(5, "Summary must be at least 5 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  employee: z.string().nonempty("Employee is required."),
  priority: z.enum(["High", "Medium", "Low"]).default("Low"),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

export default function IdeaForm({ employees }: { employees: any }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  });

  const router = useRouter();

  const handleFormSubmit = async (data: IdeaFormData) => {
    await addIdea(data);
    reset();
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block font-semibold text-black">Summary</label>
        <input
          {...register("summary")}
          className="w-full border p-2 rounded-md border-gray-300 text-gray-500"
        />
        {errors.summary && (
          <p className="text-red-500">{errors.summary.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold text-black">Description</label>
        <textarea
          {...register("description")}
          className="w-full border p-2 rounded-md border-gray-300 text-gray-500"
        />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold text-black">Employee</label>
        <select
          {...register("employee")}
          className="w-full border p-2 rounded-md border-gray-300 text-gray-500"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.name}>
              {emp.name}
            </option>
          ))}
        </select>
        {errors.employee && (
          <p className="text-red-500">{errors.employee.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold text-black">Priority</label>
        <select
          {...register("priority")}
          className="w-full border p-2 rounded-md border-gray-300 text-gray-500"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
