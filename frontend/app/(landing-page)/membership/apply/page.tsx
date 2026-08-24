"use client";

import { useReducer, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
import { PageSeal } from "../../components/PageSeal";
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
  telephoneNo: "",
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
  
  // Institutional Specific
  collegeUniversityName: "",
  institutionAddress: "",
  presidentName: "",
  deanHeadGraduateSchool: "",
  educationCoursesOffered: [""],
  graduateCoursesOffered: [""],
  totalGraduateFaculty: "",
  currentEnrollmentCount: "",
  enrollmentYearRange: "",
  professionalAffiliations: [""],
};

type Action =
  | { type: "SET_FIELD"; field: keyof Omit<ApplicationFormState, "documents">; value: any }
  | { type: "SET_DOCUMENT"; slotName: string; file: { name: string; size?: number; url?: string } | null }
  | { type: "LOAD_APPLICATION"; app: MembershipApplication }
  | { type: "RESET_FORM" }
  | { type: "ADD_TEACHING_EXP" }
  | { type: "REMOVE_TEACHING_EXP"; index: number }
  | { type: "UPDATE_TEACHING_EXP"; index: number; field: "role" | "institution" | "fromYear" | "toYear"; value: string }
  | { type: "ADD_ADMIN_EXP" }
  | { type: "REMOVE_ADMIN_EXP"; index: number }
  | { type: "UPDATE_ADMIN_EXP"; index: number; field: "role" | "institution" | "fromYear" | "toYear"; value: string }
  | { type: "ADD_PUBLICATION" }
  | { type: "REMOVE_PUBLICATION"; index: number }
  | { type: "UPDATE_PUBLICATION"; index: number; value: string }
  | { type: "ADD_MEMBERSHIP" }
  | { type: "REMOVE_MEMBERSHIP"; index: number }
  | { type: "UPDATE_MEMBERSHIP"; index: number; value: string }
  | { type: "UPDATE_CHARACTER_REF"; index: number; field: "name" | "position" | "address"; value: string }
  | { type: "UPDATE_BOARD_REF"; field: "name" | "address"; value: string }
  | { type: "ADD_EDUCATION_COURSE" }
  | { type: "REMOVE_EDUCATION_COURSE"; index: number }
  | { type: "UPDATE_EDUCATION_COURSE"; index: number; value: string }
  | { type: "ADD_GRADUATE_COURSE" }
  | { type: "REMOVE_GRADUATE_COURSE"; index: number }
  | { type: "UPDATE_GRADUATE_COURSE"; index: number; value: string }
  | { type: "ADD_AFFILIATION" }
  | { type: "REMOVE_AFFILIATION"; index: number }
  | { type: "UPDATE_AFFILIATION"; index: number; value: string };

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
        teachingExperience: [...(state.teachingExperience || []), { role: "", institution: "", fromYear: "", toYear: "" }],
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
        administrativeExperience: [...(state.administrativeExperience || []), { role: "", institution: "", fromYear: "", toYear: "" }],
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
    case "ADD_EDUCATION_COURSE":
      return {
        ...state,
        educationCoursesOffered: [...(state.educationCoursesOffered || []), ""],
      };
    case "REMOVE_EDUCATION_COURSE":
      return {
        ...state,
        educationCoursesOffered: (state.educationCoursesOffered || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_EDUCATION_COURSE": {
      const arr = [...(state.educationCoursesOffered || [])];
      arr[action.index] = action.value;
      return { ...state, educationCoursesOffered: arr };
    }
    case "ADD_GRADUATE_COURSE":
      return {
        ...state,
        graduateCoursesOffered: [...(state.graduateCoursesOffered || []), ""],
      };
    case "REMOVE_GRADUATE_COURSE":
      return {
        ...state,
        graduateCoursesOffered: (state.graduateCoursesOffered || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_GRADUATE_COURSE": {
      const arr = [...(state.graduateCoursesOffered || [])];
      arr[action.index] = action.value;
      return { ...state, graduateCoursesOffered: arr };
    }
    case "ADD_AFFILIATION":
      return {
        ...state,
        professionalAffiliations: [...(state.professionalAffiliations || []), ""],
      };
    case "REMOVE_AFFILIATION":
      return {
        ...state,
        professionalAffiliations: (state.professionalAffiliations || []).filter((_, i) => i !== action.index),
      };
    case "UPDATE_AFFILIATION": {
      const arr = [...(state.professionalAffiliations || [])];
      arr[action.index] = action.value;
      return { ...state, professionalAffiliations: arr };
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
        telephoneNo: profile.telephoneNo || "",
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
        
        // Institutional fields load
        collegeUniversityName: profile.collegeUniversityName || "",
        institutionAddress: profile.institutionAddress || "",
        presidentName: profile.presidentName || "",
        deanHeadGraduateSchool: profile.deanHeadGraduateSchool || "",
        educationCoursesOffered: Array.isArray(eduJob.educationCoursesOffered) ? eduJob.educationCoursesOffered : [""],
        graduateCoursesOffered: Array.isArray(eduJob.graduateCoursesOffered) ? eduJob.graduateCoursesOffered : [""],
        totalGraduateFaculty: eduJob.totalGraduateFaculty !== undefined ? String(eduJob.totalGraduateFaculty) : "",
        currentEnrollmentCount: eduJob.currentEnrollmentCount !== undefined ? String(eduJob.currentEnrollmentCount) : "",
        enrollmentYearRange: eduJob.enrollmentYearRange || "",
        professionalAffiliations: Array.isArray(exp.professionalAffiliations) ? exp.professionalAffiliations : [""],
        
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

const STEPS = {
  associate: [
    { id: "profile", number: 1, label: "Profile", icon: User },
    { id: "education-job", number: 2, label: "Graduate Program Info", icon: GraduationCap },
    { id: "academic-info", number: 3, label: "Academic Information", icon: BookOpen },
    { id: "experience", number: 4, label: "Experience", icon: Briefcase },
    { id: "references", number: 5, label: "References", icon: ShieldCheck },
    { id: "review", number: 6, label: "Review", icon: FileText },
  ],
  institutional: [
    { id: "profile", number: 1, label: "Institution Profile", icon: User },
    { id: "education-job", number: 2, label: "Academic Information", icon: GraduationCap },
    { id: "experience", number: 3, label: "Professional Affiliations", icon: Briefcase },
    { id: "references", number: 4, label: "References", icon: ShieldCheck },
    { id: "review", number: 5, label: "Review", icon: FileText },
  ],
  default: [
    { id: "profile", number: 1, label: "Profile", icon: User },
    { id: "education-job", number: 2, label: "Education & Job", icon: GraduationCap },
    { id: "experience", number: 3, label: "Experience", icon: Briefcase },
    { id: "references", number: 4, label: "References", icon: ShieldCheck },
    { id: "review", number: 5, label: "Review", icon: FileText },
  ]
};

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

/* ── Helpers ───────────────────────────────────────────────────────────────── */

/** Converts 1-5 to Roman numerals for the ordinal stepper tablets */
const toRoman = (n: number): string =>
  ["I", "II", "III", "IV", "V", "VI"][n - 1] ?? String(n);

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
  const [showChangeTypeConfirm, setShowChangeTypeConfirm] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});

  /** Respects prefers-reduced-motion for step completion animation */
  const prefersReducedMotion = useReducedMotion() ?? false;

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
      const count = Number(state.currentEnrollmentCount) || 0;
      if (count <= 100) return "₱1,200.00 / year (Tier 1: <= 100 enrollees)";
      if (count <= 200) return "₱2,000.00 / year (Tier 2: 101-200 enrollees)";
      return "₱3,000.00 / year (Tier 3: 201+ enrollees)";
    }
    return "₱0";
  };

  /* ── Validation ──────────────────────────────────────────────────────────── */

  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string | null> = {};
    let isValid = true;

    const stepsList = (STEPS as any)[state.membershipType || "default"] || STEPS.default;
    const currentStepConfig = stepsList[stepNum - 1];
    const stepId = currentStepConfig?.id;

    if (stepId === "profile") {
      if (!state.membershipType) { stepErrors.membershipType = "Please select a membership type."; isValid = false; }
      
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (!state.name?.trim()) { stepErrors.name = "Full Name is required."; isValid = false; }
        if (!state.region?.trim()) { stepErrors.region = "Region is required."; isValid = false; }
        if (!state.homeAddress?.trim()) { stepErrors.homeAddress = "Home Address is required."; isValid = false; }
        if (!state.telMobileNo?.trim()) { stepErrors.telMobileNo = "Mobile No. is required."; isValid = false; }
        else if (!/^\+?\d{7,15}$/.test(state.telMobileNo.trim())) { stepErrors.telMobileNo = "Must be a valid mobile number (e.g. 09171234567 or +639171234567)."; isValid = false; }
        if (state.telephoneNo?.trim()) {
          const telDigits = state.telephoneNo.replace(/\D/g, "");
          if (telDigits.length !== 10) {
            stepErrors.telephoneNo = "Telephone must be a valid 10-digit number (e.g. (02) 8123-4567).";
            isValid = false;
          }
        }
        if (!state.emailAddress?.trim()) { stepErrors.emailAddress = "Email Address is required."; isValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.emailAddress)) { stepErrors.emailAddress = "Invalid email format."; isValid = false; }
        if (!state.documents["photo_1x1"]) { stepErrors.photo_1x1 = "1x1 Photo is required."; isValid = false; }
      } else if (state.membershipType === "institutional") {
        if (!state.collegeUniversityName?.trim()) { stepErrors.collegeUniversityName = "College/University Name is required."; isValid = false; }
        if (!state.institutionAddress?.trim()) { stepErrors.institutionAddress = "Institution Complete Address is required."; isValid = false; }
        if (!state.telMobileNo?.trim()) { stepErrors.telMobileNo = "Telephone No. is required."; isValid = false; }
        else {
          const telDigits = state.telMobileNo.replace(/\D/g, "");
          if (telDigits.length !== 10) {
            stepErrors.telMobileNo = "Telephone must be a valid 10-digit number (e.g. (02) 8123-4567).";
            isValid = false;
          }
        }
        if (state.phone?.trim()) {
          if (!/^\+?\d{7,15}$/.test(state.phone.trim())) {
            stepErrors.phone = "Must be a valid mobile number (e.g. 09171234567 or +639171234567).";
            isValid = false;
          }
        }
        if (!state.emailAddress?.trim()) { stepErrors.emailAddress = "Email Address is required."; isValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.emailAddress)) { stepErrors.emailAddress = "Invalid email format."; isValid = false; }
        if (!state.presidentName?.trim()) { stepErrors.presidentName = "President of College/University is required."; isValid = false; }
        if (!state.deanHeadGraduateSchool?.trim()) { stepErrors.deanHeadGraduateSchool = "Dean/Head of Graduate School is required."; isValid = false; }
      } else {
        if (!state.fullName?.trim()) { stepErrors.fullName = "Full Name is required."; isValid = false; }
        if (!state.region?.trim()) { stepErrors.region = "Region is required."; isValid = false; }
        if (!state.homeAddress?.trim()) { stepErrors.homeAddress = "Home Address is required."; isValid = false; }
        if (!state.phone?.trim()) { stepErrors.phone = "Mobile No. is required."; isValid = false; }
        else if (!/^\+?\d{7,15}$/.test(state.phone.trim())) { stepErrors.phone = "Must be a valid mobile number (e.g. 09171234567 or +639171234567)."; isValid = false; }
        if (state.telephoneNo?.trim()) {
          const telDigits = state.telephoneNo.replace(/\D/g, "");
          if (telDigits.length !== 10) {
            stepErrors.telephoneNo = "Telephone must be a valid 10-digit number (e.g. (02) 8123-4567).";
            isValid = false;
          }
        }
        if (!state.email?.trim()) { stepErrors.email = "Email is required."; isValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { stepErrors.email = "Invalid email format."; isValid = false; }
        
        if (state.membershipType === "associate") {
          if (!state.documents["photo_1x1"]) { stepErrors.photo_1x1 = "1x1 Photo is required."; isValid = false; }
        }
      }
    }

    if (stepId === "education-job") {
      if (state.membershipType === "life" || state.membershipType === "regular") {
        if (!state.whereEmployed?.trim()) { stepErrors.whereEmployed = "Where Employed is required."; isValid = false; }
        if (!state.businessAddress?.trim()) { stepErrors.businessAddress = "Business Address is required."; isValid = false; }
        if (!state.presentPosition?.trim()) { stepErrors.presentPosition = "Present Position is required."; isValid = false; }
        if (!state.degreeObtained?.trim()) { stepErrors.degreeObtained = "Highest Degree Obtained is required."; isValid = false; }
        if (!state.specialization?.trim()) { stepErrors.specialization = "Specialization is required."; isValid = false; }
        if (!state.institution?.trim()) { stepErrors.institution = "Degree school/institution is required."; isValid = false; }
        if (!state.yearObtained?.trim()) { stepErrors.yearObtained = "Year obtained is required."; isValid = false; }
        else if (!/^\d{4}$/.test(state.yearObtained?.trim() || "")) { stepErrors.yearObtained = "Must be a 4-digit year."; isValid = false; }
      } else if (state.membershipType === "institutional") {
        if (!state.totalGraduateFaculty?.trim()) { stepErrors.totalGraduateFaculty = "Total Graduate School Faculty is required."; isValid = false; }
        if (!state.currentEnrollmentCount?.trim()) { stepErrors.currentEnrollmentCount = "Current Enrollment Count is required."; isValid = false; }
        if (!state.enrollmentYearRange?.trim()) { stepErrors.enrollmentYearRange = "Enrollment Year Range is required."; isValid = false; }
        if (!state.educationCoursesOffered || state.educationCoursesOffered.filter((c: string) => c.trim() !== "").length === 0) {
          stepErrors.educationCoursesOffered = "Please add at least one undergraduate course/degree offered.";
          isValid = false;
        }
        if (!state.graduateCoursesOffered || state.graduateCoursesOffered.filter((c: string) => c.trim() !== "").length === 0) {
          stepErrors.graduateCoursesOffered = "Please add at least one graduate course offered.";
          isValid = false;
        }
      } else {
        if (!state.institution?.trim()) { stepErrors.institution = "Employer / School Institution name is required."; isValid = false; }
        if (!state.address?.trim()) { stepErrors.address = "Office / Business Address is required."; isValid = false; }
        if (!state.presentPosition?.trim()) { stepErrors.presentPosition = "Present Position is required."; isValid = false; }

        if (state.membershipType === "associate") {
          if (!state.currentEnrollmentStatus?.trim()) { stepErrors.currentEnrollmentStatus = "Current enrollment status is required."; isValid = false; }
          if (!state.expectedGraduationYear?.trim()) { stepErrors.expectedGraduationYear = "Expected graduation year is required."; isValid = false; }
          else if (!/^\d{4}$/.test(state.expectedGraduationYear?.trim() || "")) { stepErrors.expectedGraduationYear = "Must be a 4-digit year."; isValid = false; }
        }
      }
    }

    if (stepId === "academic-info") {
      if (state.membershipType === "associate") {
        if (!state.currentAcademicStatus?.trim()) { stepErrors.currentAcademicStatus = "Current Academic Status is required."; isValid = false; }
      }
    }

    if (stepId === "experience") {
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
          state.teachingExperience.forEach((t: any, i: number) => {
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
          state.administrativeExperience.forEach((a: any, i: number) => {
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
      } else if (state.membershipType !== "institutional") {
        if (state.teachingFrom?.trim() && !/^\d{4}$/.test(state.teachingFrom?.trim() || "")) { stepErrors.teachingFrom = "Must be a 4-digit year."; isValid = false; }
        if (state.teachingTo?.trim() && !/^\d{4}$/.test(state.teachingTo?.trim() || "")) { stepErrors.teachingTo = "Must be a 4-digit year."; isValid = false; }
        if (state.adminFrom?.trim() && !/^\d{4}$/.test(state.adminFrom?.trim() || "")) { stepErrors.adminFrom = "Must be a 4-digit year."; isValid = false; }
        if (state.adminTo?.trim() && !/^\d{4}$/.test(state.adminTo?.trim() || "")) { stepErrors.adminTo = "Must be a 4-digit year."; isValid = false; }
        
        if (stepErrors.teachingFrom || stepErrors.teachingTo || stepErrors.adminFrom || stepErrors.adminTo) {
          isValid = false;
        }
      }
    }

    if (stepId === "references") {
      if (state.membershipType === "life" || state.membershipType === "regular" || state.membershipType === "associate") {
        if (!state.characterReferences || state.characterReferences.length !== 2) {
          stepErrors.characterReferences = "Exactly two character references are required.";
          isValid = false;
        } else {
          state.characterReferences.forEach((r: any, idx: number) => {
            if (!r.name?.trim()) { stepErrors[`ref_${idx}_name`] = "Name is required."; isValid = false; }
            if (idx === 0 && !r.position?.trim()) { stepErrors[`ref_${idx}_position`] = "Position is required."; isValid = false; }
            if (!r.address?.trim()) { stepErrors[`ref_${idx}_address`] = "Address is required."; isValid = false; }
          });
        }

        const boardRef = state.regionalChapterBoardReference;
        if (!boardRef?.name?.trim()) { stepErrors.boardRefName = "Name is required."; isValid = false; }
        if (!boardRef?.address?.trim()) { stepErrors.boardRefAddress = "Address is required."; isValid = false; }
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

    if (stepId === "review") {
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
    setShowChangeTypeConfirm(true);
  };

  const confirmChangeMembershipType = () => {
    setShowChangeTypeConfirm(false);
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
  };

  /* ── Navigation & Persistence ────────────────────────────────────────────── */

  const persistStep = async (stepNumber: number): Promise<boolean> => {
    if (!draftId) return false;

    const stepsList = (STEPS as any)[state.membershipType || "default"] || STEPS.default;
    const currentStepConfig = stepsList[stepNumber - 1];
    const stepId = currentStepConfig?.id;

    if (!stepId) return false;

    let stepName = stepId;
    let stepData: Record<string, any> = {};

    if (stepId === "profile") {
      if (state.membershipType === "life" || state.membershipType === "regular") {
        stepData = {
          name: state.name,
          emailAddress: state.emailAddress,
          telMobileNo: state.telMobileNo,
          telephoneNo: state.telephoneNo,
          region: state.region,
          homeAddress: state.homeAddress,
        };
      } else if (state.membershipType === "institutional") {
        stepData = {
          collegeUniversityName: state.collegeUniversityName,
          institutionAddress: state.institutionAddress,
          telMobileNo: state.telMobileNo,
          phone: state.phone,
          emailAddress: state.emailAddress,
          presidentName: state.presidentName,
          deanHeadGraduateSchool: state.deanHeadGraduateSchool,
          enrolleeCount: state.enrolleeCount !== undefined ? Number(state.enrolleeCount) : undefined,
        };
      } else {
        stepData = {
          fullName: state.fullName,
          email: state.email,
          phone: state.phone,
          telephoneNo: state.telephoneNo,
          region: state.region,
          homeAddress: state.homeAddress,
        };
      }
    } else if (stepId === "education-job") {
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
    } else if (stepId === "academic-info") {
      stepData = {
        currentAcademicStatus: state.currentAcademicStatus,
        researchInterests: state.researchInterests,
      };
    } else if (stepId === "experience") {
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
    } else if (stepId === "references") {
      if (state.membershipType === "life" || state.membershipType === "regular" || state.membershipType === "associate" || state.membershipType === "institutional") {
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

    const lastValidationStep = state.membershipType === "associate" ? 5 : 4;
    if (!validateStep(lastValidationStep)) {
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

  const stepsList = (STEPS as any)[state.membershipType || "default"] || STEPS.default;
  const currentStepConfig = stepsList[currentStep - 1];
  const currentStepId = currentStepConfig?.id;
  const progress = ((currentStep - 1) / (stepsList.length - 1)) * 100;

  /* ── Formatting Helpers ──────────────────────────────────────────────────── */

  const formatTelephone = (val: string, previousVal = "") => {
    const isDeleting = previousVal.length > val.length;
    let digits = val.replace(/\D/g, "");
    if (digits.length > 0 && digits[0] !== "0") {
      digits = "0" + digits;
    }
    if (digits.length === 0) return "";
    
    if (digits.startsWith("02")) {
      if (digits.length <= 2) {
        return isDeleting ? digits : `(${digits}`;
      }
      const rest = digits.slice(2);
      if (rest.length <= 4) {
        return `(02) ${rest}`;
      }
      return `(02) ${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
    } else {
      if (digits.length <= 3) {
        return isDeleting ? digits : `(${digits}`;
      }
      const area = digits.slice(0, 3);
      const rest = digits.slice(3);
      if (rest.length <= 3) {
        return `(${area}) ${rest}`;
      }
      return `(${area}) ${rest.slice(0, 3)}-${rest.slice(3, 7)}`;
    }
  };

  const cleanMobile = (val: string) => {
    let clean = val.replace(/[^0-9+]/g, "");
    if (clean.includes('+')) {
      const hasLeading = clean.startsWith('+');
      clean = (hasLeading ? '+' : '') + clean.replace(/\+/g, '');
    }
    
    // Enforce dynamic length limits based on format prefix
    if (clean.startsWith('+63')) {
      return clean.slice(0, 13);
    } else if (clean.startsWith('63')) {
      return clean.slice(0, 12);
    } else if (clean.startsWith('0')) {
      return clean.slice(0, 11);
    } else if (clean.startsWith('+')) {
      return clean.slice(0, 15); // Other countries with +
    } else {
      return clean.slice(0, 15); // Fallback max length
    }
  };

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
            const previousVal = value || "";
            const isTelephone = field === "telephoneNo" || (state.membershipType === "institutional" && field === "telMobileNo");
            const isMobile = (state.membershipType !== "institutional" && field === "telMobileNo") || field === "phone";

            if (isTelephone) {
              val = formatTelephone(val, previousVal);
            } else if (isMobile) {
              val = cleanMobile(val);
            } else {
              const digitOnlyFields = ["enrolleeCount", "yearObtained", "expectedGraduationYear", "yearsActiveInPAGE", "teachingFrom", "teachingTo", "adminFrom", "adminTo"];
              if (digitOnlyFields.includes(field)) {
                val = val.replace(/\D/g, "");
              }
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
          <p style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: "var(--af-navy)", fontFamily: "var(--font-poppins), 'Poppins', sans-serif", fontStyle: "normal" }}>
            Preparing your dossier…
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
          <div className="af-hero__content">
            <h1 className="af-hero__title">PAGE Membership Registration</h1>
            <div className="af-hero__gold-line" />
            <p className="af-hero__subtitle">
              Choose your membership classification to start your application process.
            </p>
          </div>
        </div>

        <main className="af-main screen-only-wrapper" style={{ padding: "48px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Section heading */}
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", color: "var(--af-gold)", marginBottom: "12px" }}>
              Classification
            </span>
            <h2 style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              color: "var(--af-navy)",
              marginBottom: "10px",
              letterSpacing: "-0.2px",
            }}>
              Select Your Membership Track
            </h2>
            <p style={{ fontSize: "15px", color: "var(--af-text-muted)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
              Each classification carries distinct obligations and privileges. Choose the track that reflects your academic role and standing.
            </p>
          </div>

          {/* Credentialing-style category cards */}
          <div className="af-category-grid">
            {CATEGORIES.map((cat, idx) => {
              const isFeatured = cat.id === "regular";
              const priceLabel = cat.id === "life" ? "Lifetime Investment" : cat.id === "institutional" ? "Annual Institutional Fee" : "Annual Dues";
              return (
                <motion.div
                  key={cat.id}
                  className={`af-category${isFeatured ? " af-category--featured" : ""}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleSelectType(cat.id)}
                >
                  {/* Seal watermark */}
                  <div className="af-category__seal">
                    <PageSeal
                      size={isFeatured ? 50 : 42}
                      variant={isFeatured ? "gold" : "navy-outline"}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3 className="af-category__name">{cat.name}</h3>
                    <p className="af-category__desc">{cat.desc}</p>
                  </div>

                  <div>
                    <span className="af-category__price-label">{priceLabel}</span>
                    <span className="af-category__price-value">{cat.fee}</span>
                    <button
                      type="button"
                      className="af-category__cta"
                    >
                      Begin Application <ArrowRight size={15} />
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
          <p className="af-hero__subtitle" style={{ fontSize: "15px" }}>
            Dossier Track —{" "}
            <strong style={{ color: "var(--af-gold-lt, #EBD3A0)", fontStyle: "italic" }}>
              {selectedCategory?.name}
            </strong>
            <span style={{ opacity: 0.6, marginLeft: "12px", fontSize: "13px" }}>
              {getComputedFeeString()}
            </span>
          </p>
        </motion.div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="af-main screen-only-wrapper" style={{ paddingBottom: "72px" }}>

        {/* ─ Dossier Tab Banner ─ Replaces amber 'Applying as X' warning ─ */}
        <div className="af-dossier-tab">
          <div className="af-dossier-tab__info">
            <PageSeal size={22} variant="gold" />
            <div>
              <p className="af-dossier-tab__label">Active Dossier</p>
              <p className="af-dossier-tab__type">{selectedCategory?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleChangeMembershipType}
            className="af-dossier-tab__change"
          >
            Change Classification
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
            {stepsList.map((step: any) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <button
                  key={step.number}
                  type="button"
                  className={`af-step ${isCompleted ? "af-step--done" : ""} ${isActive ? "af-step--active" : ""}`}
                  onClick={() => handleStepClick(step.number)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.label}${isCompleted ? " — completed" : ""}`}
                >
                  {/* Ordinal tablet with wax-seal flip on completion */}
                  <span className="af-step__tablet">
                    <AnimatePresence mode="wait" initial={false}>
                      {isCompleted ? (
                        <motion.span
                          key="seal"
                          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0, rotate: -120 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 380, damping: 20 }}
                          style={{ display: "flex" }}
                        >
                          <PageSeal size={26} variant="gold" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="numeral"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="af-step__numeral"
                        >
                          {toRoman(step.number)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="af-step__label">{step.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile condensed step indicator — shown only on narrow screens */}
          <div className="af-step-condensed" aria-hidden="true">
            Step {currentStep} of {stepsList.length}:&nbsp;
            <strong>{stepsList[currentStep - 1]?.label}</strong>
          </div>
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
                {currentStepId === "profile" && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><User size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>
                          {state.membershipType === "institutional" ? "Institution Profile" : "Profile Information"}
                        </h2>
                        <p className="af-section-desc">
                          {state.membershipType === "institutional"
                            ? "Provide contact details and officers of the college or university."
                            : "Provide your contact details, address location, and 1x1 photo."}
                        </p>
                      </div>
                    </div>

                    {state.membershipType === "institutional" ? (
                      <>
                        {renderInput("collegeUniversityName", "College / University Name", "PAGE National University", state.collegeUniversityName || "", "collegeUniversityName", { required: true })}
                        {renderInput("institutionAddress", "Institution Complete Address", "123 Taft Avenue, Manila", state.institutionAddress || "", "institutionAddress", { required: true })}
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {renderInput("telMobileNo", "Telephone No.", "(02) 8123-4567", state.telMobileNo || "", "telMobileNo", { type: "tel", required: true })}
                          {renderInput("phone", "Mobile No.", "09171234567", state.phone || "", "phone", { type: "tel", required: false })}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                          {renderInput("emailAddress", "Email Address", "info@university.edu.ph", state.emailAddress || "", "emailAddress", { type: "email", required: true })}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                          {renderInput("presidentName", "President of College / University", "Dr. Juan Dela Cruz", state.presidentName || "", "presidentName", { required: true })}
                          {renderInput("deanHeadGraduateSchool", "Dean / Head of Graduate School", "Dr. Maria Clara", state.deanHeadGraduateSchool || "", "deanHeadGraduateSchool", { required: true })}
                        </div>
                      </>
                    ) : state.membershipType === "life" || state.membershipType === "regular" ? (
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
                          {renderInput("telMobileNo", "Mobile No.", "09171234567", state.telMobileNo || "", "telMobileNo", { type: "tel", required: true })}
                          {renderInput("telephoneNo", "Telephone No.", "(02) 8123-4567", state.telephoneNo || "", "telephoneNo", { type: "tel", required: false })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
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
                          {renderInput("phone", "Mobile No.", "09171234567", state.phone, "phone", { type: "tel", required: true })}
                          {renderInput("telephoneNo", "Telephone No.", "(02) 8123-4567", state.telephoneNo || "", "telephoneNo", { type: "tel", required: false })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                          {renderInput("email", "Email Address", "jane.doe@university.edu.ph", state.email, "email", { type: "email", required: true })}
                        </div>

                        {state.membershipType === "associate" && (
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
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ═══ STEP 2: Education & Job ═══════════════════════ */}
                {currentStepId === "education-job" && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><GraduationCap size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>
                          {state.membershipType === "institutional" ? "Academic Information" : state.membershipType === "associate" ? "Graduate Program Info" : "Employment & Education"}
                        </h2>
                        <p className="af-section-desc">
                          {state.membershipType === "institutional"
                            ? "Provide course offerings, faculty details, and enrollment count."
                            : state.membershipType === "associate"
                            ? "Provide details about your current graduate program."
                            : "Provide your professional background and academic credentials."}
                        </p>
                      </div>
                    </div>

                    {state.membershipType === "institutional" ? (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                          {/* Education course(s)/degree(s) offered */}
                          <div className="af-subsection" style={{ margin: 0 }}>
                            <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <GraduationCap size={16} style={{ color: "var(--af-navy)" }} />
                                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Education Courses Offered</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "ADD_EDUCATION_COURSE" })}
                                style={{ padding: "4px 8px", background: "var(--af-navy)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                              >
                                + Add Course
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(!state.educationCoursesOffered || state.educationCoursesOffered.length === 0) ? (
                                <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0 }}>No courses added.</p>
                              ) : (
                                state.educationCoursesOffered.map((course, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <input
                                      type="text"
                                      placeholder="e.g. BS in Elementary Education"
                                      value={course}
                                      onChange={(e) => dispatch({ type: "UPDATE_EDUCATION_COURSE", index: idx, value: e.target.value })}
                                      className="af-input"
                                      style={{ flex: 1, minHeight: "40px", fontSize: "14px", padding: "6px 10px" }}
                                    />
                                    {state.educationCoursesOffered!.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => dispatch({ type: "REMOVE_EDUCATION_COURSE", index: idx })}
                                        style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer" }}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                ))
                              )}
                              {errors.educationCoursesOffered && <span style={{ color: "var(--af-error)", fontSize: "12px" }}>{errors.educationCoursesOffered}</span>}
                            </div>
                          </div>

                          {/* Graduate courses offered */}
                          <div className="af-subsection" style={{ margin: 0 }}>
                            <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <GraduationCap size={16} style={{ color: "var(--af-navy)" }} />
                                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Graduate Courses Offered</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "ADD_GRADUATE_COURSE" })}
                                style={{ padding: "4px 8px", background: "var(--af-navy)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                              >
                                + Add Course
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(!state.graduateCoursesOffered || state.graduateCoursesOffered.length === 0) ? (
                                <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0 }}>No courses added.</p>
                              ) : (
                                state.graduateCoursesOffered.map((course, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <input
                                      type="text"
                                      placeholder="e.g. MA in Educational Management"
                                      value={course}
                                      onChange={(e) => dispatch({ type: "UPDATE_GRADUATE_COURSE", index: idx, value: e.target.value })}
                                      className="af-input"
                                      style={{ flex: 1, minHeight: "40px", fontSize: "14px", padding: "6px 10px" }}
                                    />
                                    {state.graduateCoursesOffered!.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => dispatch({ type: "REMOVE_GRADUATE_COURSE", index: idx })}
                                        style={{ border: "none", background: "none", color: "var(--af-error)", cursor: "pointer" }}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                ))
                              )}
                              {errors.graduateCoursesOffered && <span style={{ color: "var(--af-error)", fontSize: "12px" }}>{errors.graduateCoursesOffered}</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                          {renderInput("totalGraduateFaculty", "Total Graduate School Faculty", "e.g. 24", state.totalGraduateFaculty || "", "totalGraduateFaculty", { required: true })}
                          
                          <div className="af-field" style={{ marginBottom: "16px" }}>
                            <label htmlFor="currentEnrollmentCount" className="af-label" style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", display: "block" }}>
                              Current Enrollment Count *
                            </label>
                            <input
                              id="currentEnrollmentCount"
                              type="text"
                              placeholder="e.g. 150"
                              value={state.currentEnrollmentCount || ""}
                              onChange={(e) => setField("currentEnrollmentCount", e.target.value.replace(/\D/g, ""))}
                              className={`af-input ${errors.currentEnrollmentCount ? "af-input--error" : ""}`}
                              style={{ minHeight: "48px", fontSize: "16px", padding: "12px 16px", width: "100%", border: "1px solid var(--af-border)", borderRadius: "8px" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                              {errors.currentEnrollmentCount ? (
                                <span style={{ color: "var(--af-error)", fontSize: "14px" }}>{errors.currentEnrollmentCount}</span>
                              ) : <span />}
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--af-blue-mid)" }}>
                                Estimated fee: {getComputedFeeString().split(" (")[0]}
                              </span>
                            </div>
                          </div>

                          {renderInput("enrollmentYearRange", "Enrollment Year Range", "e.g. 2025-2026", state.enrollmentYearRange || "", "enrollmentYearRange", { required: true })}
                        </div>
                      </>
                    ) : state.membershipType === "life" || state.membershipType === "regular" ? (
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
                      </>
                    )}
                  </div>
                )}

                {/* ═══ STEP 3: Academic Information (Associate Specific) ═══ */}
                {currentStepId === "academic-info" && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><BookOpen size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Academic Information</h2>
                        <p className="af-section-desc">Provide details about your current academic status and research interests.</p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                      {renderInput("currentAcademicStatus", "Current Academic Status *", "e.g. Enrolled / Active Graduate Student", state.currentAcademicStatus || "", "currentAcademicStatus", { required: true })}
                      {renderInput("researchInterests", "Research Interests / Areas of Specialization", "e.g. Educational Technology, Curriculum Development", state.researchInterests || "", "researchInterests")}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 4: Experience ════════════════════════════ */}
                {currentStepId === "experience" && (
                  <div>
                    <div className="af-section-header" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><Briefcase size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>
                          {state.membershipType === "institutional" ? "Professional Affiliations" : "Experience & Publications"}
                        </h2>
                        <p className="af-section-desc">
                          {state.membershipType === "institutional"
                            ? "Record the institution's professional affiliations."
                            : "Record relevant professional and research credentials."}
                        </p>
                      </div>
                    </div>

                    {state.membershipType === "institutional" ? (
                      <div>
                        <div style={{ border: "1px solid var(--af-border-light)", padding: "16px 20px", borderRadius: "12px", background: "var(--af-cream)", marginBottom: "24px" }}>
                          <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0, fontWeight: 500 }}>
                            ℹ️ Individual professional experience is not applicable for Institutional memberships. Please record the institution's professional affiliations below.
                          </p>
                        </div>

                        <div className="af-subsection" style={{ marginBottom: "24px" }}>
                          <div className="af-subsection__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Users size={16} style={{ color: "var(--af-navy)" }} />
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)" }}>Recognized Associations (Past 5 Years) <span style={{ fontSize: "14px", color: "var(--af-text-muted)", fontWeight: 400 }}>(Optional)</span></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "ADD_AFFILIATION" })}
                              style={{ padding: "6px 12px", background: "var(--af-navy)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                            >
                              + Add Affiliation
                            </button>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(!state.professionalAffiliations || state.professionalAffiliations.length === 0) ? (
                              <p style={{ fontSize: "14px", color: "var(--af-text-muted)", margin: 0 }}>No affiliations added yet.</p>
                            ) : (
                              state.professionalAffiliations.map((affiliation, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    placeholder="Association Name, Membership Type / Officership details"
                                    value={affiliation}
                                    onChange={(e) => dispatch({ type: "UPDATE_AFFILIATION", index: idx, value: e.target.value })}
                                    className="af-input"
                                    style={{ flex: 1, minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => dispatch({ type: "REMOVE_AFFILIATION", index: idx })}
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
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 110px 40px", gap: "12px", alignItems: "center" }}>
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Role / Position (e.g. Professor)"
                                      value={row.role || ""}
                                      onChange={(e) => dispatch({ type: "UPDATE_TEACHING_EXP", index: idx, field: "role", value: e.target.value })}
                                      className="af-input"
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                  </div>
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
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 110px 40px", gap: "12px", alignItems: "center" }}>
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Role / Position (e.g. Dean)"
                                      value={row.role || ""}
                                      onChange={(e) => dispatch({ type: "UPDATE_ADMIN_EXP", index: idx, field: "role", value: e.target.value })}
                                      className="af-input"
                                      style={{ minHeight: "40px", fontSize: "15px", padding: "8px 12px" }}
                                    />
                                  </div>
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
                {currentStepId === "references" && (
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
                              <div style={{ display: "grid", gridTemplateColumns: idx === 0 ? "1fr 1fr" : "1fr", gap: "16px" }}>
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
                                {idx === 0 && (
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
                                )}
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
                {currentStepId === "review" && (
                  <div>
                    <div className="af-section-header screen-only" style={{ marginBottom: "32px" }}>
                      <div className="af-section-icon"><FileText size={20} /></div>
                      <div>
                        <h2 className="af-section-title" style={{ fontSize: "22px", fontWeight: 800 }}>Review & Submit</h2>
                        <p className="af-section-desc">Review your details carefully before submitting the application.</p>
                      </div>
                    </div>

                    {/* Review dossier summary — seal watermark in background */}
                    <div style={{ background: "var(--af-cream)", border: "1px solid var(--af-border-light)", borderRadius: "4px", padding: "32px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
                      {/* Wax-seal watermark — the signature motif's third controlled use */}
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.045, pointerEvents: "none", userSelect: "none" }}>
                        <PageSeal size={200} variant="full" />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--af-navy)", paddingBottom: "16px", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {(() => {
                            const photoDoc = state.documents["photo_1x1"];
                            const photoUrl = (photoDoc && !(photoDoc instanceof File)) ? photoDoc.url : undefined;
                            if ((state.membershipType === "life" || state.membershipType === "regular" || state.membershipType === "associate") && photoUrl) {
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
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>
                            {stepsList.findIndex((s: any) => s.id === "profile") + 1}. {state.membershipType === "institutional" ? "Institution Profile" : "Profile Details"}
                          </h4>
                          <button type="button" onClick={() => handleStepClick(stepsList.findIndex((s: any) => s.id === "profile") + 1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "institutional" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div style={{ gridColumn: "span 2" }}><strong>College / University Name:</strong> {state.collegeUniversityName}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Institution Address:</strong> {state.institutionAddress}</div>
                            <div><strong>Telephone No:</strong> {state.telMobileNo || "-"}</div>
                            <div><strong>Mobile No:</strong> {state.phone || "-"}</div>
                            <div><strong>Email Address:</strong> {state.emailAddress}</div>
                            <div><strong>President of College/University:</strong> {state.presidentName}</div>
                            <div><strong>Dean / Head of Graduate School:</strong> {state.deanHeadGraduateSchool}</div>
                          </div>
                        ) : state.membershipType === "life" || state.membershipType === "regular" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div><strong>Full Name:</strong> {state.name}</div>
                            <div><strong>Region:</strong> {state.region}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Home Address:</strong> {state.homeAddress}</div>
                            <div><strong>Mobile No:</strong> {state.telMobileNo || "-"}</div>
                            <div><strong>Telephone No:</strong> {state.telephoneNo || "-"}</div>
                            <div><strong>Email Address:</strong> {state.emailAddress}</div>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div><strong>Full Name:</strong> {state.fullName}</div>
                            <div><strong>Region:</strong> {state.region}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Home Address:</strong> {state.homeAddress}</div>
                            <div><strong>Mobile No:</strong> {state.phone || "-"}</div>
                            <div><strong>Telephone No:</strong> {state.telephoneNo || "-"}</div>
                            <div><strong>Email:</strong> {state.email}</div>
                          </div>
                        )}
                      </div>

                      {/* Education & Job / Academic Information review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>
                            {stepsList.findIndex((s: any) => s.id === "education-job") + 1}. {state.membershipType === "institutional" ? "Academic Information" : "Employment & Education"}
                          </h4>
                          <button type="button" onClick={() => handleStepClick(stepsList.findIndex((s: any) => s.id === "education-job") + 1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "institutional" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div>
                              <strong>Education Courses Offered:</strong>
                              <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                {state.educationCoursesOffered?.filter(c => c.trim() !== "").map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>Graduate Courses Offered:</strong>
                              <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                {state.graduateCoursesOffered?.filter(c => c.trim() !== "").map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                            <div><strong>Total Graduate School Faculty:</strong> {state.totalGraduateFaculty}</div>
                            <div><strong>Current Enrollment Count:</strong> {state.currentEnrollmentCount}</div>
                            <div><strong>Enrollment Year Range:</strong> {state.enrollmentYearRange}</div>
                          </div>
                        ) : state.membershipType === "life" || state.membershipType === "regular" ? (
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
                          </div>
                        )}
                      </div>

                      {/* Academic Info review (Associate only) */}
                      {state.membershipType === "associate" && stepsList.some((s: any) => s.id === "academic-info") && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>
                              {stepsList.findIndex((s: any) => s.id === "academic-info") + 1}. Academic Information
                            </h4>
                            <button type="button" onClick={() => handleStepClick(stepsList.findIndex((s: any) => s.id === "academic-info") + 1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px" }}>
                            <div><strong>Current Academic Status:</strong> {state.currentAcademicStatus}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Research Interests:</strong> {state.researchInterests}</div>
                          </div>
                        </div>
                      )}

                      {/* Experience & Affiliations review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>
                            {stepsList.findIndex((s: any) => s.id === "experience") + 1}. {state.membershipType === "institutional" ? "Professional Affiliations" : "Experience & Publications"}
                          </h4>
                          <button type="button" onClick={() => handleStepClick(stepsList.findIndex((s: any) => s.id === "experience") + 1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "institutional" ? (
                          <div style={{ fontSize: "15px" }}>
                            <strong>Professional Affiliations:</strong>
                            {state.professionalAffiliations && state.professionalAffiliations.filter(a => a.trim() !== "").length > 0 ? (
                              <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                {state.professionalAffiliations.filter(a => a.trim() !== "").map((a, idx) => (
                                  <li key={idx}>{a}</li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{ color: "var(--af-text-muted)", marginLeft: "8px" }}>None recorded</span>
                            )}
                          </div>
                        ) : state.membershipType === "life" || state.membershipType === "regular" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "15px" }}>
                            {state.membershipType === "life" && <div><strong>Years Active in PAGE:</strong> {state.yearsActiveInPAGE}</div>}
                            
                            {state.teachingExperience && state.teachingExperience.length > 0 && (
                              <div>
                                <strong>Teaching Experience:</strong>
                                <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                  {state.teachingExperience.map((t: any, idx: number) => (
                                    <li key={idx}>{t.role ? `${t.role} at ` : ''}{t.institution} ({t.fromYear} - {t.toYear})</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {state.administrativeExperience && state.administrativeExperience.length > 0 && (
                              <div>
                                <strong>Administrative Experience:</strong>
                                <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                                  {state.administrativeExperience.map((a: any, idx: number) => (
                                    <li key={idx}>{a.role ? `${a.role} at ` : ''}{a.institution} ({a.fromYear} - {a.toYear})</li>
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

                      {/* References & Documents review */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--af-border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--af-navy)", margin: 0 }}>
                            {stepsList.findIndex((s: any) => s.id === "references") + 1}. References &amp; Uploads
                          </h4>
                          <button type="button" onClick={() => handleStepClick(stepsList.findIndex((s: any) => s.id === "references") + 1)} style={{ color: "var(--af-blue-mid)", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Edit</button>
                        </div>
                        {state.membershipType === "life" || state.membershipType === "regular" || state.membershipType === "associate" || state.membershipType === "institutional" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "15px", marginBottom: "16px" }}>
                            {state.characterReferences?.map((r: any, idx: number) => (
                              <div key={idx}>
                                <strong>Character Reference #{idx + 1}:</strong> {r.name}{r.position ? ` (${r.position})` : ""}<br />
                                <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{r.address}</span>
                              </div>
                            ))}
                            <div style={{ gridColumn: "span 2" }}>
                              <strong>Regional Board Reference:</strong> {state.regionalChapterBoardReference?.name}<br />
                              <span style={{ fontSize: "13px", color: "var(--af-text-muted)" }}>{state.regionalChapterBoardReference?.address}</span>
                            </div>
                          </div>
                        ) : (
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
                    <div className="af-consent-box" style={{ marginTop: "32px", marginBottom: "40px" }}>
                      <label className="af-consent-label" style={{ cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => {
                            setConsentChecked(e.target.checked);
                            if (errors.consent) setErrors((p) => ({ ...p, consent: null }));
                          }}
                          className="af-consent-checkbox"
                        />
                        <span style={{ fontSize: "14.5px", lineHeight: 1.6, color: "var(--af-navy)" }}>
                          <strong>Certification &amp; Consent *</strong><br />
                          I certify that all information provided in this application is true and accurate to the best of my knowledge. I consent to the collection, use, and processing of my personal data by PAGE under Republic Act 10173 (Data Privacy Act of 2012) for membership registration and verification purposes.
                        </span>
                      </label>
                      {errors.consent && <span style={{ color: "var(--af-error)", fontSize: "13px", display: "block", marginTop: "8px", marginLeft: "32px", fontWeight: 600 }}>{errors.consent}</span>}
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

              {currentStep < stepsList.length ? (
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
                >
                  {isSubmitting ? "Submitting…" : "Submit Application for Membership"}
                </motion.button>
              )}
            </div>
          </form>
        </div>

        {/* Dynamic Change Type Confirmation Modal */}
        <AnimatePresence>
          {showChangeTypeConfirm && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChangeTypeConfirm(false)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(4px)",
                }}
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.3 }}
                style={{
                  position: "relative",
                  width: "90%",
                  maxWidth: "500px",
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  padding: "32px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  zIndex: 10001,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  {/* Warning Icon */}
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "28px",
                    background: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}>
                    <AlertTriangle size={28} style={{ color: "#d97706" }} />
                  </div>

                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--af-navy, #143152)", marginBottom: "12px" }}>
                    Discard Application Draft?
                  </h3>
                  
                  <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--af-text-muted, #64748b)", marginBottom: "28px" }}>
                    Are you sure you want to change your membership type? This will discard your current application draft and reset all fields. This action cannot be undone.
                  </p>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button
                      type="button"
                      onClick={() => setShowChangeTypeConfirm(false)}
                      style={{
                        flex: 1,
                        minHeight: "44px",
                        borderRadius: "8px",
                        border: "1px solid var(--af-border, #cbd5e1)",
                        background: "#fff",
                        color: "var(--af-navy, #143152)",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      Keep Draft
                    </button>
                    <button
                      type="button"
                      onClick={confirmChangeMembershipType}
                      style={{
                        flex: 1,
                        minHeight: "44px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#d97706",
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#b45309")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#d97706")}
                    >
                      Yes, Change Type
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
