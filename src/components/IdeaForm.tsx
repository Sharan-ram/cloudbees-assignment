"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";

const ideaSchema = z.object({
  summary: z.string().min(5, "Summary must be at least 5 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  employee: z.string().nonempty("Employee is required."),
  priority: z.enum(["High", "Medium", "Low"]).default("Low"),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

const employees = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Charlie Davis" },
];

export default function IdeaForm({
  onSubmit,
}: {
  onSubmit: (data: IdeaFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  });

  const [open, setOpen] = useState(false);

  const handleFormSubmit = (data: IdeaFormData) => {
    onSubmit(data);
    reset(); // Reset form after submission
    setOpen(false); // Close modal
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="px-4 py-2 bg-blue-600 text-white rounded-md">
        Submit Idea
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-96 bg-white p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-xl font-bold mb-4">
            Submit a New Idea
          </Dialog.Title>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block font-semibold">Summary</label>
              <input
                {...register("summary")}
                className="w-full border p-2 rounded-md"
              />
              {errors.summary && (
                <p className="text-red-500">{errors.summary.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold">Description</label>
              <textarea
                {...register("description")}
                className="w-full border p-2 rounded-md"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold">Employee</label>
              <select
                {...register("employee")}
                className="w-full border p-2 rounded-md"
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
              <label className="block font-semibold">Priority</label>
              <select
                {...register("priority")}
                className="w-full border p-2 rounded-md"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close className="px-4 py-2 bg-gray-400 text-white rounded-md">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
