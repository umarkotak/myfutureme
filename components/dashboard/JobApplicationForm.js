import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stateOptions = [
  { value: "todo", label: "Todo" },
  { value: "applied", label: "Applied" },
  { value: "in-progress", label: "In Progress" },
  { value: "rejected", label: "Rejected" },
  { value: "accepted", label: "Accepted" },
  { value: "dropped", label: "Dropped" },
];

export default function JobApplicationForm({ application, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    job_url: "",
    salary_range: "",
    email: "",
    notes: "",
    state: "todo",
  });

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name || "",
        job_title: application.job_title || "",
        job_url: application.job_url || "",
        salary_range: application.salary_range || "",
        email: application.email || "",
        notes: application.notes || "",
        state: application.state || "todo",
      });
    }
  }, [application]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEdit = !!application;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">
        {isEdit ? "Edit Application" : "New Application"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            placeholder="Acme Inc"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title *</Label>
          <Input
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="job_url">Job URL</Label>
          <Input
            id="job_url"
            name="job_url"
            type="url"
            value={formData.job_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_range">Salary Range</Label>
          <Input
            id="salary_range"
            name="salary_range"
            value={formData.salary_range}
            onChange={handleChange}
            placeholder="$100k-$150k"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="recruiter@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Status</Label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {stateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
