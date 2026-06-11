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
  ArrowLeft,
  Briefcase,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Download,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { ApplicationFormState } from "../../../lib/membership-types";
import { submitMembershipApplication } from "../../../lib/membership-api";
import { gooeyToast } from "goey-toast";
import "./apply.css";

/* ── State ─────────────────────────────────────────────────────────────────── */

const initialFormState: ApplicationFormState = {
  fullName: "",
  email: "",
  phone: "",
  institution: "",
  address: "",
  membershipType: null,
  documents: {},
  region: "",
  homeAddress: "",
  whereEmployed: "",
  businessAddress: "",
  presentPosition: "",
  degreeObtained: "",
  specialization: "",
  degreeInstitution: "",
  yearObtained: "",
  teachingExp: "",
  teachingInst: "",
  teachingFrom: "",
  teachingTo: "",
  adminExp: "",
  adminInst: "",
  adminFrom: "",
  adminTo: "",
  pub1: "",
  pub2: "",
  pub3: "",
  pub4: "",
  assoc1: "",
  assoc2: "",
  assoc3: "",
  ref1Name: "",
  ref1Position: "",
  ref1Address: "",
  ref2Name: "",
  ref2Position: "",
  ref2Address: "",
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
          [action.slotName]: action.file,
        },
      };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const STEPS = [
  { number: 1, label: "Profile", icon: User },
  { number: 2, label: "Education & Job", icon: GraduationCap },
  { number: 3, label: "Experience", icon: Briefcase },
  { number: 4, label: "References", icon: ShieldCheck },
  { number: 5, label: "Review", icon: FileText },
];

const CATEGORIES = [
  {
    id: "life",
    name: "Life Member",
    desc: "Active PAGE member for 3+ years. Lifetime support.",
    fee: "₱10,000 (One-time)",
    icon: Users,
    slots: ["Valid ID", "Proof of Membership History"],
    color: "#b8860b",
  },
  {
    id: "institutional",
    name: "Institutional Member",
    desc: "For universities offering graduate courses.",
    fee: "₱5,000 / year",
    icon: Building2,
    slots: ["DTI/SEC Certificate", "Letter of Intent"],
    color: "#1a3c6e",
  },
  {
    id: "associate",
    name: "Associate Member",
    desc: "For graduate researchers and lecturers.",
    fee: "₱2,000 / year",
    icon: UserCheck,
    slots: ["Valid ID", "Endorsement Letter"],
    color: "#2d62ae",
  },
  {
    id: "regular",
    name: "Regular Member",
    desc: "Active graduate deans, coordinators, and faculty.",
    fee: "₱1,500 / year",
    icon: UserPlus,
    slots: ["Valid ID", "Proof of Affiliation"],
    color: "#143152",
  },
] as const;

/* ── Slide Transitions ─────────────────────────────────────────────────────── */

const slideVariants = {
  enter: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { x: { type: "spring" as const, stiffness: 400, damping: 30 }, opacity: { duration: 0.25 } },
  },
  exit: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? -60 : 60,
    opacity: 0,
    transition: { x: { type: "spring" as const, stiffness: 400, damping: 30 }, opacity: { duration: 0.15 } },
  }),
};

/* ── Printable Form ────────────────────────────────────────────────────────── */

function PrintableForm({ state }: { state: ApplicationFormState }) {
  return (
    <div className="print-only-form">
      <div className="pf-header">
        <div className="pf-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/PAGE.jpg" alt="PAGE Logo" />
        </div>
        <div className="pf-title-block">
          <h2>PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION</h2>
          <h3>(PAGE), Inc., Manila</h3>
        </div>
        <div className="pf-photo-box">
          PASTE / STAPLE<br />YOUR 1x1<br />PICTURE HERE
        </div>
      </div>

      <div className="pf-membership-type">
        Application for &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "regular" ? "X" : "  "} ) REGULAR</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "life" ? "X" : "  "} ) LIFETIME</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "associate" ? "X" : "  "} ) ASSOCIATE</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "institutional" ? "X" : "  "} ) INSTITUTIONAL</strong> Membership
      </div>

      <div className="pf-box">
        <div className="pf-row">
          <div className="pf-col pf-flex-3">Name: <span className="pf-val">{state.fullName || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Region: <span className="pf-val">{state.region || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Home Address: <span className="pf-val">{state.homeAddress || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Tel No(s)./ Mobile No: <span className="pf-val">{state.phone || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Email Address: <span className="pf-val">{state.email || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Where Employed: <span className="pf-val">{state.whereEmployed || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Business Address: <span className="pf-val">{state.businessAddress || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Present Position: <span className="pf-val">{state.presentPosition || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Degree Obtained: <span className="pf-val">{state.degreeObtained || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Specialization: <span className="pf-val">{state.specialization || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Institution: <span className="pf-val">{state.degreeInstitution || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Year Obtained: <span className="pf-val">{state.yearObtained || "(Not Specified)"}</span></div>
        </div>
      </div>

      <div className="pf-section-title">Academic/ Administrative Experiences (past five (5) years)</div>
      <div className="pf-experience-block">
        <div className="pf-row pf-no-border">
          <div className="pf-col pf-flex-2">Teaching: <span className="pf-val">{state.teachingExp || "N/A"}</span></div>
          <div className="pf-col pf-flex-2">Institution: <span className="pf-val">{state.teachingInst || "N/A"}</span></div>
          <div className="pf-col pf-flex-1">(from: <span className="pf-val">{state.teachingFrom || "N/A"}</span> to: <span className="pf-val">{state.teachingTo || "N/A"}</span>)</div>
        </div>
        <div className="pf-row pf-no-border" style={{ marginTop: "6px" }}>
          <div className="pf-col pf-flex-2">Administrative: <span className="pf-val">{state.adminExp || "N/A"}</span></div>
          <div className="pf-col pf-flex-2">Institution: <span className="pf-val">{state.adminInst || "N/A"}</span></div>
          <div className="pf-col pf-flex-1">(from: <span className="pf-val">{state.adminFrom || "N/A"}</span> to: <span className="pf-val">{state.adminTo || "N/A"}</span>)</div>
        </div>
      </div>

      <div className="pf-section-title">Title of recent articles, researches, books written (past five (5) years)</div>
      <div className="pf-publications">
        <div className="pf-pub-line">1. <span className="pf-val">{state.pub1 || "N/A"}</span></div>
        <div className="pf-pub-line">2. <span className="pf-val">{state.pub2 || "N/A"}</span></div>
        <div className="pf-pub-line">3. <span className="pf-val">{state.pub3 || "N/A"}</span></div>
        <div className="pf-pub-line">4. <span className="pf-val">{state.pub4 || "N/A"}</span></div>
      </div>

      <div className="pf-section-title">Membership/ officership in other recognized Professional/ Cultural Associations (past five (5) years)</div>
      <div className="pf-associations">
        <div className="pf-pub-line">1. <span className="pf-val">{state.assoc1 || "N/A"}</span></div>
        <div className="pf-pub-line">2. <span className="pf-val">{state.assoc2 || "N/A"}</span></div>
        <div className="pf-pub-line">3. <span className="pf-val">{state.assoc3 || "N/A"}</span></div>
      </div>

      <div className="pf-section-title">Two (2) references and their addresses one of whom is the current Regional Chapter Board Member</div>
      <div className="pf-references">
        <div className="pf-ref-col">
          <div>1. Name: <span className="pf-val">{state.ref1Name || "(Not Specified)"}</span></div>
          <div>Position: <span className="pf-val">{state.ref1Position || "(Not Specified)"}</span></div>
          <div>Address: <span className="pf-val">{state.ref1Address || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-ref-col">
          <div>2. Name: <span className="pf-val">{state.ref2Name || "(Not Specified)"}</span></div>
          <div>Position: <span className="pf-val">{state.ref2Position || "(Not Specified)"}</span></div>
          <div>Address: <span className="pf-val">{state.ref2Address || "(Not Specified)"}</span></div>
        </div>
      </div>

      <div className="pf-consent">
        By signing this document, I agree that I have read the Privacy Policy, understood its contents and
        consent to it. I also understand that my consent does not preclude the existence of other criteria for lawful
        processing of personal data, such as our legitimate interests, and does not waive any of my rights under the
        Data Privacy Act of 2012 and other applicable laws and regulations.
      </div>

      <div className="pf-signatures">
        <div className="pf-sig-col">
          <div style={{ fontSize: "10px", fontWeight: "bold" }}>Recommended by:</div>
          <br /><br />
          <div className="pf-sig-line"></div>
          <div className="pf-sig-label">(Signature over Printed Name)</div>
        </div>
        <div className="pf-sig-col">
          <br /><br />
          <div className="pf-sig-line pf-center-text"><span style={{ fontFamily: "sans-serif", fontSize: "11px" }}>{state.fullName}</span></div>
          <div className="pf-sig-label">(Signature of Applicant over Printed Name)</div>
          <div className="pf-date-line">Date: <span className="pf-val">{new Date().toLocaleDateString()}</span></div>
          <div className="pf-committee-label">PAGE REGIONAL CHAPTER MEMBERSHIP COMMITTEE</div>
        </div>
      </div>
    </div>
  );
}

/* ── Page Component ────────────────────────────────────────────────────────── */

function ApplyContent() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});
  const [attemptedAdvance, setAttemptedAdvance] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedCategory = CATEGORIES.find((c) => c.id === state.membershipType);
  const requiredSlots = selectedCategory ? selectedCategory.slots : [];

  /* ── Validation ──────────────────────────────────────────────────────────── */

  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string | null> = {};
    let isValid = true;

    if (stepNum === 1) {
      if (!state.membershipType) { stepErrors.membershipType = "Please select a membership type."; isValid = false; }
      if (!state.fullName.trim()) { stepErrors.fullName = "Full Name is required."; isValid = false; }
      if (!state.region?.trim()) { stepErrors.region = "Region is required."; isValid = false; }
      if (!state.homeAddress?.trim()) { stepErrors.homeAddress = "Home Address is required."; isValid = false; }
      if (!state.phone.trim()) { stepErrors.phone = "Phone number is required."; isValid = false; }
      else if (!/^\d{7,15}$/.test(state.phone.trim())) { stepErrors.phone = "Must be 7–15 digits (numbers only)."; isValid = false; }
      if (!state.email.trim()) { stepErrors.email = "Email is required."; isValid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { stepErrors.email = "Invalid email format."; isValid = false; }
    }

    if (stepNum === 2) {
      if (!state.whereEmployed?.trim()) { stepErrors.whereEmployed = "Institution/employer is required."; isValid = false; }
      if (!state.businessAddress?.trim()) { stepErrors.businessAddress = "Business Address is required."; isValid = false; }
      if (!state.presentPosition?.trim()) { stepErrors.presentPosition = "Present Position is required."; isValid = false; }
      if (!state.degreeObtained?.trim()) { stepErrors.degreeObtained = "Degree is required."; isValid = false; }
      if (!state.specialization?.trim()) { stepErrors.specialization = "Specialization is required."; isValid = false; }
      if (!state.degreeInstitution?.trim()) { stepErrors.degreeInstitution = "Institution is required."; isValid = false; }
      if (!state.yearObtained?.trim()) { stepErrors.yearObtained = "Year is required."; isValid = false; }
      else if (!/^\d{4}$/.test(state.yearObtained.trim())) { stepErrors.yearObtained = "Must be a 4-digit year."; isValid = false; }
    }

    if (stepNum === 3) {
      if (state.teachingFrom?.trim() && !/^\d{4}$/.test(state.teachingFrom.trim())) { stepErrors.teachingFrom = "Must be a 4-digit year."; isValid = false; }
      if (state.teachingTo?.trim() && !/^\d{4}$/.test(state.teachingTo.trim())) { stepErrors.teachingTo = "Must be a 4-digit year."; isValid = false; }
      if (state.adminFrom?.trim() && !/^\d{4}$/.test(state.adminFrom.trim())) { stepErrors.adminFrom = "Must be a 4-digit year."; isValid = false; }
      if (state.adminTo?.trim() && !/^\d{4}$/.test(state.adminTo.trim())) { stepErrors.adminTo = "Must be a 4-digit year."; isValid = false; }
      isValid = !stepErrors.teachingFrom && !stepErrors.teachingTo && !stepErrors.adminFrom && !stepErrors.adminTo;
    }

    if (stepNum === 4) {
      if (!state.ref1Name?.trim()) { stepErrors.ref1Name = "Required."; isValid = false; }
      if (!state.ref1Position?.trim()) { stepErrors.ref1Position = "Required."; isValid = false; }
      if (!state.ref1Address?.trim()) { stepErrors.ref1Address = "Required."; isValid = false; }
      if (!state.ref2Name?.trim()) { stepErrors.ref2Name = "Required."; isValid = false; }
      if (!state.ref2Position?.trim()) { stepErrors.ref2Position = "Required."; isValid = false; }
      if (!state.ref2Address?.trim()) { stepErrors.ref2Address = "Required."; isValid = false; }

      if (selectedCategory) {
        requiredSlots.forEach((slot) => {
          if (!state.documents[slot]) { stepErrors[slot] = `${slot} is required.`; isValid = false; }
        });
      }

      if (!consentChecked) { stepErrors.consent = "You must agree to the Privacy Policy."; isValid = false; }
    }

    setErrors(stepErrors);
    return isValid;
  };

  /* ── Navigation ──────────────────────────────────────────────────────────── */

  const handleNext = () => {
    setAttemptedAdvance((prev) => ({ ...prev, [currentStep]: true }));
    if (validateStep(currentStep)) {
      setDirection("forward");
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Count errors for a more helpful message
      const errorCount = Object.values(errors).filter(Boolean).length;
      if (errorCount > 0) {
        gooeyToast.error(`Please complete ${errorCount} required field${errorCount > 1 ? "s" : ""} before continuing.`);
      } else {
        gooeyToast.error("Please fill in all required fields.");
      }
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setDirection("backward");
      setCurrentStep(targetStep);
    } else {
      // Only allow forward skipping if all intermediate steps pass
      let canAdvance = true;
      let failedStep = currentStep;
      for (let s = currentStep; s < targetStep; s++) {
        setAttemptedAdvance((prev) => ({ ...prev, [s]: true }));
        if (!validateStep(s)) { canAdvance = false; failedStep = s; break; }
      }
      if (canAdvance) {
        setDirection("forward");
        setCurrentStep(targetStep);
      } else {
        gooeyToast.error(`Please complete Step ${failedStep} before proceeding.`);
      }
    }
  };

  /* ── File Handling ───────────────────────────────────────────────────────── */

  const handleFileChange = (slotName: string, file: File | null) => {
    if (!file) {
      dispatch({ type: "SET_DOCUMENT", slotName, file: null });
      setFileErrors((prev) => ({ ...prev, [slotName]: null }));
      return;
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "jpg", "jpeg", "png"];

    if (!validTypes.includes(file.type) && !validExts.includes(ext || "")) {
      setFileErrors((prev) => ({ ...prev, [slotName]: "Only PDF, JPG, JPEG, PNG allowed." }));
      gooeyToast.error("Invalid file format.");
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileErrors((prev) => ({ ...prev, [slotName]: "File exceeds 5MB limit." }));
      gooeyToast.error("File is too large. Max 5MB.");
      return;
    }

    setFileErrors((prev) => ({ ...prev, [slotName]: null }));
    dispatch({ type: "SET_DOCUMENT", slotName, file });
    if (errors[slotName]) { setErrors((prev) => ({ ...prev, [slotName]: null })); }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    handleFileChange(slotName, e.dataTransfer.files?.[0] || null);
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await submitMembershipApplication(state);
      // Save form data to localStorage (excluding File objects) so it can be printed/downloaded on the track page
      const dataToSave = { ...state, documents: {} };
      localStorage.setItem("page_membership_application_data", JSON.stringify(dataToSave));
      gooeyToast.success("Application submitted! You'll receive a confirmation email shortly.");
      router.push(`/membership/apply/track?id=${result.id}`);
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const triggerDownloadPrint = () => { window.print(); };

  const setField = (field: keyof Omit<ApplicationFormState, "documents">, value: string) => {
    dispatch({ type: "SET_FIELD", field, value });
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  /* ── Render Helpers ──────────────────────────────────────────────────────── */

  const renderInput = (
    id: string,
    label: string,
    placeholder: string,
    value: string,
    field: keyof Omit<ApplicationFormState, "documents">,
    opts?: { type?: string; required?: boolean; syncField?: keyof Omit<ApplicationFormState, "documents"> }
  ) => {
    const error = errors[field];
    return (
      <div className="af-field">
        {label && (
          <label htmlFor={id} className="af-label">
            {label} {opts?.required && <span className="af-req">*</span>}
          </label>
        )}
        <input
          type={opts?.type || "text"}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            const digitOnlyFields = ["phone", "yearObtained", "teachingFrom", "teachingTo", "adminFrom", "adminTo"];
            if (digitOnlyFields.includes(field)) {
              val = val.replace(/\D/g, "");
            }
            setField(field, val);
            if (opts?.syncField) dispatch({ type: "SET_FIELD", field: opts.syncField, value: val });
          }}
          className={`af-input ${error ? "af-input--error" : ""}`}
        />
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="af-error"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  };

  return (
    <div className="apply-page">
      <Navbar scrolled={scrolled} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="af-hero screen-only">
        <div className="af-hero__pattern" />
        <motion.div
          className="af-hero__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="af-hero__breadcrumbs">
            <Link href="/" className="af-hero__crumb-link">Home</Link>
            <span className="af-hero__crumb-sep">›</span>
            <Link href="/membership" className="af-hero__crumb-link">Membership</Link>
            <span className="af-hero__crumb-sep">›</span>
            <span className="af-hero__crumb-current">Apply</span>
          </div>
          <h1 className="af-hero__title">Membership Application</h1>
          <p className="af-hero__subtitle">
            Complete the 5-step form below to apply for PAGE membership.
          </p>
        </motion.div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="af-main screen-only-wrapper">

        {/* ── Stepper Card ─────────────────────────────────────────── */}
        <div className="af-stepper-card screen-only">
          <div className="af-progress-track">
            <motion.div
              className="af-progress-fill"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
          <nav className="af-stepper" aria-label="Registration steps">
            {STEPS.map((step) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              const StepIcon = step.icon;
              return (
                <button
                  key={step.number}
                  type="button"
                  className={`af-step ${isCompleted ? "af-step--done" : ""} ${isActive ? "af-step--active" : ""}`}
                  onClick={() => handleStepClick(step.number)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="af-step__circle">
                    {isCompleted ? <CheckCircle size={16} strokeWidth={2.5} /> : <StepIcon size={16} />}
                  </span>
                  <span className="af-step__label">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Form Card ────────────────────────────────────────────── */}
        <div className="af-card">
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
                {/* ═══ STEP 1 ═══════════════════════════════════════ */}
                {currentStep === 1 && (
                  <div>
                    <div className="af-section-header">
                      <div className="af-section-icon"><User size={18} /></div>
                      <div>
                        <h2 className="af-section-title">Membership Type & Profile</h2>
                        <p className="af-section-desc">Select your membership type and enter your personal details.</p>
                      </div>
                    </div>

                    {/* Category Grid */}
                    <div className="af-field">
                      <label className="af-label">Membership Category <span className="af-req">*</span></label>
                      {errors.membershipType && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="af-error">
                          {errors.membershipType}
                        </motion.span>
                      )}
                      <div className="af-category-grid">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = state.membershipType === cat.id;
                          return (
                            <motion.div
                              key={cat.id}
                              role="radio"
                              aria-checked={isSelected}
                              tabIndex={0}
                              className={`af-category ${isSelected ? "af-category--selected" : ""}`}
                              style={{ "--cat-color": cat.color } as React.CSSProperties}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                dispatch({ type: "SET_FIELD", field: "membershipType", value: cat.id });
                                if (errors.membershipType) setErrors((p) => ({ ...p, membershipType: null }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  dispatch({ type: "SET_FIELD", field: "membershipType", value: cat.id });
                                  if (errors.membershipType) setErrors((p) => ({ ...p, membershipType: null }));
                                }
                              }}
                            >
                              {isSelected && (
                                <motion.span
                                  className="af-category__check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <CheckCircle size={14} />
                                </motion.span>
                              )}
                              <span className="af-category__icon"><Icon size={18} /></span>
                              <span className="af-category__body">
                                <span className="af-category__name">{cat.name}</span>
                                <span className="af-category__desc">{cat.desc}</span>
                              </span>
                              <span className="af-category__fee">{cat.fee}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="af-row af-row--3-1">
                      {renderInput("fullName", "Full Name", "Dr. Jane Doe", state.fullName, "fullName", { required: true })}
                      {renderInput("region", "Region", "NCR", state.region || "", "region", { required: true })}
                    </div>
                    {renderInput("homeAddress", "Home Address", "123 Cozy Lane, Quezon City", state.homeAddress || "", "homeAddress", { required: true })}
                    <div className="af-row af-row--1-1">
                      {renderInput("phone", "Mobile / Tel No", "09171234567", state.phone, "phone", { type: "tel", required: true })}
                      {renderInput("email", "Email Address", "jane.doe@university.edu.ph", state.email, "email", { type: "email", required: true })}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 2 ═══════════════════════════════════════ */}
                {currentStep === 2 && (
                  <div>
                    <div className="af-section-header">
                      <div className="af-section-icon"><GraduationCap size={18} /></div>
                      <div>
                        <h2 className="af-section-title">Employment & Education</h2>
                        <p className="af-section-desc">Provide your professional and academic background.</p>
                      </div>
                    </div>

                    {renderInput("whereEmployed", "Where Employed (Institution/School)", "State University of Manila", state.whereEmployed || "", "whereEmployed", { required: true, syncField: "institution" })}
                    {renderInput("businessAddress", "Business/Office Address", "456 Campus Ave, Manila", state.businessAddress || "", "businessAddress", { required: true, syncField: "address" })}
                    <div className="af-row af-row--1-1">
                      {renderInput("presentPosition", "Present Position/Title", "Dean of Graduate Studies", state.presentPosition || "", "presentPosition", { required: true })}
                      {renderInput("degreeObtained", "Highest Degree Obtained", "PhD in Education", state.degreeObtained || "", "degreeObtained", { required: true })}
                    </div>
                    <div className="af-row af-row--2-2-1">
                      {renderInput("specialization", "Specialization", "Educational Leadership", state.specialization || "", "specialization", { required: true })}
                      {renderInput("degreeInstitution", "School / Institution", "University of the Philippines", state.degreeInstitution || "", "degreeInstitution", { required: true })}
                      {renderInput("yearObtained", "Year", "2018", state.yearObtained || "", "yearObtained", { required: true })}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 3 ═══════════════════════════════════════ */}
                {currentStep === 3 && (
                  <div>
                    <div className="af-section-header">
                      <div className="af-section-icon"><Briefcase size={18} /></div>
                      <div>
                        <h2 className="af-section-title">Experience & Research</h2>
                        <p className="af-section-desc">Optional — list experiences within the past 5 years.</p>
                      </div>
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><BookOpen size={14} /><span>Teaching Experience</span><div className="af-subsection__line" /></div>
                      <div className="af-row af-row--2-2-1-1">
                        {renderInput("teachingExp", "Role / Course", "Teaching Role", state.teachingExp || "", "teachingExp")}
                        {renderInput("teachingInst", "Institution", "Institution", state.teachingInst || "", "teachingInst")}
                        {renderInput("teachingFrom", "From", "2019", state.teachingFrom || "", "teachingFrom")}
                        {renderInput("teachingTo", "To", "2024", state.teachingTo || "", "teachingTo")}
                      </div>
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><Briefcase size={14} /><span>Administrative Experience</span><div className="af-subsection__line" /></div>
                      <div className="af-row af-row--2-2-1-1">
                        {renderInput("adminExp", "Role", "Administrative Role", state.adminExp || "", "adminExp")}
                        {renderInput("adminInst", "Institution", "Institution", state.adminInst || "", "adminInst")}
                        {renderInput("adminFrom", "From", "2019", state.adminFrom || "", "adminFrom")}
                        {renderInput("adminTo", "To", "2024", state.adminTo || "", "adminTo")}
                      </div>
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><BookOpen size={14} /><span>Publications & Research</span><div className="af-subsection__line" /></div>
                      <div className="af-stack">
                        {renderInput("pub1", "", "Research / Book Title 1", state.pub1 || "", "pub1")}
                        {renderInput("pub2", "", "Research / Book Title 2", state.pub2 || "", "pub2")}
                        {renderInput("pub3", "", "Research / Book Title 3", state.pub3 || "", "pub3")}
                        {renderInput("pub4", "", "Research / Book Title 4", state.pub4 || "", "pub4")}
                      </div>
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><Users size={14} /><span>Other Professional Associations</span><div className="af-subsection__line" /></div>
                      <div className="af-stack">
                        {renderInput("assoc1", "", "Association & Role 1", state.assoc1 || "", "assoc1")}
                        {renderInput("assoc2", "", "Association & Role 2", state.assoc2 || "", "assoc2")}
                        {renderInput("assoc3", "", "Association & Role 3", state.assoc3 || "", "assoc3")}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ STEP 4 ═══════════════════════════════════════ */}
                {currentStep === 4 && (
                  <div>
                    <div className="af-section-header">
                      <div className="af-section-icon"><ShieldCheck size={18} /></div>
                      <div>
                        <h2 className="af-section-title">References & Documents</h2>
                        <p className="af-section-desc">Provide two references and upload required documents.</p>
                      </div>
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><UserCheck size={14} /><span>Reference 1 (Regional Chapter Board Member Preferred)</span><div className="af-subsection__line" /></div>
                      <div className="af-row af-row--1-1">
                        {renderInput("ref1Name", "Name", "Full Name", state.ref1Name || "", "ref1Name", { required: true })}
                        {renderInput("ref1Position", "Position", "Position", state.ref1Position || "", "ref1Position", { required: true })}
                      </div>
                      {renderInput("ref1Address", "Address", "Address", state.ref1Address || "", "ref1Address", { required: true })}
                    </div>

                    <div className="af-subsection">
                      <div className="af-subsection__header"><UserCheck size={14} /><span>Reference 2</span><div className="af-subsection__line" /></div>
                      <div className="af-row af-row--1-1">
                        {renderInput("ref2Name", "Name", "Full Name", state.ref2Name || "", "ref2Name", { required: true })}
                        {renderInput("ref2Position", "Position", "Position / Regional Member Title", state.ref2Position || "", "ref2Position", { required: true })}
                      </div>
                      {renderInput("ref2Address", "Address", "Address", state.ref2Address || "", "ref2Address", { required: true })}
                    </div>

                    {/* Document Uploads */}
                    <div className="af-subsection">
                      <div className="af-subsection__header"><Upload size={14} /><span>Required Documents</span><div className="af-subsection__line" /></div>
                      <div className="af-upload-grid">
                        {requiredSlots.map((slot) => {
                          const file = state.documents[slot];
                          const err = fileErrors[slot] || errors[slot];
                          return (
                            <div key={slot} className="af-field" style={{ marginBottom: 0 }}>
                              <label className="af-label">{slot} <span className="af-req">*</span></label>
                              <div
                                className={`af-upload ${file ? "af-upload--success" : ""} ${err ? "af-upload--error" : ""}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, slot)}
                                onClick={() => document.getElementById(`file-${slot}`)?.click()}
                              >
                                <input
                                  type="file"
                                  id={`file-${slot}`}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleFileChange(slot, e.target.files?.[0] || null)}
                                />
                                <div className="af-upload__icon-wrap">
                                  {file ? <CheckCircle size={20} /> : <Upload size={20} />}
                                </div>
                                <span className="af-upload__text">
                                  {file ? "File uploaded — click to replace" : "Drag & Drop or Click"}
                                </span>
                                <span className="af-upload__hint">PDF, JPG, PNG — Max 5MB</span>

                                {file && (
                                  <div className="af-upload__file" onClick={(e) => e.stopPropagation()}>
                                    <FileText size={14} className="af-upload__file-icon" />
                                    <span className="af-upload__file-name">{file.name}</span>
                                    <span className="af-upload__file-size">({formatBytes(file.size)})</span>
                                    <button
                                      type="button"
                                      className="af-upload__file-clear"
                                      onClick={() => handleFileChange(slot, null)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {err && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="af-error">{err}</motion.span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Privacy Consent */}
                    <div className="af-consent-box">
                      <label className="af-consent-label">
                        <input
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => {
                            setConsentChecked(e.target.checked);
                            if (errors.consent) setErrors((p) => ({ ...p, consent: null }));
                          }}
                          className="af-consent-checkbox"
                        />
                        <span>
                          <strong>Data Privacy Agreement:</strong> By checking this box, I agree that I have read the Privacy Policy, understood its contents and consent to the collection and processing of my personal data under the Data Privacy Act of 2012.
                        </span>
                      </label>
                      {errors.consent && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="af-error" style={{ marginLeft: 28 }}>{errors.consent}</motion.span>}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 5 ═══════════════════════════════════════ */}
                {currentStep === 5 && (
                  <div>
                    <div className="af-section-header screen-only">
                      <div className="af-section-icon"><FileText size={18} /></div>
                      <div>
                        <h2 className="af-section-title">Review & Download</h2>
                        <p className="af-section-desc">Review your application below and download/print for your records.</p>
                      </div>
                    </div>

                    <div className="af-download-bar screen-only">
                      <motion.button
                        type="button"
                        onClick={triggerDownloadPrint}
                        className="af-btn af-btn--download"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Download size={16} /> Print / Download Form (PDF)
                      </motion.button>
                    </div>

                    <PrintableForm state={state} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Nav Actions ────────────────────────────────────── */}
            <div className="af-actions screen-only">
              {currentStep > 1 ? (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="af-btn af-btn--secondary"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ArrowLeft size={16} /> Back
                </motion.button>
              ) : <div />}

              {currentStep < 5 ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  className="af-btn af-btn--primary"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Next <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="af-btn af-btn--submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                </motion.button>
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
    <Suspense
      fallback={
        <div className="apply-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="af-spinner" />
            <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--ink-60)" }}>
              Loading Application Form...
            </p>
          </div>
        </div>
      }
    >
      <ApplyContent />
    </Suspense>
  );
}
