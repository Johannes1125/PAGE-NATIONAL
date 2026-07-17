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
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { ApplicationFormState, MembershipApplication } from "../../../lib/membership-types";
import {
  createMembershipDraft,
  saveMembershipStep,
  uploadMembershipDocument,
  submitMembershipApplication,
  getMembershipApplication,
} from "../../../lib/membership-api";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./apply.css";
import { DocumentUpload } from "./DocumentUpload";
import SearchableSelect from "./SearchableSelect";

const REGIONS = [
  "NCR",
  "CAR",
  "Ilocos Region",
  "Cagayan Valley",
  "Central Luzon",
  "CALABARZON",
  "MIMAROPA",
  "Bicol Region",
  "Western Visayas",
  "Central Visayas",
  "Eastern Visayas",
  "Zamboanga Peninsula",
  "Northern Mindanao",
  "Davao Region",
  "SOCCSKSARGEN",
  "Caraga",
  "BARMM"
];

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
  enrolleeCount: "",
  accreditationDetails: "",
  degreeObtained: "",
  specialization: "",
  degreeInstitution: "",
  yearObtained: "",
  currentEnrollmentStatus: "",
  expectedGraduationYear: "",
  yearsActiveInPAGE: "",
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
  
  // LIFE Specific
  name: "",
  telMobileNo: "",
  emailAddress: "",
  teachingExperience: [],
  administrativeExperience: [],
  recentPublications: [""],
  professionalMemberships: [""],
  characterReferences: [
    { name: "", position: "", address: "" },
    { name: "", position: "", address: "" },
  ],
  regionalChapterBoardReference: { name: "", address: "" },
};

type Action =
  | { type: "SET_FIELD"; field: keyof Omit<ApplicationFormState, "documents">; value: any }
  | { type: "SET_DOCUMENT"; slotName: string; file: { name: string; size?: number; url?: string } | null }
  | { type: "LOAD_APPLICATION"; app: MembershipApplication }
  | { type: "RESET_FORM" }
  | { type: "ADD_TEACHING_EXP" }
  | { type: "REMOVE_TEACHING_EXP"; index: number }
  | { type: "UPDATE_TEACHING_EXP"; index: number; field: "institution" | "fromYear" | "toYear"; value: string }
  | { type: "ADD_ADMIN_EXP" }
  | { type: "REMOVE_ADMIN_EXP"; index: number }
  | { type: "UPDATE_ADMIN_EXP"; index: number; field: "institution" | "fromYear" | "toYear"; value: string }
  | { type: "ADD_PUBLICATION" }
  | { type: "REMOVE_PUBLICATION"; index: number }
  | { type: "UPDATE_PUBLICATION"; index: number; value: string }
  | { type: "ADD_MEMBERSHIP" }
  | { type: "REMOVE_MEMBERSHIP"; index: number }
  | { type: "UPDATE_MEMBERSHIP"; index: number; value: string }
  | { type: "UPDATE_CHARACTER_REF"; index: number; field: "name" | "position" | "address"; value: string }
  | { type: "UPDATE_BOARD_REF"; field: "name" | "address"; value: string };

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
    case "ADD_TEACHING_EXP":
      return {
        ...state,
        teachingExperience: [...(state.teachingExperience || []), { institution: "", fromYear: "", toYear: "" }],
      };
    case "REMOVE_TEACHING_EXP":
      return {
        ...state,
        teachingExperience: (state.teachingExperience || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_TEACHING_EXP": {
      const arr = [...(state.teachingExperience || [])];
      if (arr[action.index]) {
        arr[action.index] = { ...arr[action.index], [action.field]: action.value };
      }
      return { ...state, teachingExperience: arr };
    }
    case "ADD_ADMIN_EXP":
      return {
        ...state,
        administrativeExperience: [...(state.administrativeExperience || []), { institution: "", fromYear: "", toYear: "" }],
      };
    case "REMOVE_ADMIN_EXP":
      return {
        ...state,
        administrativeExperience: (state.administrativeExperience || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_ADMIN_EXP": {
      const arr = [...(state.administrativeExperience || [])];
      if (arr[action.index]) {
        arr[action.index] = { ...arr[action.index], [action.field]: action.value };
      }
      return { ...state, administrativeExperience: arr };
    }
    case "ADD_PUBLICATION":
      return {
        ...state,
        recentPublications: [...(state.recentPublications || []), ""],
      };
    case "REMOVE_PUBLICATION":
      return {
        ...state,
        recentPublications: (state.recentPublications || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_PUBLICATION": {
      const arr = [...(state.recentPublications || [])];
      arr[action.index] = action.value;
      return { ...state, recentPublications: arr };
    }
    case "ADD_MEMBERSHIP":
      return {
        ...state,
        professionalMemberships: [...(state.professionalMemberships || []), ""],
      };
    case "REMOVE_MEMBERSHIP":
      return {
        ...state,
        professionalMemberships: (state.professionalMemberships || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_MEMBERSHIP": {
      const arr = [...(state.professionalMemberships || [])];
      arr[action.index] = action.value;
      return { ...state, professionalMemberships: arr };
    }
    case "UPDATE_CHARACTER_REF": {
      const arr = [...(state.characterReferences || [
        { name: "", position: "", address: "" },
        { name: "", position: "", address: "" },
      ])];
      if (arr[action.index]) {
        arr[action.index] = { ...arr[action.index], [action.field]: action.value };
      }
      return { ...state, characterReferences: arr };
    }
    case "UPDATE_BOARD_REF":
      return {
        ...state,
        regionalChapterBoardReference: {
          ...(state.regionalChapterBoardReference || { name: "", address: "" }),
          [action.field]: action.value,
        },
      };
    case "LOAD_APPLICATION": {
      const app = action.app;
      const profile = app.profileData || {};
      const eduJob = app.educationJobData || {};
      const exp = app.experienceData || {};
      const refs = app.referencesData || {};
      
      const docs: Record<string, { name: string; url: string }> = {};
      if (app.documents) {
        app.documents.forEach((d) => {
          docs[d.documentType] = { name: d.fileName, url: d.fileUrl };
        });
      }

      return {
        ...state,
        membershipType: app.membershipType.toLowerCase() as any,
        fullName: profile.fullName || profile.name || "",
        name: profile.name || profile.fullName || "",
        email: profile.email || profile.emailAddress || "",
        emailAddress: profile.emailAddress || profile.email || "",
        phone: profile.phone || profile.telMobileNo || "",
        telMobileNo: profile.telMobileNo || profile.phone || "",
        region: profile.region || "",
        homeAddress: profile.homeAddress || "",
        enrolleeCount: profile.enrolleeCount !== undefined ? String(profile.enrolleeCount) : "",
        
        institution: eduJob.institution || "",
        address: eduJob.address || "",
        presentPosition: eduJob.presentPosition || "",
        accreditationDetails: eduJob.accreditationDetails || "",
        degreeObtained: eduJob.degreeObtained || "",
        specialization: eduJob.specialization || "",
        degreeInstitution: eduJob.degreeInstitution || "",
        yearObtained: eduJob.yearObtained || "",
        currentEnrollmentStatus: eduJob.currentEnrollmentStatus || "",
        expectedGraduationYear: eduJob.expectedGraduationYear || "",
        
        whereEmployed: eduJob.whereEmployed || eduJob.institution || "",
        businessAddress: eduJob.businessAddress || eduJob.address || "",

        yearsActiveInPAGE: exp.yearsActiveInPAGE !== undefined ? String(exp.yearsActiveInPAGE) : "",
        teachingExperience: Array.isArray(exp.teachingExperience) ? exp.teachingExperience : [],
        administrativeExperience: Array.isArray(exp.administrativeExperience) ? exp.administrativeExperience : [],
        recentPublications: Array.isArray(exp.recentPublications) ? exp.recentPublications : [""],
        professionalMemberships: Array.isArray(exp.professionalMemberships) ? exp.professionalMemberships : [""],

        characterReferences: Array.isArray(refs.characterReferences) && refs.characterReferences.length === 2
          ? refs.characterReferences
          : [
              { name: refs.ref1Name || "", position: refs.ref1Position || "", address: refs.ref1Address || "" },
              { name: refs.ref2Name || "", position: refs.ref2Position || "", address: refs.ref2Address || "" },
            ],
        regionalChapterBoardReference: refs.regionalChapterBoardReference || { name: "", address: "" },

        // Backward compatibility with older profiles
        ref1Name: refs.ref1Name || "",
        ref1Position: refs.ref1Position || "",
        ref1Address: refs.ref1Address || "",
        ref2Name: refs.ref2Name || "",
        ref2Position: refs.ref2Position || "",
        ref2Address: refs.ref2Address || "",
        
        documents: docs as any,
      };
    }
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
    desc: "Active in PAGE activities for 1+ years and holds a doctoral degree.",
    fee: "₱5,000 (One-time)",
    icon: Users,
    slots: ["photo_1x1", "active_member_id"],
    color: "#b8860b",
  },
  {
    id: "regular",
    name: "Regular Member",
    desc: "Doctoral/Master's degree holder, active in PAGE nationally or at chapter level",
    fee: "₱2,000.00/year",
    icon: UserPlus,
    slots: ["photo_1x1"],
    color: "#143152",
  },
  {
    id: "associate",
    name: "Associate Member",
    desc: "Currently enrolled graduate student (Master's or Doctoral).",
    fee: "₱500 / year",
    icon: UserCheck,
    slots: ["current_enrollment_proof"],
    color: "#2d62ae",
  },
  {
    id: "institutional",
    name: "Institutional Member",
    desc: "Higher education institutions offering graduate course studies.",
    fee: "₱1,200 - ₱3,000 / year (tiered)",
    icon: Building2,
    slots: ["registrar_certification"],
    color: "#1a3c6e",
  },
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  registrar_certification: "Registrar certification of enrolment",
  active_member_id: "Active-member ID or Certification",
  degree_proof: "Proof of Graduate Degree (Diploma/Transcript)",
  current_enrollment_proof: "Proof of Graduate Enrollment",
  photo_1x1: "1x1 Photo",
};

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

/* ── Page Component ────────────────────────────────────────────────────────── */

function ApplyContent() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [consentChecked, setConsentChecked] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});

  // 1. Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. Load draft application on mount if exists
  useEffect(() => {
    async function loadDraft() {
      if (typeof window !== "undefined") {
        const savedDraftId = localStorage.getItem("page_membership_draft_id");
        if (savedDraftId) {
          try {
            const app = await getMembershipApplication(savedDraftId);
            if (app.status === "draft") {
              setDraftId(savedDraftId);
              dispatch({ type: "LOAD_APPLICATION", app });
              setCurrentStep(app.currentStep || 1);
            } else {
              // Draft was already submitted
              localStorage.removeItem("page_membership_draft_id");
            }
          } catch (err) {
            console.error("Error loading draft, resetting:", err);
            localStorage.removeItem("page_membership_draft_id");
          }
        }
      }
      setIsLoadingDraft(false);
    }
    loadDraft();
  }, []);

  const selectedCategory = CATEGORIES.find((c) => c.id === state.membershipType);
  const requiredSlots = selectedCategory ? selectedCategory.slots : [];

  /* ── Get fee string dynamically ─────────────────────────────────────────── */
  const getComputedFeeString = () => {
    if (state.membershipType === "life") return "₱5,000.00 (One-time)";
    if (state.membershipType === "regular") return "₱2,000.00 (annual)";
    if (state.membershipType === "associate") return "₱500 / year";
    if (state.membershipType === "institutional") {
      const count = Number(state.enrolleeCount) || 0;
      if (count < 500) return "₱1,200 / year (Tier 1: < 500 enrollees)";
      if (count < 1000) return "₱2,000 / year (Tier 2: 500-999 enrollees)";
      return "₱3,000 / year (Tier 3: >= 1000 enrollees)";
    }
    return "₱0";
  };

  /* ── Validation ──────────────────────────────────────────────────────────── */

  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string | null> = {};
    let isValid = true;

    if (stepNum === 1) {
      if (!state.membershipType) { stepErrors.membershipType = "Please select a membership type."; isValid = false; }
      
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (!state.name?.trim()) { stepErrors.name = "Full Name is required."; isValid = false; }
        if (!state.region?.trim()) { stepErrors.region = "Region is required."; isValid = false; }
        if (!state.homeAddress?.trim()) { stepErrors.homeAddress = "Home Address is required."; isValid = false; }
        if (!state.telMobileNo?.trim()) { stepErrors.telMobileNo = "Tel./Mobile No. is required."; isValid = false; }
        else if (!/^\d{7,15}$/.test(state.telMobileNo.trim())) { stepErrors.telMobileNo = "Must be 7–15 digits (numbers only)."; isValid = false; }
        if (!state.emailAddress?.trim()) { stepErrors.emailAddress = "Email Address is required."; isValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.emailAddress)) { stepErrors.emailAddress = "Invalid email format."; isValid = false; }
        if (!state.documents["photo_1x1"]) { stepErrors.photo_1x1 = "1x1 Photo is required."; isValid = false; }
      } else {
        if (!state.fullName.trim()) { stepErrors.fullName = "Full Name is required."; isValid = false; }
        if (!state.region?.trim()) { stepErrors.region = "Region is required."; isValid = false; }
        if (!state.homeAddress?.trim()) { stepErrors.homeAddress = "Home Address is required."; isValid = false; }
        if (!state.phone.trim()) { stepErrors.phone = "Phone number is required."; isValid = false; }
        else if (!/^\d{7,15}$/.test(state.phone.trim())) { stepErrors.phone = "Must be 7–15 digits (numbers only)."; isValid = false; }
        if (!state.email.trim()) { stepErrors.email = "Email is required."; isValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { stepErrors.email = "Invalid email format."; isValid = false; }
        
        if (state.membershipType === "institutional") {
          if (!state.enrolleeCount?.trim()) {
            stepErrors.enrolleeCount = "Institution enrollee count is required.";
            isValid = false;
          } else if (Number(state.enrolleeCount) <= 0) {
            stepErrors.enrolleeCount = "Must be a valid positive number.";
            isValid = false;
          }
        }
      }
    }

    if (stepNum === 2) {
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (!state.whereEmployed?.trim()) { stepErrors.whereEmployed = "Where Employed is required."; isValid = false; }
        if (!state.businessAddress?.trim()) { stepErrors.businessAddress = "Business Address is required."; isValid = false; }
        if (!state.presentPosition?.trim()) { stepErrors.presentPosition = "Present Position is required."; isValid = false; }
        if (!state.degreeObtained?.trim()) { stepErrors.degreeObtained = "Highest Degree Obtained is required."; isValid = false; }
        if (!state.specialization?.trim()) { stepErrors.specialization = "Specialization is required."; isValid = false; }
        if (!state.institution?.trim()) { stepErrors.institution = "Degree school/institution is required."; isValid = false; }
        if (!state.yearObtained?.trim()) { stepErrors.yearObtained = "Year obtained is required."; isValid = false; }
        else if (!/^\d{4}$/.test(state.yearObtained?.trim() || "")) { stepErrors.yearObtained = "Must be a 4-digit year."; isValid = false; }
      } else {
        if (!state.institution.trim()) { stepErrors.institution = "Employer / School Institution name is required."; isValid = false; }
        if (!state.address.trim()) { stepErrors.address = "Office / Business Address is required."; isValid = false; }
        if (!state.presentPosition?.trim()) { stepErrors.presentPosition = "Present Position is required."; isValid = false; }

        if (state.membershipType === "associate") {
          if (!state.currentEnrollmentStatus?.trim()) { stepErrors.currentEnrollmentStatus = "Current enrollment status is required."; isValid = false; }
          if (!state.expectedGraduationYear?.trim()) { stepErrors.expectedGraduationYear = "Expected graduation year is required."; isValid = false; }
          else if (!/^\d{4}$/.test(state.expectedGraduationYear?.trim() || "")) { stepErrors.expectedGraduationYear = "Must be a 4-digit year."; isValid = false; }
        }

        if (state.membershipType === "institutional") {
          if (!state.accreditationDetails?.trim()) { stepErrors.accreditationDetails = "Accreditation details are required."; isValid = false; }
        }
      }
    }

    if (stepNum === 3) {
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (state.membershipType === "life") {
          if (!state.yearsActiveInPAGE?.trim()) {
            stepErrors.yearsActiveInPAGE = "Years active in PAGE is required.";
            isValid = false;
          } else if (Number(state.yearsActiveInPAGE) < 1) {
            stepErrors.yearsActiveInPAGE = "Must be at least 1 year active.";
            isValid = false;
          }
        }

        if (state.teachingExperience) {
          state.teachingExperience.forEach((t, i) => {
            if (t.fromYear?.trim() && !/^\d{4}$/.test(t.fromYear.trim())) {
              stepErrors[`teaching_from_${i}`] = "Must be a 4-digit year.";
              isValid = false;
            }
            if (t.toYear?.trim() && !/^\d{4}$/.test(t.toYear.trim())) {
              stepErrors[`teaching_to_${i}`] = "Must be a 4-digit year.";
              isValid = false;
            }
          });
        }
        if (state.administrativeExperience) {
          state.administrativeExperience.forEach((a, i) => {
            if (a.fromYear?.trim() && !/^\d{4}$/.test(a.fromYear.trim())) {
              stepErrors[`admin_from_${i}`] = "Must be a 4-digit year.";
              isValid = false;
            }
            if (a.toYear?.trim() && !/^\d{4}$/.test(a.toYear.trim())) {
              stepErrors[`admin_to_${i}`] = "Must be a 4-digit year.";
              isValid = false;
            }
          });
        }
      } else {
        if (state.teachingFrom?.trim() && !/^\d{4}$/.test(state.teachingFrom?.trim() || "")) { stepErrors.teachingFrom = "Must be a 4-digit year."; isValid = false; }
        if (state.teachingTo?.trim() && !/^\d{4}$/.test(state.teachingTo?.trim() || "")) { stepErrors.teachingTo = "Must be a 4-digit year."; isValid = false; }
        if (state.adminFrom?.trim() && !/^\d{4}$/.test(state.adminFrom?.trim() || "")) { stepErrors.adminFrom = "Must be a 4-digit year."; isValid = false; }
        if (state.adminTo?.trim() && !/^\d{4}$/.test(state.adminTo?.trim() || "")) { stepErrors.adminTo = "Must be a 4-digit year."; isValid = false; }
        
        if (stepErrors.teachingFrom || stepErrors.teachingTo || stepErrors.adminFrom || stepErrors.adminTo) {
          isValid = false;
        }
      }
    }

    if (stepNum === 4) {
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (!state.characterReferences || state.characterReferences.length !== 2) {
          stepErrors.characterReferences = "Exactly two character references are required.";
          isValid = false;
        } else {
          state.characterReferences.forEach((r, idx) => {
            if (!r.name?.trim()) { stepErrors[`ref_${idx}_name`] = "Name is required."; isValid = false; }
            if (!r.position?.trim()) { stepErrors[`ref_${idx}_position`] = "Position is required."; isValid = false; }
            if (!r.address?.trim()) { stepErrors[`ref_${idx}_address`] = "Address is required."; isValid = false; }
          });
        }

        const boardRef = state.regionalChapterBoardReference;
        if (!boardRef?.name?.trim()) { stepErrors.boardRefName = "Name is required."; isValid = false; }
        if (!boardRef?.address?.trim()) { stepErrors.boardRefAddress = "Address is required."; isValid = false; }
      } else {
        // Non-life, non-regular references validation if any
      }

      if (selectedCategory) {
        requiredSlots.forEach((slot) => {
          if (!state.documents[slot]) {
            stepErrors[slot] = `${DOCUMENT_LABELS[slot] || slot} is required.`;
            isValid = false;
          }
        });
      }
    }

    if (stepNum === 5) {
      if (!consentChecked) {
        stepErrors.consent = "You must agree to the Data Privacy Agreement.";
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  /* ── Selection Action ─────────────────────────────────────────────────────── */

  const handleSelectType = async (type: "life" | "regular" | "associate" | "institutional") => {
    try {
      const draft = await createMembershipDraft(type);
      localStorage.setItem("page_membership_draft_id", draft.id);
      setDraftId(draft.id);
      dispatch({ type: "LOAD_APPLICATION", app: draft });
      setCurrentStep(1);
      gooeyToast.success(`Membership type ${type.toUpperCase()} selected. Draft created!`);
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to initialize membership application draft. Please try again.");
    }
  };

  const handleChangeMembershipType = () => {
    const confirm = window.confirm(
      "Are you sure you want to change your membership type? This will discard your current application draft and reset all fields."
    );
    if (confirm) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("page_membership_draft_id");
      }
      setDraftId(null);
      dispatch({ type: "RESET_FORM" });
      setConsentChecked(false);
      setErrors({});
      setFileErrors({});
      setCurrentStep(1);
      gooeyToast.success("Application reset. Please select a membership type.");
    }
  };

  /* ── Navigation & Persistence ────────────────────────────────────────────── */

  const persistStep = async (stepNumber: number): Promise<boolean> => {
    if (!draftId) return false;

    let stepName = "";
    let stepData: Record<string, any> = {};

    if (stepNumber === 1) {
      stepName = "profile";
      if (state.membershipType === "life" || state.membershipType === "regular") {
        stepData = {
          name: state.name,
          emailAddress: state.emailAddress,
          telMobileNo: state.telMobileNo,
          region: state.region,
          homeAddress: state.homeAddress,
        };
      } else {
        stepData = {
          fullName: state.fullName,
          email: state.email,
          phone: state.phone,
          region: state.region,
          homeAddress: state.homeAddress,
          enrolleeCount: state.membershipType === "institutional" ? Number(state.enrolleeCount) : undefined,
        };
      }
    } else if (stepNumber === 2) {
      stepName = "education-job";
      if (state.membershipType === "life" || state.membershipType === "regular") {
        stepData = {
          whereEmployed: state.whereEmployed,
          businessAddress: state.businessAddress,
          presentPosition: state.presentPosition,
          degreeObtained: state.degreeObtained,
          specialization: state.specialization,
          institution: state.institution,
          yearObtained: state.yearObtained,
        };
      } else {
        stepData = {
          institution: state.institution,
          address: state.address,
          presentPosition: state.presentPosition,
          accreditationDetails: state.membershipType === "institutional" ? state.accreditationDetails : undefined,
          currentEnrollmentStatus: state.membershipType === "associate" ? state.currentEnrollmentStatus : undefined,
          expectedGraduationYear: state.membershipType === "associate" ? state.expectedGraduationYear : undefined,
        };
      }
    } else if (stepNumber === 3) {
      stepName = "experience";
      if (state.membershipType === "life" || state.membershipType === "regular") {
        stepData = {
          yearsActiveInPAGE: state.membershipType === "life" ? Number(state.yearsActiveInPAGE) : undefined,
          teachingExperience: state.teachingExperience || [],
          administrativeExperience: state.administrativeExperience || [],
          recentPublications: (state.recentPublications || []).filter(p => p.trim() !== ""),
          professionalMemberships: (state.professionalMemberships || []).filter(m => m.trim() !== ""),
        };
      } else {
        stepData = {
          teachingExp: state.teachingExp,
          teachingInst: state.teachingInst,
          teachingFrom: state.teachingFrom,
          teachingTo: state.teachingTo,
          adminExp: state.adminExp,
          adminInst: state.adminInst,
          adminFrom: state.adminFrom,
          adminTo: state.adminTo,
          pub1: state.pub1,
          pub2: state.pub2,
          pub3: state.pub3,
          pub4: state.pub4,
          assoc1: state.assoc1,
          assoc2: state.assoc2,
          assoc3: state.assoc3,
        };
      }
    } else if (stepNumber === 4) {
      stepName = "references";
      if (state.membershipType === "life" || state.membershipType === "regular") {
        stepData = {
          characterReferences: state.characterReferences || [],
          regionalChapterBoardReference: state.regionalChapterBoardReference,
          privacyPolicyConsent: true,
        };
      } else {
        stepData = {
          ref1Name: state.ref1Name,
          ref1Position: state.ref1Position,
          ref1Address: state.ref1Address,
          ref2Name: state.ref2Name,
          ref2Position: state.ref2Position,
          ref2Address: state.ref2Address,
        };
      }
    }

    try {
      await saveMembershipStep(draftId, stepName, stepData, stepNumber + 1);
      return true;
    } catch (err) {
      console.error("Failed to save step:", err);
      gooeyToast.error("Failed to save progress to server. Check connection.");
      return false;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      const saved = await persistStep(currentStep);
      if (saved) {
        setDirection("forward");
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      const errorCount = Object.values(errors).filter(Boolean).length;
      gooeyToast.error(`Please fix ${errorCount} error(s) before continuing.`);
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setDirection("backward");
      setCurrentStep(targetStep);
    } else {
      // Must validate intermediate steps and save drafts
      let failedStep = currentStep;
      let ok = true;
      for (let s = currentStep; s < targetStep; s++) {
        if (!validateStep(s)) {
          ok = false;
          failedStep = s;
          break;
        }
        const saved = await persistStep(s);
        if (!saved) {
          ok = false;
          failedStep = s;
          break;
        }
      }
      if (ok) {
        setDirection("forward");
        setCurrentStep(targetStep);
      } else {
        gooeyToast.error(`Please complete Step ${failedStep} first.`);
      }
    }
  };

  /* ── File Handling ───────────────────────────────────────────────────────── */

  const handleFileChange = async (slotName: string, file: File | null) => {
    if (!draftId) return;

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
    setIsUploading((prev) => ({ ...prev, [slotName]: true }));

    try {
      const doc = await uploadMembershipDocument(draftId, file, slotName);
      dispatch({ type: "SET_DOCUMENT", slotName, file: { name: file.name, size: file.size, url: doc.fileUrl } });
      gooeyToast.success(`${DOCUMENT_LABELS[slotName] || slotName} uploaded successfully!`);
      if (errors[slotName]) { setErrors((prev) => ({ ...prev, [slotName]: null })); }
    } catch (err) {
      console.error(err);
      setFileErrors((prev) => ({ ...prev, [slotName]: "Failed to upload document." }));
      gooeyToast.error("Document upload failed.");
    } finally {
      setIsUploading((prev) => ({ ...prev, [slotName]: false }));
    }
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !draftId) return;

    if (!validateStep(4)) {
      gooeyToast.error("Please complete references and verify document uploads before submission.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitMembershipApplication(draftId);
      if (result.success) {
        localStorage.removeItem("page_membership_draft_id");
        gooeyToast.success("Membership application submitted successfully!");
        router.push(`/membership/apply/track?id=${draftId}`);
      } else {
        const errorList = result.errors || {};
        const parsedErrors: Record<string, string> = {};
        Object.keys(errorList).forEach(k => {
          parsedErrors[k] = errorList[k];
        });
        setErrors(parsedErrors);
        gooeyToast.error(result.message || "Validation failed. Check required fields.");
      }
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to submit application. Please check input.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const setField = (field: keyof Omit<ApplicationFormState, "documents">, value: string) => {
    dispatch({ type: "SET_FIELD", field, value });
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  /* ── Input Render Helper ─────────────────────────────────────────────────── */

  const renderInput = (
    id: string,
    label: string,
    placeholder: string,
    value: string,
    field: keyof Omit<ApplicationFormState, "documents">,
    opts?: { type?: string; required?: boolean }
  ) => {
    const error = errors[field];
    return (
      <div className="af-field" style={{ marginBottom: "16px" }}>
        {label && (
          <label htmlFor={id} className="af-label" style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", display: "block" }}>
            {label} {opts?.required && <span className="af-req" style={{ color: "var(--af-error)" }}>*</span>}
          </label>
        )}
        <input
          type={opts?.type || "text"}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            const digitOnlyFields = ["phone", "enrolleeCount", "yearObtained", "expectedGraduationYear", "yearsActiveInPAGE", "teachingFrom", "teachingTo", "adminFrom", "adminTo"];
            if (digitOnlyFields.includes(field)) {
              val = val.replace(/\D/g, "");
            }
            setField(field, val);
          }}
          className={`af-input ${error ? "af-input--error" : ""}`}
          style={{ minHeight: "48px", fontSize: "16px", padding: "12px 16px" }}
        />
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="af-error"
            style={{ color: "var(--af-error)", fontSize: "14px", marginTop: "4px", display: "block" }}
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  };

  if (isLoadingDraft) {
    return (
      <div className="apply-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="af-spinner" />
          <p style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color: "var(--af-navy)" }}>
            Loading Application Wizard...
          </p>
        </div>
      </div>
    );
  }

  /* ── Render Category Selection Screen (Pre-step 1) ────────────────────────── */

  if (!draftId) {
    return (
      <div className="apply-page">
        <Navbar scrolled={scrolled} />
        <div className="af-hero">
          <div className="af-hero__pattern" />
          <div className="af-hero__content">
            <h1 className="af-hero__title" style={{ fontFamily: "var(--serif, serif)", fontWeight: 900 }}>PAGE Membership Registration</h1>
            <p className="af-hero__subtitle" style={{ fontSize: "18px", marginTop: "8px" }}>
              Choose your membership classification to start your application process.
            </p>
          </div>
        </div>

        <main className="af-main screen-only-wrapper" style={{ padding: "48px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--af-navy)", marginBottom: "8px" }}>
              Select Membership Classification
            </h2>
            <p style={{ fontSize: "16px", color: "var(--af-text-muted)" }}>
              Pricing and requirements are set in accordance with the PAGE Philippines membership structure.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  className="af-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "32px",
                    borderRadius: "16px",
                    border: "2px solid var(--af-border-light)",
                    cursor: "pointer",
                    background: "var(--af-surface)",
                  }}
                  whileHover={{ y: -6, boxShadow: "0 12px 24px rgba(0,0,0,0.06)", borderColor: cat.color }}
                  onClick={() => handleSelectType(cat.id)}
                >
                  <div>
                    <div style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: `${cat.color}15`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: cat.color,
                      marginBottom: "24px"
                    }}>
                      <Icon size={28} />
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--af-navy)", marginBottom: "8px" }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: "15px", color: "var(--af-text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
                      {cat.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: cat.color, marginBottom: "20px" }}>
                      {cat.fee}
                    </div>
                    <button
                      type="button"
                      className="af-btn af-btn--primary"
                      style={{
                        width: "100%",
                        minHeight: "48px",
                        fontSize: "18px",
                        fontWeight: 600,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        background: cat.color,
                        border: "none",
                        color: "#fff"
                      }}
                    >
                      Apply Now <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

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
          <p className="af-hero__subtitle" style={{ fontSize: "16px" }}>
            Classification: <strong style={{ color: "var(--af-gold-light)", textTransform: "uppercase" }}>{selectedCategory?.name}</strong> ({getComputedFeeString()})
          </p>
        </motion.div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="af-main screen-only-wrapper" style={{ paddingBottom: "72px" }}>

        {/* Change Membership Type Banner */}
        <div style={{ maxWidth: "800px", margin: "16px auto", padding: "16px 24px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle style={{ color: "#d97706", flexShrink: 0 }} size={24} />
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#92400e", margin: 0 }}>
                Applying as {selectedCategory?.name}
              </p>
              <p style={{ fontSize: "13px", color: "#b45309", margin: 0 }}>
                Fields and document slots have been customized for this membership type.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleChangeMembershipType}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              background: "#d97706",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Change Type
          </button>
        </div>

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
        <div className="af-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
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
                {/* ═══ STEP 1: Profile ═══════════════════════════════ */}
                {currentStep === 1 && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><User size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Profile Information</h2>
                        <p className="af-section-desc">Provide your contact details, address location, and 1x1 photo.</p>
                      </div>
                    </div>

                    {state.membershipType === "life" || state.membershipType === "regular" ? (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {renderInput("name", "Full Name", "Dr. Jane Doe", state.name || "", "name", { required: true })}
                          <SearchableSelect
                            label="Region"
                            placeholder="Select Region"
                            value={state.region || ""}
                            options={REGIONS}
                            onChange={(val) => setField("region", val)}
                            error={errors.region}
                            required={true}
                          />
                        </div>
                        {renderInput("homeAddress", "Home Address", "123 Campus Lane, Quezon City", state.homeAddress || "", "homeAddress", { required: true })}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {renderInput("telMobileNo", "Mobile / Tel No", "09171234567", state.telMobileNo || "", "telMobileNo", { type: "tel", required: true })}
                          {renderInput("emailAddress", "Email Address", "jane.doe@university.edu.ph", state.emailAddress || "", "emailAddress", { type: "email", required: true })}
                        </div>
                        
                        <div style={{ marginTop: "24px" }}>
                          <DocumentUpload
                            draftId={draftId!}
                            slotName="photo_1x1"
                            label="1x1 Photo"
                            file={state.documents["photo_1x1"] || null}
                            error={errors["photo_1x1"] || fileErrors["photo_1x1"]}
                            isUploading={!!isUploading["photo_1x1"]}
                            onFileChange={handleFileChange}
                            required={true}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {renderInput("fullName", "Full Name", "Dr. Jane Doe", state.fullName, "fullName", { required: true })}
                          <SearchableSelect
                            label="Region"
                            placeholder="Select Region"
                            value={state.region || ""}
                            options={REGIONS}
                            onChange={(val) => setField("region", val)}
                            error={errors.region}
                            required={true}
                          />
                        </div>
                        {renderInput("homeAddress", "Home Address", "123 Campus Lane, Quezon City", state.homeAddress || "", "homeAddress", { required: true })}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {renderInput("phone", "Mobile / Tel No", "09171234567", state.phone, "phone", { type: "tel", required: true })}
                          {renderInput("email", "Email Address", "jane.doe@university.edu.ph", state.email, "email", { type: "email", required: true })}
                        </div>

                        {/* Institutional specific enrollee tier */}
                        {state.membershipType === "institutional" && (
                          <div style={{ border: "1px solid var(--af-border)", padding: "20px", borderRadius: "12px", background: "var(--af-cream)", marginTop: "16px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "8px" }}>Institutional Enrollee Tiers</h4>
                            <p style={{ fontSize: "13px", color: "var(--af-text-muted)", marginBottom: "16px" }}>
                              Fee is automatically tiered based on the total number of enrollees in the graduate program.
                            </p>
                            {renderInput("enrolleeCount", "Total Program Enrollee Count", "e.g. 450", state.enrolleeCount || "", "enrolleeCount", { required: true })}
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--af-navy)", marginTop: "8px" }}>
                              Current Computed Fee: <span style={{ color: "var(--af-gold)" }}>{getComputedFeeString()}</span>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ═══ STEP 2: Education & Job ═══════════════════════ */}
                {currentStep === 2 && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><GraduationCap size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Employment & Education</h2>
                        <p className="af-section-desc">Provide your professional background and academic credentials.</p>
                      </div>
                    </div>

                    {state.membershipType === "life" || state.membershipType === "regular" ? (
                      <>
                        {renderInput("whereEmployed", "Employing Institution/School", "State University of Manila", state.whereEmployed || "", "whereEmployed", { required: true })}
                        {renderInput("businessAddress", "Business/Office Address", "456 Campus Ave, Manila", state.businessAddress || "", "businessAddress", { required: true })}
                        {renderInput("presentPosition", "Present Position/Title", "Dean of Graduate Studies", state.presentPosition || "", "presentPosition", { required: true })}
                        
                        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--af-border-light)" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "16px" }}>Academic Degree Details</h3>
                          {renderInput("degreeObtained", "Highest Degree Obtained (Doctoral / Master's)", "PhD in Education", state.degreeObtained || "", "degreeObtained", { required: true })}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: "16px" }}>
                            {renderInput("specialization", "Specialization", "Educational Leadership", state.specialization || "", "specialization", { required: true })}
                            {renderInput("institution", "Degree School/Institution", "University of the Philippines", state.institution || "", "institution", { required: true })}
                            {renderInput("yearObtained", "Year Obtained", "2018", state.yearObtained || "", "yearObtained", { required: true })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {renderInput("whereEmployed", "Employing Institution/School", "State University of Manila", state.institution || "", "institution", { required: true })}
                        {renderInput("businessAddress", "Business/Office Address", "456 Campus Ave, Manila", state.address || "", "address", { required: true })}
                        {renderInput("presentPosition", "Present Position/Title", "Dean of Graduate Studies", state.presentPosition || "", "presentPosition", { required: true })}

                        {/* Associate: Enrollment status */}
                        {state.membershipType === "associate" && (
                          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--af-border-light)" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "16px" }}>Current Graduate Studies</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "16px" }}>
                              {renderInput("currentEnrollmentStatus", "Current Enrollment Status (Degree/Program)", "Master of Science in Information Technology", state.currentEnrollmentStatus || "", "currentEnrollmentStatus", { required: true })}
                              {renderInput("expectedGraduationYear", "Expected Grad Year", "2027", state.expectedGraduationYear || "", "expectedGraduationYear", { required: true })}
                            </div>
                          </div>
                        )}

                        {/* Institutional: Accreditation Details */}
                        {state.membershipType === "institutional" && (
                          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--af-border-light)" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "16px" }}>Accreditation Details</h3>
                            {renderInput("accreditationDetails", "Government Recognition / Accreditation Status", "CHED Permit No. 1234, PAASCU Level III", state.accreditationDetails || "", "accreditationDetails", { required: true })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ═══ STEP 3: Experience ════════════════════════════ */}
                {currentStep === 3 && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><Briefcase size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Experience & Publications</h2>
                        <p className="af-section-desc">Record relevant professional and research credentials.</p>
                      </div>
                    </div>

                    {/* Institutional: NOT APPLICABLE */}
                    {state.membershipType === "institutional" ? (
                      <div style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--af-border)", borderRadius: "12px", background: "var(--af-cream)" }}>
                        <Briefcase size={36} style={{ color: "var(--af-text-muted)", marginBottom: "16px", margin: "0 auto" }} />
                        <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "8px" }}>Section Not Applicable</h4>
                        <p style={{ fontSize: "15px", color: "var(--af-text-muted)", marginBottom: "24px" }}>
                          Academic or individual experiences are not required for Institutional memberships.
                        </p>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="af-btn af-btn--primary"
                          style={{ margin: "0 auto", minHeight: "48px" }}
                        >
                          Skip Step &amp; Continue <ArrowRight size={16} />
                        </button>
                      </div>
                    ) : state.membershipType === "life" || state.membershipType === "regular" ? (
                      <div>
                        {/* Life: YEARS ACTIVE REQUIRED */}
                        {state.membershipType === "life" && (
                          <div style={{ border: "1px solid #b8860b33", padding: "20px", borderRadius: "12px", background: "#b8860b08", marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#b8860b", marginBottom: "8px" }}>Life Membership Eligibility</h4>
                            <p style={{ fontSize: "13px", color: "var(--af-text-muted)", marginBottom: "16px" }}>
                              Requires being active in PAGE regional activities or conventions for at least 1 year.
                            </p>
                            {renderInput("yearsActiveInPAGE", "Number of Years Active in PAGE", "e.g. 1", state.yearsActiveInPAGE || "", "yearsActiveInPAGE", { required: true })}
                          </div>
                        )}

                        {/* Repeatable Teaching Experience */}
                        <div className="af-subsection" style={{ marginBottom: "24px" }}>
                          <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <BookOpen size={16} style={{ color: "var(--af-navy)" }} />
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Teaching Experience (Institution, from/to years)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "ADD_TEACHING_EXP" })}
                              style={{ padding: "6px 12px", background: "var(--af-navy, #143152)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                            >
                              + Add Row
                            </button>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(!state.teachingExperience || state.teachingExperience.length === 0) ? (
                              <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, padding: "8px" }}>No teaching experience rows added yet.</p>
                            ) : (
                              state.teachingExperience.map((row, idx) => (
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 40px", gap: "12px", alignItems: "center" }}>
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Institution"
                                      value={row.institution}
                                      onChange={(e) => dispatch({ type: "UPDATE_TEACHING_EXP", index: idx, field: "institution", value: e.target.value })}
                                      className="af-input"
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder="From Year"
                                      value={row.fromYear}
                                      onChange={(e) => dispatch({ type: "UPDATE_TEACHING_EXP", index: idx, field: "fromYear", value: e.target.value.replace(/\D/g, "") })}
                                      className={`af-input ${errors[`teaching_from_${idx}`] ? "af-input--error" : ""}`}
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                    {errors[`teaching_from_${idx}`] && <span style={{ color: "var(--af-error)", fontSize: "11px" }}>{errors[`teaching_from_${idx}`]}</span>}
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder="To Year"
                                      value={row.toYear}
                                      onChange={(e) => dispatch({ type: "UPDATE_TEACHING_EXP", index: idx, field: "toYear", value: e.target.value.replace(/\D/g, "") })}
                                      className={`af-input ${errors[`teaching_to_${idx}`] ? "af-input--error" : ""}`}
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                    {errors[`teaching_to_${idx}`] && <span style={{ color: "var(--af-error)", fontSize: "11px" }}>{errors[`teaching_to_${idx}`]}</span>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => dispatch({ type: "REMOVE_TEACHING_EXP", index: idx })}
                                    style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Repeatable Administrative Experience */}
                        <div className="af-subsection" style={{ marginBottom: "24px", marginTop: "24px" }}>
                          <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Briefcase size={16} style={{ color: "var(--af-navy)" }} />
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Administrative Experience (Institution, from/to years)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "ADD_ADMIN_EXP" })}
                              style={{ padding: "6px 12px", background: "var(--af-navy, #143152)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                            >
                              + Add Row
                            </button>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(!state.administrativeExperience || state.administrativeExperience.length === 0) ? (
                              <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, padding: "8px" }}>No administrative experience rows added yet.</p>
                            ) : (
                              state.administrativeExperience.map((row, idx) => (
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 40px", gap: "12px", alignItems: "center" }}>
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Institution"
                                      value={row.institution}
                                      onChange={(e) => dispatch({ type: "UPDATE_ADMIN_EXP", index: idx, field: "institution", value: e.target.value })}
                                      className="af-input"
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder="From Year"
                                      value={row.fromYear}
                                      onChange={(e) => dispatch({ type: "UPDATE_ADMIN_EXP", index: idx, field: "fromYear", value: e.target.value.replace(/\D/g, "") })}
                                      className={`af-input ${errors[`admin_from_${idx}`] ? "af-input--error" : ""}`}
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                    {errors[`admin_from_${idx}`] && <span style={{ color: "var(--af-error)", fontSize: "11px" }}>{errors[`admin_from_${idx}`]}</span>}
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder="To Year"
                                      value={row.toYear}
                                      onChange={(e) => dispatch({ type: "UPDATE_ADMIN_EXP", index: idx, field: "toYear", value: e.target.value.replace(/\D/g, "") })}
                                      className={`af-input ${errors[`admin_to_${idx}`] ? "af-input--error" : ""}`}
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                    {errors[`admin_to_${idx}`] && <span style={{ color: "var(--af-error)", fontSize: "11px" }}>{errors[`admin_to_${idx}`]}</span>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => dispatch({ type: "REMOVE_ADMIN_EXP", index: idx })}
                                    style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Repeatable Research Publications */}
                        <div className="af-subsection" style={{ marginBottom: "24px", marginTop: "24px" }}>
                          <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <BookOpen size={16} style={{ color: "var(--af-navy)" }} />
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Research Publications / Books Written (Title & Date/Publisher)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "ADD_PUBLICATION" })}
                              style={{ padding: "6px 12px", background: "var(--af-navy, #143152)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                            >
                              + Add Publication
                            </button>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(!state.recentPublications || state.recentPublications.length === 0) ? (
                              <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, padding: "8px" }}>No publications added yet.</p>
                            ) : (
                              state.recentPublications.map((pub, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    placeholder="Research Title, Journal Name / Publisher, Year"
                                    value={pub}
                                    onChange={(e) => dispatch({ type: "UPDATE_PUBLICATION", index: idx, value: e.target.value })}
                                    className="af-input"
                                    style={{ flex: 1, minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => dispatch({ type: "REMOVE_PUBLICATION", index: idx })}
                                    style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer" }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Repeatable Professional Memberships */}
                        <div className="af-subsection" style={{ marginBottom: "24px", marginTop: "24px" }}>
                          <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Users size={16} style={{ color: "var(--af-navy)" }} />
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Professional Memberships / Associations</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "ADD_MEMBERSHIP" })}
                              style={{ padding: "6px 12px", background: "var(--af-navy, #143152)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                            >
                              + Add Association
                            </button>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(!state.professionalMemberships || state.professionalMemberships.length === 0) ? (
                              <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, padding: "8px" }}>No professional memberships added yet.</p>
                            ) : (
                              state.professionalMemberships.map((membership, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    placeholder="Organization Name, Position (e.g. Member / President)"
                                    value={membership}
                                    onChange={(e) => dispatch({ type: "UPDATE_MEMBERSHIP", index: idx, value: e.target.value })}
                                    className="af-input"
                                    style={{ flex: 1, minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => dispatch({ type: "REMOVE_MEMBERSHIP", index: idx })}
                                    style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer" }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="af-subsection">
                          <div className="af-subsection__header"><BookOpen size={14} /><span>Teaching Experience (Optional)</span><div className="af-subsection__line" /></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 100px", gap: "12px" }}>
                            {renderInput("teachingExp", "Role / Course", "Lecturer", state.teachingExp || "", "teachingExp")}
                            {renderInput("teachingInst", "Institution", "State University", state.teachingInst || "", "teachingInst")}
                            {renderInput("teachingFrom", "From", "2020", state.teachingFrom || "", "teachingFrom")}
                            {renderInput("teachingTo", "To", "2024", state.teachingTo || "", "teachingTo")}
                          </div>
                        </div>

                        <div className="af-subsection" style={{ marginTop: "24px" }}>
                          <div className="af-subsection__header"><Briefcase size={14} /><span>Administrative Experience (Optional)</span><div className="af-subsection__line" /></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 100px", gap: "12px" }}>
                            {renderInput("adminExp", "Position Role", "Dean", state.adminExp || "", "adminExp")}
                            {renderInput("adminInst", "Institution", "College Office", state.adminInst || "", "adminInst")}
                            {renderInput("adminFrom", "From", "2021", state.adminFrom || "", "adminFrom")}
                            {renderInput("adminTo", "To", "2023", state.adminTo || "", "adminTo")}
                          </div>
                        </div>

                        <div className="af-subsection" style={{ marginTop: "24px" }}>
                          <div className="af-subsection__header"><BookOpen size={14} /><span>Research Publications / Books Written (Optional)</span><div className="af-subsection__line" /></div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {renderInput("pub1", "", "Research Title / Publication 1", state.pub1 || "", "pub1")}
                            {renderInput("pub2", "", "Research Title / Publication 2", state.pub2 || "", "pub2")}
                            {renderInput("pub3", "", "Research Title / Publication 3", state.pub3 || "", "pub3")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ STEP 4: References & Docs ═════════════════════ */}
                {currentStep === 4 && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><ShieldCheck size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>References & Documents</h2>
                        <p className="af-section-desc">Supply endorsement references and upload verification credentials.</p>
                      </div>
                    </div>

                    {state.membershipType === "institutional" ? (
                      <div style={{ padding: "20px", border: "1px solid var(--af-border-light)", borderRadius: "12px", background: "var(--af-cream)", marginBottom: "24px" }}>
                        <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, fontWeight: 500 }}>
                          ℹ References are not required for Institutional memberships. You can proceed to upload documents.
                        </p>
                      </div>
                    ) : state.membershipType === "life" || state.membershipType === "regular" ? (
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "8px" }}>
                          Character References <span style={{ color: "var(--af-error)", fontSize: "14px" }}>* (Provide exactly 2)</span>
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--af-text-muted)", marginBottom: "16px" }}>Please input the details of two professionals who can vouch for your achievements.</p>
                        
                        {errors.characterReferences && (
                          <div style={{ color: "var(--af-error)", fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
                            ⚠️ {errors.characterReferences}
                          </div>
                        )}

                        {[0, 1].map((idx) => {
                          const ref = (state.characterReferences || [])[idx] || { name: "", position: "", address: "" };
                          return (
                            <div key={idx} className="af-subsection" style={{ padding: "20px", border: "1px solid var(--af-border-light)", borderRadius: "12px", marginBottom: "20px", background: "var(--af-surface)" }}>
                              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "12px" }}>Character Reference #{idx + 1}</h4>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)", display: "block", marginBottom: "6px" }}>Full Name *</label>
                                  <input
                                    type="text"
                                    placeholder="Dr. Character Reference"
                                    value={ref.name}
                                    onChange={(e) => dispatch({ type: "UPDATE_CHARACTER_REF", index: idx, field: "name", value: e.target.value })}
                                    className={`af-input ${errors[`ref_${idx}_name`] ? "af-input--error" : ""}`}
                                    style={{ minHeight: "44px", fontSize: "15px", padding: "10px 12px" }}
                                  />
                                  {errors[`ref_${idx}_name`] && <span style={{ color: "var(--af-error)", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors[`ref_${idx}_name`]}</span>}
                                </div>
                                <div>
                                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)", display: "block", marginBottom: "6px" }}>Position / Title *</label>
                                  <input
                                    type="text"
                                    placeholder="Dean / Principal / Director"
                                    value={ref.position}
                                    onChange={(e) => dispatch({ type: "UPDATE_CHARACTER_REF", index: idx, field: "position", value: e.target.value })}
                                    className={`af-input ${errors[`ref_${idx}_position`] ? "af-input--error" : ""}`}
                                    style={{ minHeight: "44px", fontSize: "15px", padding: "10px 12px" }}
                                  />
                                  {errors[`ref_${idx}_position`] && <span style={{ color: "var(--af-error)", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors[`ref_${idx}_position`]}</span>}
                                </div>
                              </div>
                              <div style={{ marginTop: "12px" }}>
                                <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)", display: "block", marginBottom: "6px" }}>Mailing/Office Address *</label>
                                <input
                                  type="text"
                                  placeholder="Institution Address, City"
                                  value={ref.address}
                                  onChange={(e) => dispatch({ type: "UPDATE_CHARACTER_REF", index: idx, field: "address", value: e.target.value })}
                                  className={`af-input ${errors[`ref_${idx}_address`] ? "af-input--error" : ""}`}
                                  style={{ minHeight: "44px", fontSize: "15px", padding: "10px 12px" }}
                                />
                                {errors[`ref_${idx}_address`] && <span style={{ color: "var(--af-error)", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors[`ref_${idx}_address`]}</span>}
                              </div>
                            </div>
                          );
                        })}

                        {/* Chapter Board Member Reference */}
                        <div className="af-subsection" style={{ padding: "20px", border: "2px solid #b8860b33", borderRadius: "12px", background: "#b8860b05", marginBottom: "32px", marginTop: "24px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#b8860b", marginBottom: "4px" }}>
                            Regional Chapter Board Endorsement <span style={{ color: "var(--af-error)", fontSize: "14px" }}>*</span>
                          </h3>
                          <p style={{ fontSize: "14px", color: "var(--af-text-muted)", marginBottom: "16px" }}>One Regional Chapter Board Member or National Officer endorsement is required.</p>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                            <div>
                              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)", display: "block", marginBottom: "6px" }}>Board Member / Officer Name *</label>
                              <input
                                type="text"
                                placeholder="Full Name of regional board member"
                                value={state.regionalChapterBoardReference?.name || ""}
                                onChange={(e) => dispatch({ type: "UPDATE_BOARD_REF", field: "name", value: e.target.value })}
                                className={`af-input ${errors.boardRefName ? "af-input--error" : ""}`}
                                style={{ minHeight: "44px", fontSize: "15px", padding: "10px 12px" }}
                              />
                              {errors.boardRefName && <span style={{ color: "var(--af-error)", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.boardRefName}</span>}
                            </div>
                            <div>
                              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)", display: "block", marginBottom: "6px" }}>Chapter / Region Address *</label>
                              <input
                                type="text"
                                placeholder="e.g. PAGE Region III Chapter Office"
                                value={state.regionalChapterBoardReference?.address || ""}
                                onChange={(e) => dispatch({ type: "UPDATE_BOARD_REF", field: "address", value: e.target.value })}
                                className={`af-input ${errors.boardRefAddress ? "af-input--error" : ""}`}
                                style={{ minHeight: "44px", fontSize: "15px", padding: "10px 12px" }}
                              />
                              {errors.boardRefAddress && <span style={{ color: "var(--af-error)", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.boardRefAddress}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "16px" }}>
                          Endorsement References {state.membershipType !== "associate" && <span style={{ color: "var(--af-error)", fontSize: "14px" }}>* (Required)</span>}
                        </h3>
                        <div className="af-subsection" style={{ padding: "16px", border: "1px solid var(--af-border-light)", borderRadius: "8px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {renderInput("ref1Name", "Reference 1 Name", "Full Name", state.ref1Name || "", "ref1Name", { required: state.membershipType !== "associate" })}
                            {renderInput("ref1Position", "Reference 1 Position", "Graduate School Dean", state.ref1Position || "", "ref1Position", { required: state.membershipType !== "associate" })}
                          </div>
                          {renderInput("ref1Address", "Reference 1 Address", "University address location", state.ref1Address || "", "ref1Address", { required: state.membershipType !== "associate" })}
                        </div>

                        <div className="af-subsection" style={{ padding: "16px", border: "1px solid var(--af-border-light)", borderRadius: "8px", marginTop: "16px", marginBottom: "32px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {renderInput("ref2Name", "Reference 2 Name", "Full Name", state.ref2Name || "", "ref2Name", { required: state.membershipType !== "associate" })}
                            {renderInput("ref2Position", "Reference 2 Position", "PAGE Board Member / Officer", state.ref2Position || "", "ref2Position", { required: state.membershipType !== "associate" })}
                          </div>
                          {renderInput("ref2Address", "Reference 2 Address", "University address location", state.ref2Address || "", "ref2Address", { required: state.membershipType !== "associate" })}
                        </div>
                      </div>
                    )}

                    {/* Document Upload section */}
                    {requiredSlots.filter(slot => slot !== "photo_1x1").length > 0 && (
                      <div style={{ borderTop: "1px solid var(--af-border-light)", paddingTop: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--af-navy)", marginBottom: "16px" }}>Required Documents</h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                          {requiredSlots.filter(slot => slot !== "photo_1x1").map((slot) => {
                            const file = state.documents[slot];
                            const err = fileErrors[slot] || errors[slot];
                            const uploading = isUploading[slot] || false;
                            
                            return (
                              <DocumentUpload
                                key={slot}
                                draftId={draftId!}
                                slotName={slot}
                                label={DOCUMENT_LABELS[slot] || slot}
                                file={file || null}
                                error={err}
                                isUploading={uploading}
                                onFileChange={handleFileChange}
                                required={true}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ STEP 5: Review & Submit ═══════════════════════ */}
                {currentStep === 5 && (
                  <div>
                    <div className="af-section-header screen-only" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><FileText size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Review & Submit</h2>
                        <p className="af-section-desc">Review your details carefully before submitting the application.</p>
                      </div>
                    </div>

                    <div style={{ background: "var(--af-cream)", border: "1px solid var(--af-border-light)", borderRadius: "12px", padding: "32px", marginBottom: "32px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--af-navy)", paddingBottom: "16px", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {(() => {
                            const photoDoc = state.documents["photo_1x1"];
                            const photoUrl = (photoDoc && !(photoDoc instanceof File)) ? photoDoc.url : undefined;
                            if ((state.membershipType === "life" || state.membershipType === "regular") && photoUrl) {
                              return (
                                <img
                                  src={photoUrl}
                                  alt="1x1 Portrait Thumbnail"
                                  style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "2px solid #2d62ae" }}
                                />
                              );
                            }
                            return null;
                          })()}
                          <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--af-navy)", margin: 0 }}>
                            {state.membershipType === "regular" ? "Regular Membership" : (selectedCategory?.name || "")} Application
                          </h3>
                        </div>
                        <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--af-navy)" }}>
                          {getComputedFeeString()}
                        </span>
                      </div>

                      {/* Profile data review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>1. Profile Details</h4>
                          <button type="button" onClick={() => handleStepClick(1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "life" || state.membershipType === "regular" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div><strong>Full Name:</strong> {state.name}</div>
                            <div><strong>Region:</strong> {state.region}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Home Address:</strong> {state.homeAddress}</div>
                            <div><strong>Mobile / Tel No:</strong> {state.telMobileNo}</div>
                            <div><strong>Email Address:</strong> {state.emailAddress}</div>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div><strong>Full Name:</strong> {state.fullName}</div>
                            <div><strong>Region:</strong> {state.region}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Home Address:</strong> {state.homeAddress}</div>
                            <div><strong>Mobile / Tel No:</strong> {state.phone}</div>
                            <div><strong>Email:</strong> {state.email}</div>
                            {state.membershipType === "institutional" && (
                              <div><strong>Program Enrollees:</strong> {state.enrolleeCount}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Education & Job review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>2. Employment & Education</h4>
                          <button type="button" onClick={() => handleStepClick(2)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "life" || state.membershipType === "regular" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div style={{ gridColumn: "span 2" }}><strong>Institution/Employer:</strong> {state.whereEmployed}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Office/Business Address:</strong> {state.businessAddress}</div>
                            <div><strong>Present Position:</strong> {state.presentPosition}</div>
                            <div><strong>Degree Obtained:</strong> {state.degreeObtained}</div>
                            <div><strong>Specialization:</strong> {state.specialization}</div>
                            <div><strong>Degree Institution:</strong> {state.institution}</div>
                            <div><strong>Year Obtained:</strong> {state.yearObtained}</div>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div style={{ gridColumn: "span 2" }}><strong>Institution/Employer:</strong> {state.institution}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Office/Business Address:</strong> {state.address}</div>
                            <div><strong>Present Position:</strong> {state.presentPosition}</div>



                            {state.membershipType === "associate" && (
                              <>
                                <div><strong>Enrollment Status:</strong> {state.currentEnrollmentStatus}</div>
                                <div><strong>Expected Graduation:</strong> {state.expectedGraduationYear}</div>
                              </>
                            )}

                            {state.membershipType === "institutional" && (
                              <div style={{ gridColumn: "span 2" }}><strong>Accreditation / CHED Status:</strong> {state.accreditationDetails}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Experience review */}
                      {state.membershipType !== "institutional" && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>3. Experience & Publications</h4>
                            <button type="button" onClick={() => handleStepClick(3)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                          </div>
                          {state.membershipType === "life" || state.membershipType === "regular" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "15px" }}>
                              {state.membershipType === "life" && <div><strong>Years Active in PAGE:</strong> {state.yearsActiveInPAGE}</div>}
                              
                              {state.teachingExperience && state.teachingExperience.length > 0 && (
                                <div>
                                  <strong>Teaching Experience:</strong>
                                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                    {state.teachingExperience.map((t, idx) => (
                                      <li key={idx}>{t.institution} ({t.fromYear} - {t.toYear})</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {state.administrativeExperience && state.administrativeExperience.length > 0 && (
                                <div>
                                  <strong>Administrative Experience:</strong>
                                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                    {state.administrativeExperience.map((a, idx) => (
                                      <li key={idx}>{a.institution} ({a.fromYear} - {a.toYear})</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {state.recentPublications && state.recentPublications.filter(p => p.trim() !== "").length > 0 && (
                                <div>
                                  <strong>Publications:</strong>
                                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                    {state.recentPublications.filter(p => p.trim() !== "").map((p, idx) => (
                                      <li key={idx}>{p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {state.professionalMemberships && state.professionalMemberships.filter(m => m.trim() !== "").length > 0 && (
                                <div>
                                  <strong>Professional Memberships:</strong>
                                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                    {state.professionalMemberships.filter(m => m.trim() !== "").map((m, idx) => (
                                      <li key={idx}>{m}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                              {state.teachingExp && (
                                <div style={{ gridColumn: "span 2" }}><strong>Teaching Experience:</strong> {state.teachingExp} at {state.teachingInst} ({state.teachingFrom} - {state.teachingTo})</div>
                              )}
                              {state.adminExp && (
                                <div style={{ gridColumn: "span 2" }}><strong>Admin Experience:</strong> {state.adminExp} at {state.adminInst} ({state.adminFrom} - {state.adminTo})</div>
                              )}
                              {state.pub1 && (
                                <div style={{ gridColumn: "span 2" }}><strong>Research / Publications:</strong> {state.pub1}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* References & Documents review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>4. References & Uploads</h4>
                          <button type="button" onClick={() => handleStepClick(4)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "life" || state.membershipType === "regular" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px", marginBottom: "16px" }}>
                            {state.characterReferences?.map((r, idx) => (
                              <div key={idx}>
                                <strong>Character Reference #{idx + 1}:</strong> {r.name} ({r.position})<br />
                                <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{r.address}</span>
                              </div>
                            ))}
                            <div style={{ gridColumn: "span 2" }}>
                              <strong>Regional Board Reference:</strong> {state.regionalChapterBoardReference?.name}<br />
                              <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{state.regionalChapterBoardReference?.address}</span>
                            </div>
                          </div>
                        ) : (
                          state.membershipType !== "institutional" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px", marginBottom: "16px" }}>
                              <div>
                                <strong>Reference 1:</strong> {state.ref1Name} ({state.ref1Position})<br />
                                <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{state.ref1Address}</span>
                              </div>
                              <div>
                                <strong>Reference 2:</strong> {state.ref2Name} ({state.ref2Position})<br />
                                <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{state.ref2Address}</span>
                              </div>
                            </div>
                          )
                        )}

                        <div style={{ fontSize: "15px" }}>
                          <strong>Uploaded Documents:</strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                            {requiredSlots.map((slot) => {
                              const doc = state.documents[slot];
                              return (
                                <div key={slot} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--af-border-light)" }}>
                                  <FileText size={16} style={{ color: "var(--af-blue-mid)" }} />
                                  <span style={{ fontWeight: 600 }}>{DOCUMENT_LABELS[slot] || slot}:</span>
                                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{doc?.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consent checkbox on Step 5 */}
                    <div className="af-consent-box" style={{ marginTop: "32px", padding: "20px", background: "var(--af-cream)", borderRadius: "12px", border: "1px solid var(--af-border-light)", marginBottom: "40px" }}>
                      <label className="af-consent-label" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => {
                            setConsentChecked(e.target.checked);
                            if (errors.consent) setErrors((p) => ({ ...p, consent: null }));
                          }}
                          className="af-consent-checkbox"
                          style={{ marginTop: "4px", width: "20px", height: "20px" }}
                        />
                        <span style={{ fontSize: "15px", lineHeight: 1.5, color: "var(--af-navy)" }}>
                          <strong>Data Privacy Agreement *</strong><br />
                          I hereby agree that I have read the PAGE Privacy Policy, understood its contents and explicitly consent to the collection, usage, and processing of my personal data under the Data Privacy Act of 2012 for registration purposes.
                        </span>
                      </label>
                      {errors.consent && <span style={{ color: "var(--af-error)", fontSize: "14px", display: "block", marginTop: "8px", marginLeft: "32px", fontWeight: 600 }}>{errors.consent}</span>}
                    </div>

                    {/* Payment details box */}
                    <div style={{ border: "2px solid #2d62ae", borderRadius: "12px", padding: "24px", background: "#2d62ae0a", marginBottom: "40px" }}>
                      <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#1a3c6e", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🏦 Payment Procedure
                      </h4>
                      <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--af-text)", margin: 0 }}>
                        Please deposit your membership fee of <strong>{getComputedFeeString()}</strong> to the official PAGE bank account details below:
                      </p>
                      <div style={{ marginTop: "16px", padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid rgba(45,98,174,0.2)", fontSize: "15px" }}>
                        <div style={{ marginBottom: "6px" }}><strong>Bank:</strong> Philippine National Bank (PNB)</div>
                        <div style={{ marginBottom: "6px" }}><strong>Branch:</strong> UN Avenue Branch</div>
                        <div style={{ marginBottom: "6px" }}><strong>Account Type:</strong> Checking Account (CA)</div>
                        <div style={{ marginBottom: "6px" }}><strong>Account Number:</strong> CA# 1685-7001-0631</div>
                        <div><strong>Account Name:</strong> PAGE</div>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--af-text-muted)", marginTop: "12px", margin: 0 }}>
                        ℹ Note: After bank transaction deposit, please keep your official deposit slip or receipt. You will present this proof of payment to complete your membership activation.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Nav Actions ────────────────────────────────────── */}
            <div className="af-actions screen-only" style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", borderTop: "1px solid var(--af-border-light)", paddingTop: "24px" }}>
              {currentStep > 1 ? (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="af-btn af-btn--secondary"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ minHeight: "48px", fontSize: "16px", padding: "0 24px", display: "flex", alignItems: "center", gap: "8px" }}
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
                  style={{ minHeight: "48px", fontSize: "16px", padding: "0 24px", display: "flex", alignItems: "center", gap: "8px" }}
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
                  style={{ minHeight: "48px", fontSize: "18px", fontWeight: 700, padding: "0 32px", background: "var(--af-success)", color: "#fff", border: "none" }}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
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
            <p style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color: "var(--af-navy)" }}>
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
