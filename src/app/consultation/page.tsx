"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { consultationForms } from "@/lib/seed-data";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Save, Plus, FileText, Check, Upload, Loader2 } from "lucide-react";

interface FormData {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  customerType: "Direct" | "Contractor Referred";
  contractorName: string;
  projectType: string;
  areaOfWork: string[];
  material: string;
  colorPreference: string;
  finish: string;
  edgeProfile: string;
  sinkFaucetInfo: string;
  backsplash: string;
  waterfallEdge: boolean;
  miteredEdge: boolean;
  demoRemovalNeeded: string;
  cabinetWorkNeeded: string;
  timeline: string;
  budgetNotes: string;
  measurementNeeded: boolean;
  estimateRequested: boolean;
  followUpRequired: boolean;
  generalNotes: string;
}

const initialFormData: FormData = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  customerType: "Direct",
  contractorName: "",
  projectType: "",
  areaOfWork: [],
  material: "",
  colorPreference: "",
  finish: "",
  edgeProfile: "",
  sinkFaucetInfo: "",
  backsplash: "",
  waterfallEdge: false,
  miteredEdge: false,
  demoRemovalNeeded: "",
  cabinetWorkNeeded: "",
  timeline: "",
  budgetNotes: "",
  measurementNeeded: false,
  estimateRequested: false,
  followUpRequired: false,
  generalNotes: "",
};

const areaOptions = ["Kitchen", "Bathroom/Vanity", "Fireplace", "Bar", "Outdoor", "Other"];

interface RecentConsultation {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  projectType: string;
  areaOfWork: string;
}

export default function ConsultationPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ message: string; projectId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ customerName?: boolean; phone?: boolean }>({});
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>(
    consultationForms as unknown as RecentConsultation[]
  );

  const inputClass =
    "w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm";
  const inputErrorClass =
    "w-full px-3 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm";
  const labelClass = "text-sm font-medium text-slate-700 mb-1 block";
  const sectionClass = "bg-white rounded-xl shadow-sm border border-slate-200 p-6";
  const sectionTitleClass = "text-lg font-semibold text-slate-800 mb-4";

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArea(area: string) {
    setFormData((prev) => ({
      ...prev,
      areaOfWork: prev.areaOfWork.includes(area)
        ? prev.areaOfWork.filter((a) => a !== area)
        : [...prev.areaOfWork, area],
    }));
  }

  function handleClear() {
    setFormData(initialFormData);
    setValidationErrors({});
    setError(null);
    setSuccess(null);
  }

  function validate(): boolean {
    const errors: { customerName?: boolean; phone?: boolean } = {};
    if (!formData.customerName.trim()) errors.customerName = true;
    if (!formData.phone.trim()) errors.phone = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(createProject: boolean) {
    setError(null);
    setSuccess(null);

    if (!validate()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          customerType: formData.customerType,
          contractorName: formData.contractorName,
          projectType: formData.projectType,
          areaOfWork: formData.areaOfWork.join(", "),
          materialPref: formData.material,
          colorPref: formData.colorPreference,
          finishPref: formData.finish,
          edgePref: formData.edgeProfile,
          sinkFaucet: formData.sinkFaucetInfo,
          backsplash: formData.backsplash,
          waterfallMiter: [formData.waterfallEdge && "Waterfall", formData.miteredEdge && "Mitered"]
            .filter(Boolean)
            .join(", "),
          timeline: formData.timeline,
          budgetNotes: formData.budgetNotes,
          measurementNeeded: formData.measurementNeeded,
          estimateRequested: formData.estimateRequested,
          followUpRequired: formData.followUpRequired,
          generalNotes: formData.generalNotes,
          createProject: createProject,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save consultation");
      }

      const data = await res.json();

      if (createProject && data.projectId) {
        setSuccess({ message: "Consultation saved and project created!", projectId: data.projectId });
      } else {
        setSuccess({ message: "Consultation saved successfully!" });
        setFormData(initialFormData);
        setValidationErrors({});
      }

      // Refresh recent consultations
      fetchRecentConsultations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function fetchRecentConsultations() {
    try {
      const res = await fetch("/api/consultations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRecentConsultations(data);
        }
      }
    } catch {
      // Fall back to seed data (already set as default)
    }
  }

  useEffect(() => {
    fetchRecentConsultations();
  }, []);

  function getStatusBadge(status: string) {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "converted":
        return "bg-green-100 text-green-700";
      case "archived":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Intake Form</h1>
          <p className="text-sm text-slate-500">Digital consultation form replacing paper intake</p>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-800 font-medium">{success.message}</span>
          {success.projectId && (
            <Link
              href={`/projects/${success.projectId}`}
              className="ml-auto text-sm font-medium text-green-700 hover:text-green-900 underline"
            >
              View Project &rarr;
            </Link>
          )}
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-sm text-red-800 font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1 - Customer Information */}
          <div className={sectionClass}>
            <div className="bg-slate-100 -mx-6 -mt-6 px-6 py-3 rounded-t-xl mb-4">
              <h2 className={sectionTitleClass + " mb-0"}>Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={validationErrors.customerName ? inputErrorClass : inputClass}
                  value={formData.customerName}
                  onChange={(e) => {
                    updateField("customerName", e.target.value);
                    if (validationErrors.customerName && e.target.value.trim()) {
                      setValidationErrors((prev) => ({ ...prev, customerName: false }));
                    }
                  }}
                />
                {validationErrors.customerName && (
                  <p className="text-xs text-red-500 mt-1">Customer name is required</p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className={validationErrors.phone ? inputErrorClass : inputClass}
                  value={formData.phone}
                  onChange={(e) => {
                    updateField("phone", e.target.value);
                    if (validationErrors.phone && e.target.value.trim()) {
                      setValidationErrors((prev) => ({ ...prev, phone: false }));
                    }
                  }}
                />
                {validationErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">Phone number is required</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
            </div>

            {/* Customer Type */}
            <div className="mt-4">
              <label className={labelClass}>Customer Type</label>
              <div className="flex gap-2 mt-1">
                {(["Direct", "Contractor Referred"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("customerType", type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.customerType === type
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Contractor Name (conditional) */}
            {formData.customerType === "Contractor Referred" && (
              <div className="mt-4">
                <label className={labelClass}>Contractor Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.contractorName}
                  onChange={(e) => updateField("contractorName", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Section 2 - Project Details */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Type</label>
                <select
                  className={inputClass}
                  value={formData.projectType}
                  onChange={(e) => updateField("projectType", e.target.value)}
                >
                  <option value="">Select project type...</option>
                  <option value="Countertop">Countertop</option>
                  <option value="Repair">Repair</option>
                  <option value="Cabinet Install">Cabinet Install</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Area of Work</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {areaOptions.map((area) => (
                    <label
                      key={area}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                        formData.areaOfWork.includes(area)
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.areaOfWork.includes(area)}
                        onChange={() => toggleArea(area)}
                        className="rounded"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 - Material Preferences */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Material Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Material</label>
                <select
                  className={inputClass}
                  value={formData.material}
                  onChange={(e) => updateField("material", e.target.value)}
                >
                  <option value="">Select material...</option>
                  <option value="Granite">Granite</option>
                  <option value="Quartz">Quartz</option>
                  <option value="Marble">Marble</option>
                  <option value="Quartzite">Quartzite</option>
                  <option value="Porcelain">Porcelain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Color Preference</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.colorPreference}
                  onChange={(e) => updateField("colorPreference", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Finish</label>
                <select
                  className={inputClass}
                  value={formData.finish}
                  onChange={(e) => updateField("finish", e.target.value)}
                >
                  <option value="">Select finish...</option>
                  <option value="Polished">Polished</option>
                  <option value="Honed">Honed</option>
                  <option value="Leathered">Leathered</option>
                  <option value="Brushed">Brushed</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Edge Profile</label>
                <select
                  className={inputClass}
                  value={formData.edgeProfile}
                  onChange={(e) => updateField("edgeProfile", e.target.value)}
                >
                  <option value="">Select edge profile...</option>
                  <option value="Straight/Eased">Straight/Eased</option>
                  <option value="Beveled">Beveled</option>
                  <option value="Bullnose">Bullnose</option>
                  <option value="Ogee">Ogee</option>
                  <option value="Waterfall">Waterfall</option>
                  <option value="Mitered">Mitered</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4 - Project Specifications */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Project Specifications</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Sink/Faucet Info</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={formData.sinkFaucetInfo}
                  onChange={(e) => updateField("sinkFaucetInfo", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Backsplash</label>
                  <select
                    className={inputClass}
                    value={formData.backsplash}
                    onChange={(e) => updateField("backsplash", e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="4&quot; Standard">4&quot; Standard</option>
                    <option value="Full Height">Full Height</option>
                    <option value="Tile">Tile</option>
                  </select>
                </div>
                <div className="flex items-end gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.waterfallEdge}
                      onChange={(e) => updateField("waterfallEdge", e.target.checked)}
                      className="rounded"
                    />
                    Waterfall Edge
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.miteredEdge}
                      onChange={(e) => updateField("miteredEdge", e.target.checked)}
                      className="rounded"
                    />
                    Mitered Edge
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Demo/Removal Needed</label>
                  <div className="flex gap-4 mt-1">
                    {["Yes", "No"].map((val) => (
                      <label key={val} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="demoRemoval"
                          value={val}
                          checked={formData.demoRemovalNeeded === val}
                          onChange={(e) => updateField("demoRemovalNeeded", e.target.value)}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Cabinet Work Needed</label>
                  <div className="flex gap-4 mt-1">
                    {["Yes", "No"].map((val) => (
                      <label key={val} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="cabinetWork"
                          value={val}
                          checked={formData.cabinetWorkNeeded === val}
                          onChange={(e) => updateField("cabinetWorkNeeded", e.target.value)}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 - Timeline & Budget */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Timeline &amp; Budget</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Timeline</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g., Within 2 weeks, Flexible"
                    value={formData.timeline}
                    onChange={(e) => updateField("timeline", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Budget Notes</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={formData.budgetNotes}
                  onChange={(e) => updateField("budgetNotes", e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.measurementNeeded}
                    onChange={(e) => updateField("measurementNeeded", e.target.checked)}
                    className="rounded"
                  />
                  Measurement Needed
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.estimateRequested}
                    onChange={(e) => updateField("estimateRequested", e.target.checked)}
                    className="rounded"
                  />
                  Estimate Requested
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.followUpRequired}
                    onChange={(e) => updateField("followUpRequired", e.target.checked)}
                    className="rounded"
                  />
                  Follow-up Required
                </label>
              </div>
            </div>
          </div>

          {/* Section 6 - Photos & Notes */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Photos &amp; Notes</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Photos</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click or drag to upload photos</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB each</p>
                </div>
              </div>
              <div>
                <label className={labelClass}>General Notes</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="Additional notes, customer preferences, special requirements..."
                  value={formData.generalNotes}
                  onChange={(e) => updateField("generalNotes", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Consultation"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Creating..." : "Save & Create Project"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Right Column - Recent Consultations */}
        <div className="lg:col-span-1">
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h2 className={sectionTitleClass + " mb-0"}>Recent Consultations</h2>
            </div>
            <div className="space-y-3">
              {recentConsultations.map((form) => (
                <div
                  key={form.id}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm text-slate-800">{form.customerName}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(form.status)}`}
                    >
                      {form.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(form.createdAt)}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {form.projectType} &middot; {form.areaOfWork}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
