"use client";

import { useReducer, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Users,
  UserCheck,
  UserPlus,
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { ApplicationFormState } from "../../../lib/membership-types";
import { submitMembershipApplication } from "../../../lib/membership-api";
import { gooeyToast } from "goey-toast";
import "./apply.css";

// ── State Definition ────────────────────────────────────────────────────────

const initialFormState: ApplicationFormState = {
  fullName: "",
  email: "",
  phone: "",
  institution: "",
  address: "",
  membershipType: null,
  documents: {
    // Stores selected documents as File objects dynamically
  }
};

type Action =
  | { type: "SET_FIELD"; field: keyof Omit<ApplicationFormState, "documents">; value: string | null }
  | { type: "SET_DOCUMENT"; slotName: string; file: File | null }
  | { type: "RESET_FORM" };

function formReducer(state: ApplicationFormState, action: Action): ApplicationFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_DOCUMENT":
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.slotName]: action.file
        }
      };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
}

// ── Constants & Helpers ──────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Membership Type" },
  { number: 3, label: "Documents" },
  { number: 4, label: "Review & Submit" }
];

const CATEGORIES = [
  {
    id: "life",
    name: "Life Member",
    desc: "Active PAGE member for 3+ years. Lifetime support.",
    fee: "₱10,000 (One-time)",
    icon: Users,
    slots: ["Valid ID", "Proof of Membership History"]
  },
  {
    id: "institutional",
    name: "Institutional Member",
    desc: "For universities offering graduate courses.",
    fee: "₱5,000 / year",
    icon: Building2,
    slots: ["DTI/SEC Certificate", "Letter of Intent"]
  },
  {
    id: "associate",
    name: "Associate Member",
    desc: "For graduate researchers and lecturers.",
    fee: "₱2,000 / year",
    icon: UserCheck,
    slots: ["Valid ID", "Endorsement Letter"]
  },
  {
    id: "regular",
    name: "Regular Member",
    desc: "Active graduate deans, coordinators, and faculty.",
    fee: "₱1,500 / year",
    icon: UserPlus,
    slots: ["Valid ID", "Proof of Affiliation"]
  }
] as const;

// ── Slide Transitions ────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? 100 : -100,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { x: { type: "spring" as const, stiffness: 350, damping: 35 }, opacity: { duration: 0.2 } }
  },
  exit: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? -100 : 100,
    opacity: 0,
    transition: { x: { type: "spring" as const, stiffness: 350, damping: 35 }, opacity: { duration: 0.15 } }
  })
};

// ── Page Component Content ──────────────────────────────────────────────────

function ApplyContent() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation error states
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});
  const [attemptedAdvance, setAttemptedAdvance] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedCategory = CATEGORIES.find(c => c.id === state.membershipType);
  const requiredSlots = selectedCategory ? selectedCategory.slots : [];

  // ── Validation Helpers ─────────────────────────────────────────────────────

  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string | null> = {};
    let isValid = true;

    if (stepNum === 1) {
      if (!state.fullName.trim()) {
        stepErrors.fullName = "Full Name is required.";
        isValid = false;
      }
      if (!state.email.trim()) {
        stepErrors.email = "Email is required.";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
        stepErrors.email = "Invalid email address format.";
        isValid = false;
      }
      if (!state.phone.trim()) {
        stepErrors.phone = "Phone number is required.";
        isValid = false;
      } else if (!/^\d{10,11}$/.test(state.phone.trim())) {
        stepErrors.phone = "Phone number must be numeric (10 to 11 digits).";
        isValid = false;
      }
      if (!state.institution.trim()) {
        stepErrors.institution = "University or Institution name is required.";
        isValid = false;
      }
      if (!state.address.trim()) {
        stepErrors.address = "Office or Home address is required.";
        isValid = false;
      }
    }

    if (stepNum === 2) {
      if (!state.membershipType) {
        stepErrors.membershipType = "You must choose a membership category.";
        isValid = false;
      }
    }

    if (stepNum === 3) {
      if (!selectedCategory) {
        stepErrors.membershipType = "No membership type selected.";
        isValid = false;
      } else {
        requiredSlots.forEach(slot => {
          if (!state.documents[slot]) {
            stepErrors[slot] = `${slot} is required for this category.`;
            isValid = false;
          }
        });
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  // ── Navigation Control ─────────────────────────────────────────────────────

  const handleNext = () => {
    setAttemptedAdvance(prev => ({ ...prev, [currentStep]: true }));
    if (validateStep(currentStep)) {
      setDirection("forward");
      setCurrentStep(prev => prev + 1);
    } else {
      gooeyToast.error("Please fill in all required fields correctly.");
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep(prev => prev - 1);
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      // Navigating backward is always allowed
      setDirection("backward");
      setCurrentStep(targetStep);
    } else {
      // Navigating forward requires validating intermediate steps
      let canAdvance = true;
      for (let s = currentStep; s < targetStep; s++) {
        setAttemptedAdvance(prev => ({ ...prev, [s]: true }));
        if (!validateStep(s)) {
          canAdvance = false;
          break;
        }
      }
      if (canAdvance) {
        setDirection("forward");
        setCurrentStep(targetStep);
      } else {
        gooeyToast.error("Please resolve errors on current step first.");
      }
    }
  };

  // ── Document Upload Event Handlers ─────────────────────────────────────────

  const handleFileChange = (slotName: string, file: File | null) => {
    if (!file) {
      dispatch({ type: "SET_DOCUMENT", slotName, file: null });
      setFileErrors(prev => ({ ...prev, [slotName]: null }));
      return;
    }

    // Validate type (.pdf, .jpg, .jpeg, .png only)
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "jpg", "jpeg", "png"];

    if (!validTypes.includes(file.type) && !validExts.includes(ext || "")) {
      setFileErrors(prev => ({
        ...prev,
        [slotName]: "Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed."
      }));
      gooeyToast.error("Invalid file format. Upload .pdf or .jpg/.png images.");
      return;
    }

    // Validate size (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileErrors(prev => ({
        ...prev,
        [slotName]: "File size exceeds 5MB limit."
      }));
      gooeyToast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    // Success -> Store document & clear error
    setFileErrors(prev => ({ ...prev, [slotName]: null }));
    dispatch({ type: "SET_DOCUMENT", slotName, file });
    
    // Clear validation error if any
    if (errors[slotName]) {
      setErrors(prev => ({ ...prev, [slotName]: null }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(slotName, file);
  };

  // ── Final Submission ───────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitMembershipApplication(state);
      gooeyToast.success("Application submitted! You'll receive a confirmation email shortly.");
      router.push(`/membership/apply/track?id=${result.id}`);
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatter for file sizes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="apply-page">
      <Navbar scrolled={scrolled} />

      <main className="apply-container">
        <h1 className="apply-title">Membership Application</h1>
        <p className="apply-subtitle">
          Complete the 4-step registration form to apply for PAGE membership.
        </p>

        <div className="apply-card">
          {/* Stepper Header */}
          <nav className="apply-stepper" aria-label="Registration steps">
            {STEPS.map((step) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              let classes = "apply-step-node";
              if (isCompleted) classes += " apply-step-node--completed";
              if (isActive) classes += " apply-step-node--active";

              return (
                <button
                  key={step.number}
                  type="button"
                  className={classes}
                  onClick={() => handleStepClick(step.number)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="apply-step-circle">
                    {isCompleted ? <CheckCircle size={18} strokeWidth={2.5} style={{ color: "#ffffff" }} /> : step.number}
                  </span>
                  <span className="apply-step-label">{step.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Steps Display with Slide Animations */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <div style={{ display: 'grid', gap: '4px' }}>
                    <h2 style={{ fontFamily: 'var(--apply-serif)', fontSize: '20px', color: 'var(--apply-navy)', fontWeight: 700, marginBottom: '24px' }}>
                      Step 1: Personal &amp; Institutional Details
                    </h2>

                    <div className="apply-form-group">
                      <label htmlFor="fullName" className="apply-label">Full Name <span>*</span></label>
                      <input
                        type="text"
                        id="fullName"
                        className={`apply-input ${errors.fullName ? "apply-input--error" : ""}`}
                        placeholder="Dr. Jane Doe"
                        value={state.fullName}
                        onChange={(e) => {
                          dispatch({ type: "SET_FIELD", field: "fullName", value: e.target.value });
                          if (errors.fullName) setErrors(p => ({ ...p, fullName: null }));
                        }}
                      />
                      {errors.fullName && <span className="apply-input-error-text">{errors.fullName}</span>}
                    </div>

                    <div className="apply-form-group">
                      <label htmlFor="email" className="apply-label">Email Address <span>*</span></label>
                      <input
                        type="email"
                        id="email"
                        className={`apply-input ${errors.email ? "apply-input--error" : ""}`}
                        placeholder="jane.doe@university.edu.ph"
                        value={state.email}
                        onChange={(e) => {
                          dispatch({ type: "SET_FIELD", field: "email", value: e.target.value });
                          if (errors.email) setErrors(p => ({ ...p, email: null }));
                        }}
                      />
                      {errors.email && <span className="apply-input-error-text">{errors.email}</span>}
                    </div>

                    <div className="apply-form-group">
                      <label htmlFor="phone" className="apply-label">Mobile Number <span>*</span></label>
                      <input
                        type="tel"
                        id="phone"
                        className={`apply-input ${errors.phone ? "apply-input--error" : ""}`}
                        placeholder="09171234567"
                        value={state.phone}
                        onChange={(e) => {
                          dispatch({ type: "SET_FIELD", field: "phone", value: e.target.value });
                          if (errors.phone) setErrors(p => ({ ...p, phone: null }));
                        }}
                      />
                      {errors.phone && <span className="apply-input-error-text">{errors.phone}</span>}
                    </div>

                    <div className="apply-form-group">
                      <label htmlFor="institution" className="apply-label">University / Institution <span>*</span></label>
                      <input
                        type="text"
                        id="institution"
                        className={`apply-input ${errors.institution ? "apply-input--error" : ""}`}
                        placeholder="State University of the Philippines"
                        value={state.institution}
                        onChange={(e) => {
                          dispatch({ type: "SET_FIELD", field: "institution", value: e.target.value });
                          if (errors.institution) setErrors(p => ({ ...p, institution: null }));
                        }}
                      />
                      {errors.institution && <span className="apply-input-error-text">{errors.institution}</span>}
                    </div>

                    <div className="apply-form-group">
                      <label htmlFor="address" className="apply-label">Mailing Address <span>*</span></label>
                      <input
                        type="text"
                        id="address"
                        className={`apply-input ${errors.address ? "apply-input--error" : ""}`}
                        placeholder="123 Academic St, Diliman, Quezon City, Metro Manila"
                        value={state.address}
                        onChange={(e) => {
                          dispatch({ type: "SET_FIELD", field: "address", value: e.target.value });
                          if (errors.address) setErrors(p => ({ ...p, address: null }));
                        }}
                      />
                      {errors.address && <span className="apply-input-error-text">{errors.address}</span>}
                    </div>
                  </div>
                )}

                {/* STEP 2: Membership Type */}
                {currentStep === 2 && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--apply-serif)', fontSize: '20px', color: 'var(--apply-navy)', fontWeight: 700, marginBottom: '20px' }}>
                      Step 2: Choose Classification
                    </h2>

                    {errors.membershipType && (
                      <div style={{ color: 'var(--apply-error)', background: '#fff1f1', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                        {errors.membershipType}
                      </div>
                    )}

                    <div className="apply-category-grid" role="radiogroup" aria-label="Membership categories">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = state.membershipType === cat.id;

                        return (
                          <div
                            key={cat.id}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={`apply-category-radio ${isSelected ? "apply-category-radio--selected" : ""}`}
                            onClick={() => {
                              dispatch({ type: "SET_FIELD", field: "membershipType", value: cat.id });
                              if (errors.membershipType) setErrors(p => ({ ...p, membershipType: null }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                dispatch({ type: "SET_FIELD", field: "membershipType", value: cat.id });
                                if (errors.membershipType) setErrors(p => ({ ...p, membershipType: null }));
                              }
                            }}
                          >
                            <div className="apply-category-radio__left">
                              <div className="apply-category-radio__icon">
                                <Icon size={24} />
                              </div>
                              <div>
                                <div className="apply-category-radio__title">{cat.name}</div>
                                <div className="apply-category-radio__desc">{cat.desc}</div>
                              </div>
                            </div>
                            <div className="apply-category-radio__fee">
                              {cat.fee}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: Documents */}
                {currentStep === 3 && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--apply-serif)', fontSize: '20px', color: 'var(--apply-navy)', fontWeight: 700, marginBottom: '8px' }}>
                      Step 3: Document Uploads
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--apply-text-muted)', marginBottom: '24px' }}>
                      Selected Category: <strong style={{ color: 'var(--apply-navy)' }}>{selectedCategory?.name}</strong>. Please upload the required documents.
                    </p>

                    <div className="apply-upload-slots">
                      {requiredSlots.map((slot) => {
                        const file = state.documents[slot];
                        const err = fileErrors[slot] || errors[slot];

                        return (
                          <div key={slot} className="apply-form-group">
                            <label className="apply-label">{slot} <span>*</span></label>
                            
                            <div
                              className={`apply-upload-slot ${file ? "apply-upload-slot--success" : ""} ${err ? "apply-upload-slot--error" : ""}`}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, slot)}
                              onClick={() => document.getElementById(`file-${slot}`)?.click()}
                            >
                              <input
                                type="file"
                                id={`file-${slot}`}
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null;
                                  handleFileChange(slot, f);
                                }}
                              />
                              
                              <Upload size={28} className="apply-upload-icon" />
                              <div className="apply-upload-text">
                                {file ? "Replace File" : "Drag & Drop or Click to Upload"}
                              </div>
                              <div className="apply-upload-subtext">
                                Supports PDF, JPG, JPEG, or PNG formats up to 5MB
                              </div>

                              {file && (
                                <div
                                  className="apply-uploaded-file"
                                  onClick={(e) => e.stopPropagation()} // Prevent triggering file selection dialog
                                >
                                  <div className="apply-uploaded-file__info">
                                    <FileText size={16} style={{ color: "var(--apply-blue)" }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {file.name}
                                      <span className="apply-uploaded-file__size"> ({formatBytes(file.size)})</span>
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="apply-uploaded-file__clear"
                                    onClick={() => handleFileChange(slot, null)}
                                    aria-label="Remove file"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {err && <span className="apply-input-error-text">{err}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: Review Summary */}
                {currentStep === 4 && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--apply-serif)', fontSize: '20px', color: 'var(--apply-navy)', fontWeight: 700, marginBottom: '24px' }}>
                      Step 4: Review Your Credentials
                    </h2>

                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--apply-border)' }}>
                      {/* Personal Info */}
                      <div className="apply-summary-section">
                        <div className="apply-summary-section__title">Personal Details</div>
                        <div className="apply-summary-grid">
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">Full Name</div>
                            <div className="apply-summary-item__value">{state.fullName}</div>
                          </div>
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">Email Address</div>
                            <div className="apply-summary-item__value">{state.email}</div>
                          </div>
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">Mobile Number</div>
                            <div className="apply-summary-item__value">{state.phone}</div>
                          </div>
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">University / Institution</div>
                            <div className="apply-summary-item__value">{state.institution}</div>
                          </div>
                          <div className="apply-summary-item" style={{ gridColumn: '1 / -1' }}>
                            <div className="apply-summary-item__label">Mailing Address</div>
                            <div className="apply-summary-item__value">{state.address}</div>
                          </div>
                        </div>
                      </div>

                      {/* Membership Type */}
                      <div className="apply-summary-section">
                        <div className="apply-summary-section__title">Membership Selection</div>
                        <div className="apply-summary-grid">
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">Classification</div>
                            <div className="apply-summary-item__value">{selectedCategory?.name}</div>
                          </div>
                          <div className="apply-summary-item">
                            <div className="apply-summary-item__label">Amount Due</div>
                            <div className="apply-summary-item__value" style={{ color: 'var(--apply-accent)', fontWeight: 800 }}>
                              {selectedCategory?.fee}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="apply-summary-section">
                        <div className="apply-summary-section__title">Submitted Documents</div>
                        <div className="apply-summary-documents">
                          {requiredSlots.map(slot => {
                            const file = state.documents[slot];
                            return (
                              <div key={slot} className="apply-summary-doc-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FileText size={16} style={{ color: 'var(--apply-blue)' }} />
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apply-navy)' }}>{slot}</span>
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--apply-text-muted)' }}>
                                  {file ? `${file.name} (${formatBytes(file.size)})` : "No file selected"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="apply-actions">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="apply-btn apply-btn--secondary"
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="apply-btn apply-btn--primary"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="apply-btn apply-btn--primary"
                  style={{ backgroundColor: 'var(--apply-success)' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Confirm & Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#143152' }}>
        <h3>Loading Application Form...</h3>
      </div>
    }>
      <ApplyContent />
    </Suspense>
  );
}
