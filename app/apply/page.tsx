"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle,
  CircleDollarSign,
  Clock3,
  FileCheck,
  FileText,
  GraduationCap,
  Landmark,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";

type AcademicHistoryEntry = {
  previousCollegeName: string;
  previousUniversityName: string;
  previousCourseName: string;
  previousCourseType: "10th" | "12th" | "bachelor" | "associate" | "diploma" | "master" | "";
};

type FirstPageData = {
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  email: string;
  collegeName: string;
  universityName: string;
  currentSemester: string;
  courseName: string;
  courseType: "bachelor" | "associate" | "diploma" | "master" | "";
  familyYearlyIncome: string;
  statementOfPurpose: string;
};

type SecondPageData = {
  aadhaarFile: File | null;
  marksheet10File: File | null;
  marksheet12File: File | null;
  officialFeeStructureFile: File | null;
  admissionFeeReceiptFile: File | null;
  offerAdmissionLetterFile: File | null;
  incomeCertificateFile: File | null;
  paidFeeReceiptFile: File | null;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  confirmIfsc: string;
  bonafideFile: File | null;
};

type SubmissionResult = {
  applicantEmail: string;
  applicantName: string;
  referenceId: string;
};

type UploadFieldKey =
  | "aadhaar"
  | "marksheet10"
  | "marksheet12"
  | "officialFeeStructure"
  | "admissionFeeReceipt"
  | "offerAdmissionLetter"
  | "incomeCertificate"
  | "paidFeeReceipt"
  | "bonafide";

const inputClass =
  "w-full rounded-2xl border border-[#EAEAF4] bg-[#F7F7FB] px-4 py-3 text-sm text-[#111111] shadow-sm outline-none transition placeholder:text-[#8E8AA8] focus:border-[#6D4CFF] focus:bg-white focus:ring-4 focus:ring-[#B9A7FF]/35";
const sectionClass =
  "rounded-[1.5rem] border border-[#EAEAF4] bg-white p-4 shadow-[0_24px_70px_-48px_rgba(61,44,141,0.35)] sm:rounded-[1.75rem] sm:p-6";
const fieldLabelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D2C8D]";
const fileAccept = ".jpeg,.jpg,.png,.pdf";
const maxFileBytes = 1 * 1024 * 1024;
const disclaimerText =
  "This is an independently managed private scholarship assistance initiative and is not affiliated with any government authority.";
const debugEmail = "debug-preview@zenesis.foundation";
const defaultAcademicHistoryEntry: AcademicHistoryEntry = {
  previousCollegeName: "",
  previousUniversityName: "",
  previousCourseName: "",
  previousCourseType: "",
};

const defaultFirstPage: FirstPageData = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  collegeName: "",
  universityName: "",
  currentSemester: "",
  courseName: "",
  courseType: "",
  familyYearlyIncome: "",
  statementOfPurpose: "",
};

const defaultSecondPage: SecondPageData = {
  aadhaarFile: null,
  marksheet10File: null,
  marksheet12File: null,
  officialFeeStructureFile: null,
  admissionFeeReceiptFile: null,
  offerAdmissionLetterFile: null,
  incomeCertificateFile: null,
  paidFeeReceiptFile: null,
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
  confirmIfsc: "",
  bonafideFile: null,
};

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-2xl bg-[#B9A7FF]/30 p-2 text-[#3D2C8D]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-[#111111]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#5B5680]">{description}</p> : null}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={fieldLabelClass}>{children}</label>;
}

function FileName({ file }: { file: File | null }) {
  if (!file) {
    return <p className="text-xs text-[#7C7894]">No file selected yet</p>;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-[#3D2C8D]">
      <CheckCircle className="h-4 w-4 text-[#73D7FF]" />
      <span className="truncate font-medium">{file.name}</span>
      <span className="text-[#8E8AA8]">({(file.size / 1024).toFixed(0)} KB)</span>
    </div>
  );
}

function FileUploadField({
  label,
  file,
  onChange,
  required = true,
}: {
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const tooLarge = file ? file.size > maxFileBytes : false;

  return (
    <label className="block">
      <span className={fieldLabelClass}>{label}</span>
      <div
        className={`rounded-2xl border border-dashed px-4 py-4 transition ${
          tooLarge
            ? "border-red-300 bg-red-50"
            : file
              ? "border-[#73D7FF] bg-[#73D7FF]/10"
              : "border-[#B9A7FF] bg-[#F7F7FB] hover:border-[#6D4CFF] hover:bg-[#B9A7FF]/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-[#6D4CFF] shadow-sm">
            <Upload className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#111111]">Choose a file</p>
            <p className="mt-1 text-xs text-[#6A6684]">Accepted formats: JPG, PNG, PDF. Max size 1 MB.</p>
            <div className="mt-3">
              <FileName file={file} />
            </div>
            {tooLarge ? (
              <p className="mt-2 text-xs font-medium text-red-600">This file is above the 1 MB limit.</p>
            ) : null}
          </div>
        </div>
        <input
          type="file"
          accept={fileAccept}
          onChange={onChange}
          className="mt-4 block w-full text-xs text-[#5B5680] file:mr-3 file:rounded-xl file:border-0 file:bg-[#6D4CFF] file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3D2C8D]"
          required={required}
        />
      </div>
    </label>
  );
}

function StepChip({
  number,
  title,
  active,
  complete,
}: {
  number: number;
  title: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
        active
          ? "border-[#6D4CFF] bg-[#6D4CFF] text-white"
          : complete
            ? "border-[#73D7FF] bg-[#73D7FF]/12 text-[#3D2C8D]"
            : "border-[#EAEAF4] bg-white text-[#5B5680]"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          active ? "bg-white/15 text-white" : complete ? "bg-[#73D7FF] text-[#111111]" : "bg-[#F7F7FB] text-[#3D2C8D]"
        }`}
      >
        {complete ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">Step {number}</p>
        <p className="text-sm font-semibold">{title}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#EAEAF4]">
      <div
        className="h-full rounded-full bg-[linear-gradient(135deg,#3D2C8D_0%,#6D4CFF_50%,#B9A7FF_100%)] transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-[#6A6684]">{label}</span>
      <span className="text-right font-medium text-[#111111]">{value}</span>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPage, setFirstPage] = useState<FirstPageData>(defaultFirstPage);
  const [academicHistoryEntries, setAcademicHistoryEntries] = useState<AcademicHistoryEntry[]>([
    defaultAcademicHistoryEntry,
  ]);
  const [accountMatch, setAccountMatch] = useState<"idle" | "valid" | "invalid">("idle");
  const [ifscMatch, setIfscMatch] = useState<"idle" | "valid" | "invalid">("idle");
  const [secondPage, setSecondPage] = useState<SecondPageData>(defaultSecondPage);
  const [firstPageSaved, setFirstPageSaved] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [debugMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get("debug") === "1";
  });
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const applicantName = useMemo(() => {
    return [firstPage.firstName, firstPage.middleName, firstPage.lastName].filter(Boolean).join(" ");
  }, [firstPage.firstName, firstPage.middleName, firstPage.lastName]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 3500);
  };

  const resetApplicationForm = () => {
    setStep(1);
    setFirstPage(defaultFirstPage);
    setAcademicHistoryEntries([{ ...defaultAcademicHistoryEntry }]);
    setSecondPage(defaultSecondPage);
    setFirstPageSaved(false);
    setAccountMatch("idle");
    setIfscMatch("idle");
    setSubmitMessage("");
  };

  const createClientReferenceId = (prefix: string) => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `${prefix}-${year}${month}${day}-${random}`;
  };

  const showDebugSuccess = () => {
    setSubmissionResult({
      applicantEmail: firstPage.email || debugEmail,
      applicantName: applicantName || "Debug Preview",
      referenceId: createClientReferenceId("ZEN-DEBUG"),
    });
    resetApplicationForm();
    setSubmitMessage("Application sent successfully.");
    showToast("Debug preview: success state opened without sending email.");
  };

  const handleFirstChange =
    (field: keyof FirstPageData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFirstPage((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleAcademicHistoryChange =
    (index: number, field: keyof AcademicHistoryEntry) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAcademicHistoryEntries((prev) =>
        prev.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, [field]: event.target.value } : entry,
        ),
      );
    };

  const addAcademicHistoryEntry = () => {
    setAcademicHistoryEntries((prev) => [...prev, { ...defaultAcademicHistoryEntry }]);
  };

  const removeAcademicHistoryEntry = (index: number) => {
    setAcademicHistoryEntries((prev) => prev.filter((_, entryIndex) => entryIndex !== index));
  };

  const handleSecondChange =
    (
      field: keyof Omit<
        SecondPageData,
        | "aadhaarFile"
        | "marksheet10File"
        | "marksheet12File"
        | "officialFeeStructureFile"
        | "admissionFeeReceiptFile"
        | "offerAdmissionLetterFile"
        | "incomeCertificateFile"
        | "paidFeeReceiptFile"
        | "bonafideFile"
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setSecondPage((prev) => ({ ...prev, [field]: value }));

      if (field === "accountNumber" || field === "confirmAccountNumber") {
        setAccountMatch("idle");
      }

      if (field === "ifsc" || field === "confirmIfsc") {
        setIfscMatch("idle");
      }
    };

  const handleFileChange =
    (
      field: keyof Pick<
        SecondPageData,
        | "aadhaarFile"
        | "marksheet10File"
        | "marksheet12File"
        | "officialFeeStructureFile"
        | "admissionFeeReceiptFile"
        | "offerAdmissionLetterFile"
        | "incomeCertificateFile"
        | "paidFeeReceiptFile"
        | "bonafideFile"
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      setSecondPage((prev) => ({ ...prev, [field]: nextFile }));
    };

  const firstPageCompletion = useMemo(() => {
    const requiredValues = [
      firstPage.firstName,
      firstPage.lastName,
      firstPage.phone,
      firstPage.email,
      firstPage.collegeName,
      firstPage.universityName,
      firstPage.currentSemester,
      firstPage.courseName,
      firstPage.courseType,
      firstPage.familyYearlyIncome,
      firstPage.statementOfPurpose,
    ];

    const completedRequired = requiredValues.filter((value) => String(value).trim().length > 0).length;
    const academicCompleted = academicHistoryEntries.filter(
      (entry) =>
        entry.previousCollegeName.trim() &&
        entry.previousUniversityName.trim() &&
        entry.previousCourseType.trim(),
    ).length;

    const total = requiredValues.length + academicHistoryEntries.length;
    const complete = completedRequired + academicCompleted;

    return Math.round((complete / total) * 100);
  }, [academicHistoryEntries, firstPage]);

  const documentCompletion = useMemo(() => {
    const checks = [
      secondPage.aadhaarFile,
      secondPage.marksheet10File,
      secondPage.marksheet12File,
      secondPage.officialFeeStructureFile,
      secondPage.admissionFeeReceiptFile,
      secondPage.offerAdmissionLetterFile,
      secondPage.incomeCertificateFile,
      secondPage.accountNumber,
      secondPage.confirmAccountNumber,
      secondPage.ifsc,
      secondPage.confirmIfsc,
    ];

    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [secondPage]);

  const documentChecklist = useMemo(
    () => [
      { label: "Aadhaar uploaded", done: Boolean(secondPage.aadhaarFile) },
      { label: "10th marksheet uploaded", done: Boolean(secondPage.marksheet10File) },
      { label: "12th marksheet uploaded", done: Boolean(secondPage.marksheet12File) },
      { label: "Official fee structure uploaded", done: Boolean(secondPage.officialFeeStructureFile) },
      { label: "Admission fee receipt uploaded", done: Boolean(secondPage.admissionFeeReceiptFile) },
      { label: "Offer or admission letter uploaded", done: Boolean(secondPage.offerAdmissionLetterFile) },
      { label: "Income certificate uploaded", done: Boolean(secondPage.incomeCertificateFile) },
      { label: "Paid fee receipt uploaded", done: Boolean(secondPage.paidFeeReceiptFile) },
      { label: "Bonafide certificate uploaded (optional)", done: Boolean(secondPage.bonafideFile) },
    ],
    [secondPage],
  );

  const saveAndContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFirstPageSaved(true);
    setStep(2);
    setSubmitMessage("");
    showToast(debugMode ? "Debug mode: moved to step 2 without validation." : "Page 1 saved. You can now upload documents.");
  };

  const validateAccountMatch = () => {
    const account = secondPage.accountNumber.trim();
    const confirm = secondPage.confirmAccountNumber.trim();

    if (!confirm) {
      setAccountMatch("idle");
      return;
    }

    const matches = account === confirm;
    setAccountMatch(matches ? "valid" : "invalid");

    if (!matches) {
      showToast("Account number and confirm account number do not match.");
    }
  };

  const validateIfscMatch = () => {
    const ifsc = secondPage.ifsc.trim().toUpperCase();
    const confirm = secondPage.confirmIfsc.trim().toUpperCase();

    if (!confirm) {
      setIfscMatch("idle");
      return;
    }

    const matches = ifsc === confirm;
    setIfscMatch(matches ? "valid" : "invalid");

    if (!matches) {
      showToast("IFSC and confirm IFSC do not match.");
    }
  };

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");

    if (debugMode) {
      showDebugSuccess();
      return;
    }

    const filesToCheck: Array<{ file: File | null }> = [
      { file: secondPage.aadhaarFile },
      { file: secondPage.marksheet10File },
      { file: secondPage.marksheet12File },
      { file: secondPage.officialFeeStructureFile },
      { file: secondPage.admissionFeeReceiptFile },
      { file: secondPage.offerAdmissionLetterFile },
      { file: secondPage.incomeCertificateFile },
      { file: secondPage.paidFeeReceiptFile },
      { file: secondPage.bonafideFile },
    ];

    for (const entry of filesToCheck) {
      if (entry.file && entry.file.size > maxFileBytes) {
        const message = `${entry.file.name} exceeds 1 MB limit.`;
        setSubmitMessage(message);
        showToast(message);
        return;
      }
    }

    if (secondPage.accountNumber !== secondPage.confirmAccountNumber) {
      const message = "Account number and confirm account number do not match.";
      setSubmitMessage(message);
      showToast(message);
      return;
    }

    if (secondPage.ifsc.toUpperCase() !== secondPage.confirmIfsc.toUpperCase()) {
      const message = "IFSC and confirm IFSC do not match.";
      setSubmitMessage(message);
      showToast(message);
      return;
    }

    void (async () => {
      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("firstPage", JSON.stringify(firstPage));
        formData.append("academicHistoryEntries", JSON.stringify(academicHistoryEntries));
        formData.append(
          "secondPage",
          JSON.stringify({
            accountNumber: secondPage.accountNumber,
            ifsc: secondPage.ifsc,
          }),
        );

        const uploadEntries: Array<[UploadFieldKey, File | null]> = [
          ["aadhaar", secondPage.aadhaarFile],
          ["marksheet10", secondPage.marksheet10File],
          ["marksheet12", secondPage.marksheet12File],
          ["officialFeeStructure", secondPage.officialFeeStructureFile],
          ["admissionFeeReceipt", secondPage.admissionFeeReceiptFile],
          ["offerAdmissionLetter", secondPage.offerAdmissionLetterFile],
          ["incomeCertificate", secondPage.incomeCertificateFile],
          ["paidFeeReceipt", secondPage.paidFeeReceiptFile],
          ["bonafide", secondPage.bonafideFile],
        ];

        for (const [key, file] of uploadEntries) {
          if (file) {
            formData.append(key, file, file.name);
          }
        }

        const response = await fetch("/api/submit", {
          method: "POST",
          body: formData,
        });

        const responseText = await response.text();
        let data: { ok?: boolean; referenceId?: string; error?: string } = {};

        try {
          data = JSON.parse(responseText) as { ok?: boolean; referenceId?: string; error?: string };
        } catch {
          throw new Error(
            responseText || "The server returned an invalid response while submitting the application.",
          );
        }

        if (data.ok && data.referenceId) {
          const message = "Application sent successfully.";
          setSubmissionResult({
            applicantEmail: firstPage.email,
            applicantName: applicantName || "Applicant",
            referenceId: data.referenceId,
          });
          resetApplicationForm();
          setSubmitMessage(message);
          showToast(message);
          return;
        }

        const message = data.error || "Failed to send application.";
        setSubmitMessage(message);
        showToast(message);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error sending application";
        setSubmitMessage(message);
        showToast(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const currentProgress = step === 1 ? firstPageCompletion : documentCompletion;
  const overallProgress = submissionResult ? 100 : currentProgress;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#F7F7FB_28%,#efeafd_62%,#EAEAF4_100%)] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <main className="mx-auto max-w-7xl">
        <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(61,44,141,0.98),rgba(109,76,255,0.95)_52%,rgba(185,167,255,0.92))] text-white shadow-[0_40px_120px_-52px_rgba(61,44,141,0.75)] sm:mb-6 sm:rounded-[2rem]">
          <div className="grid gap-5 px-4 py-5 sm:px-8 sm:py-7 lg:grid-cols-[1.45fr_0.9fr] lg:px-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F7F7FB]">
                <Sparkles className="h-3.5 w-3.5" />
                Scholarship Portal
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
                  Zenesis Foundation Scholarship Assistance Application
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-[#ECE9FF] sm:text-base">
                  Submit your application details and supporting documents for scholarship assistance review. Please complete both steps carefully and ensure all uploaded documents are clear, valid, and within the required file size limit.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6E0FF]">Time needed</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Clock3 className="h-4 w-4 text-[#73D7FF]" />
                    8 to 12 minutes
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6E0FF]">Upload rules</p>
                  <p className="mt-2 text-sm font-medium text-white">JPG, PNG, or PDF up to 1 MB each</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6E0FF]">Current progress</p>
                  <p className="mt-2 text-sm font-medium text-white">{overallProgress}% complete</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6E0FF]">Application journey</p>
              <div className="mt-4 space-y-3">
                <StepChip
                  number={1}
                  title="Applicant information"
                  active={!submissionResult && step === 1}
                  complete={firstPageSaved || Boolean(submissionResult)}
                />
                <StepChip
                  number={2}
                  title="Documents and bank details"
                  active={!submissionResult && step === 2}
                  complete={Boolean(submissionResult)}
                />
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#E6E0FF]">
                  <span>Overall progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <ProgressBar value={overallProgress} />
              </div>
            </div>
          </div>
        </div>

        {debugMode ? (
          <div className="mb-5 rounded-[1.25rem] border border-[#73D7FF]/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(115,215,255,0.12))] px-4 py-4 shadow-[0_16px_40px_-28px_rgba(61,44,141,0.22)] sm:mb-6 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D2C8D]">Debug mode active</p>
                <p className="mt-1 text-sm leading-6 text-[#5B5680]">
                  Use `?debug=1` in the URL to preview every step without filling the form or sending real emails.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setStep(1);
                    setFirstPageSaved(false);
                    setSubmitMessage("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D8D3F4] px-4 py-2 text-sm font-semibold text-[#3D2C8D] transition hover:border-[#6D4CFF] hover:bg-white"
                >
                  Open step 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setFirstPageSaved(true);
                    setStep(2);
                    setSubmitMessage("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D8D3F4] px-4 py-2 text-sm font-semibold text-[#3D2C8D] transition hover:border-[#6D4CFF] hover:bg-white"
                >
                  Open step 2
                </button>
                <button
                  type="button"
                  onClick={showDebugSuccess}
                  className="inline-flex items-center justify-center rounded-xl bg-[#6D4CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D2C8D]"
                >
                  Preview thank-you
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-5 rounded-[1.25rem] border border-[#B9A7FF]/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(185,167,255,0.12))] px-4 py-4 shadow-[0_16px_40px_-28px_rgba(61,44,141,0.28)] sm:mb-6 sm:rounded-[1.5rem] sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4CFF]">Disclaimer</p>
          <p className="mt-2 text-sm leading-6 text-[#5B5680]">{disclaimerText}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-5">
            {submissionResult ? (
              <section className="rounded-[1.5rem] border border-[#EAEAF4] bg-white p-5 shadow-[0_24px_70px_-48px_rgba(61,44,141,0.35)] sm:rounded-[2rem] sm:p-8">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D2C8D_0%,#6D4CFF_55%,#B9A7FF_100%)] text-white shadow-[0_20px_40px_-20px_rgba(61,44,141,0.6)]">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4CFF]">
                    Application received
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">
                    Thank you, {submissionResult.applicantName}.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[#5B5680]">
                    Your scholarship application has been submitted successfully. We also sent a confirmation email to{" "}
                    <span className="font-semibold text-[#3D2C8D]">{submissionResult.applicantEmail}</span>.
                  </p>

                  <div className="mt-8 rounded-[1.75rem] border border-[#B9A7FF]/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(185,167,255,0.18))] px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D2C8D]">
                      Application reference ID
                    </p>
                    <p className="mt-3 break-all text-xl font-semibold tracking-[0.08em] text-[#111111] sm:text-2xl">
                      {submissionResult.referenceId}
                    </p>
                    <p className="mt-3 text-sm text-[#5B5680]">
                      Keep this reference ID for follow-up, verification, or status checks.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#EAEAF4] bg-[#F7F7FB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D4CFF]">Step 1</p>
                      <p className="mt-2 text-sm text-[#3D2C8D]">The review team has received your details and documents.</p>
                    </div>
                    <div className="rounded-2xl border border-[#EAEAF4] bg-[#F7F7FB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D4CFF]">Step 2</p>
                      <p className="mt-2 text-sm text-[#3D2C8D]">If anything is missing, they will contact you using your submitted email or phone.</p>
                    </div>
                    <div className="rounded-2xl border border-[#EAEAF4] bg-[#F7F7FB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D4CFF]">Step 3</p>
                      <p className="mt-2 text-sm text-[#3D2C8D]">Verified applications move ahead to the next review stage.</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionResult(null);
                        setSubmitMessage("");
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#6D4CFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3D2C8D]"
                    >
                      Start a new application
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-6 text-sm leading-6 text-[#6A6684]">{disclaimerText}</p>
                </div>
              </section>
            ) : step === 1 ? (
              <form onSubmit={saveAndContinue} noValidate={debugMode} className="space-y-5">
                <section className={sectionClass}>
                  <SectionTitle
                    icon={UserRound}
                    title="Full name"
                    description="Enter the applicant name exactly as it appears on official records."
                  />
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <FieldLabel>First name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.firstName}
                        onChange={handleFirstChange("firstName")}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Middle name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.middleName}
                        onChange={handleFirstChange("middleName")}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <FieldLabel>Last name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.lastName}
                        onChange={handleFirstChange("lastName")}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={Phone}
                    title="Contact details"
                    description="Use an email address and mobile number you actively check."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Phone number</FieldLabel>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                        <input
                          className={`${inputClass} pl-11`}
                          value={firstPage.phone}
                          onChange={handleFirstChange("phone")}
                          placeholder="10-digit phone number"
                          inputMode="tel"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Email ID</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                        <input
                          type="email"
                          className={`${inputClass} pl-11`}
                          value={firstPage.email}
                          onChange={handleFirstChange("email")}
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={GraduationCap}
                    title="Current college and course"
                    description="These details should match your current admission records."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>College name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.collegeName}
                        onChange={handleFirstChange("collegeName")}
                        placeholder="Current college name"
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>University name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.universityName}
                        onChange={handleFirstChange("universityName")}
                        placeholder="Affiliated university"
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Current semester</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.currentSemester}
                        onChange={handleFirstChange("currentSemester")}
                        placeholder="Example: Semester 4"
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Course name</FieldLabel>
                      <input
                        className={inputClass}
                        value={firstPage.courseName}
                        onChange={handleFirstChange("courseName")}
                        placeholder="Example: B.Sc Computer Science"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel>Course type</FieldLabel>
                      <select
                        className={inputClass}
                        value={firstPage.courseType}
                        onChange={handleFirstChange("courseType")}
                        required
                      >
                        <option value="">Select course type</option>
                        <option value="bachelor">Bachelor</option>
                        <option value="associate">Associate</option>
                        <option value="diploma">Diploma</option>
                        <option value="master">Master</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={BookOpen}
                    title="Academic history"
                    description="Add completed studies such as 10th, 12th, diploma, or earlier degrees."
                  />
                  <div className="mb-5 flex flex-col items-start gap-3 rounded-2xl border border-[#B9A7FF]/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(185,167,255,0.15))] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#3D2C8D]">
                      Add one card per completed qualification. You can include school-level and higher-education records here.
                    </p>
                    <button
                      type="button"
                      onClick={addAcademicHistoryEntry}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#6D4CFF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3D2C8D]"
                    >
                      <Plus className="h-4 w-4" />
                      Add entry
                    </button>
                  </div>

                  <div className="space-y-4">
                    {academicHistoryEntries.map((entry, index) => (
                      <div key={index} className="rounded-2xl border border-[#EAEAF4] bg-[linear-gradient(180deg,#ffffff_0%,rgba(185,167,255,0.08)_100%)] p-4 sm:p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D4CFF]">
                              Academic entry {index + 1}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#3D2C8D]">
                              Add institution, board or university, and qualification type.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAcademicHistoryEntry(index)}
                            disabled={academicHistoryEntries.length === 1}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                              academicHistoryEntries.length === 1
                                ? "cursor-not-allowed border-[#EAEAF4] bg-[#F7F7FB] text-[#AAA6BF]"
                                : "border-[#D8D3F4] bg-white text-[#5B5680] hover:border-[#6D4CFF] hover:text-[#3D2C8D]"
                            }`}
                            aria-label={`Remove academic entry ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <FieldLabel>Institution or school name</FieldLabel>
                            <input
                              className={inputClass}
                              value={entry.previousCollegeName}
                              onChange={handleAcademicHistoryChange(index, "previousCollegeName")}
                              placeholder="Institution name"
                              required
                            />
                          </div>
                          <div>
                            <FieldLabel>Board or university</FieldLabel>
                            <input
                              className={inputClass}
                              value={entry.previousUniversityName}
                              onChange={handleAcademicHistoryChange(index, "previousUniversityName")}
                              placeholder="Board or university name"
                              required
                            />
                          </div>
                          <div>
                            <FieldLabel>Course or stream</FieldLabel>
                            <input
                              className={inputClass}
                              value={entry.previousCourseName}
                              onChange={handleAcademicHistoryChange(index, "previousCourseName")}
                              placeholder="Optional for 10th"
                            />
                          </div>
                          <div>
                            <FieldLabel>Completed study type</FieldLabel>
                            <select
                              className={inputClass}
                              value={entry.previousCourseType}
                              onChange={handleAcademicHistoryChange(index, "previousCourseType")}
                              required
                            >
                              <option value="">Select completed study type</option>
                              <option value="10th">10th</option>
                              <option value="12th">12th</option>
                              <option value="bachelor">Bachelor</option>
                              <option value="associate">Associate</option>
                              <option value="diploma">Diploma</option>
                              <option value="master">Master</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={CircleDollarSign}
                    title="Family income details"
                    description="Use the latest yearly household income value available on official records."
                  />
                  <div>
                    <FieldLabel>Family yearly income</FieldLabel>
                    <input
                      className={inputClass}
                      type="text"
                      inputMode="numeric"
                      value={firstPage.familyYearlyIncome}
                      onChange={handleFirstChange("familyYearlyIncome")}
                      placeholder="Enter annual family income"
                      required
                    />
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={FileText}
                    title="Statement of purpose"
                    description="Briefly explain your need, goals, and how the scholarship will support your education."
                  />
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <FieldLabel>Why are you applying?</FieldLabel>
                      <span className="text-xs text-[#6A6684]">{firstPage.statementOfPurpose.length} characters</span>
                    </div>
                    <textarea
                      className={`${inputClass} min-h-40 resize-y`}
                      value={firstPage.statementOfPurpose}
                      onChange={handleFirstChange("statementOfPurpose")}
                      placeholder="Describe your financial need, academic goals, and why this scholarship matters to you."
                      required
                    />
                  </div>
                </section>

                <div className="sticky bottom-3 z-20 flex flex-col items-stretch gap-3 rounded-[1.5rem] border border-[#EAEAF4] bg-white/95 p-4 shadow-[0_24px_60px_-38px_rgba(61,44,141,0.28)] backdrop-blur sm:bottom-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-[1.75rem]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D4CFF]">Ready to continue</p>
                    <p className="mt-1 text-sm text-[#5B5680]">
                      Applicant: <span className="font-semibold text-[#111111]">{applicantName || "Not entered yet"}</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6D4CFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3D2C8D] sm:w-auto"
                  >
                    Save page 1 and continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitApplication} noValidate={debugMode} className="space-y-5">
                <section className={sectionClass}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <SectionTitle
                        icon={ShieldCheck}
                        title="Required documents"
                        description="Upload clear and readable files. Large files often fail, so keeping them under 1 MB helps avoid errors."
                      />
                    </div>
                    <div className="rounded-2xl border border-[#B9A7FF]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(185,167,255,0.15))] px-4 py-3 text-sm text-[#3D2C8D]">
                      All uploads must be JPG, PNG, or PDF and stay within 1 MB.
                    </div>
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={ShieldCheck}
                    title="Aadhaar card"
                    description="Upload a clear Aadhaar document for identity verification."
                  />
                  <div className="grid gap-4">
                    <FileUploadField
                      label="Upload Aadhaar"
                      file={secondPage.aadhaarFile}
                      onChange={handleFileChange("aadhaarFile")}
                    />
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={FileCheck}
                    title="10th and 12th marksheets"
                    description="Upload the final marksheets for both school levels."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FileUploadField
                      label="10th marksheet"
                      file={secondPage.marksheet10File}
                      onChange={handleFileChange("marksheet10File")}
                    />
                    <FileUploadField
                      label="12th marksheet"
                      file={secondPage.marksheet12File}
                      onChange={handleFileChange("marksheet12File")}
                    />
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={Building2}
                    title="College admission and fees"
                    description="Upload the official fee and admission documents provided by the college."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FileUploadField
                      label="Official fee structure"
                      file={secondPage.officialFeeStructureFile}
                      onChange={handleFileChange("officialFeeStructureFile")}
                    />
                    <FileUploadField
                      label="Admission fee receipt"
                      file={secondPage.admissionFeeReceiptFile}
                      onChange={handleFileChange("admissionFeeReceiptFile")}
                    />
                    <FileUploadField
                      label="Offer or admission letter"
                      file={secondPage.offerAdmissionLetterFile}
                      onChange={handleFileChange("offerAdmissionLetterFile")}
                    />
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={CircleDollarSign}
                    title="Paid fee receipt"
                    description="If the student has already paid part of the fees, upload the online payment receipt."
                  />
                  <div className="grid gap-4">
                    <FileUploadField
                      label="Online payment receipt"
                      file={secondPage.paidFeeReceiptFile}
                      onChange={handleFileChange("paidFeeReceiptFile")}
                      required={false}
                    />
                    <p className="text-sm text-[#5B5680]">
                      This is optional and only needed if any fee payment has already been made.
                    </p>
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={FileText}
                    title="Income certificate"
                    description="Upload the supporting income certificate document."
                  />
                  <div className="grid gap-4">
                    <FileUploadField
                      label="Upload income certificate"
                      file={secondPage.incomeCertificateFile}
                      onChange={handleFileChange("incomeCertificateFile")}
                    />
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={Landmark}
                    title="Bank details"
                    description="Double-check account number and IFSC carefully before submission."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Account number</FieldLabel>
                      <input
                        className={inputClass}
                        type="password"
                        value={secondPage.accountNumber}
                        onChange={handleSecondChange("accountNumber")}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                    <div className="relative">
                      <FieldLabel>Confirm account number</FieldLabel>
                      <input
                        className={`${inputClass} pr-11`}
                        value={secondPage.confirmAccountNumber}
                        onChange={handleSecondChange("confirmAccountNumber")}
                        onBlur={validateAccountMatch}
                        placeholder="Re-enter account number"
                        required
                      />
                      {accountMatch === "valid" ? (
                        <CheckCircle className="absolute right-4 top-[2.85rem] h-5 w-5 text-[#73D7FF]" />
                      ) : null}
                      {accountMatch === "invalid" ? (
                        <X className="absolute right-4 top-[2.95rem] h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                    {accountMatch === "invalid" ? (
                      <p className="md:col-span-2 text-sm text-red-600">
                        Account number and confirm account number do not match.
                      </p>
                    ) : null}

                    <div>
                      <FieldLabel>IFSC</FieldLabel>
                      <input
                        className={`${inputClass} uppercase`}
                        type="password"
                        value={secondPage.ifsc}
                        onChange={handleSecondChange("ifsc")}
                        placeholder="Enter IFSC"
                        required
                      />
                    </div>
                    <div className="relative">
                      <FieldLabel>Confirm IFSC</FieldLabel>
                      <input
                        className={`${inputClass} pr-11 uppercase`}
                        value={secondPage.confirmIfsc}
                        onChange={handleSecondChange("confirmIfsc")}
                        onBlur={() => {
                          setSecondPage((prev) => ({ ...prev, confirmIfsc: prev.confirmIfsc.toUpperCase() }));
                          validateIfscMatch();
                        }}
                        placeholder="Re-enter IFSC"
                        required
                      />
                      {ifscMatch === "valid" ? (
                        <CheckCircle className="absolute right-4 top-[2.85rem] h-5 w-5 text-emerald-600" />
                      ) : null}
                      {ifscMatch === "invalid" ? (
                        <X className="absolute right-4 top-[2.95rem] h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                    {ifscMatch === "invalid" ? (
                      <p className="md:col-span-2 text-sm text-red-600">IFSC and confirm IFSC do not match.</p>
                    ) : null}
                  </div>
                </section>

                <section className={sectionClass}>
                  <SectionTitle
                    icon={Upload}
                    title="Bonafide certificate (optional)"
                    description="Upload the latest bonafide certificate issued by the institution."
                  />
                  <FileUploadField
                    label="Upload bonafide certificate"
                    file={secondPage.bonafideFile}
                    onChange={handleFileChange("bonafideFile")}
                    required={false}
                  />
                </section>

                <div className="sticky bottom-3 z-20 flex flex-col-reverse items-stretch gap-3 rounded-[1.5rem] border border-[#EAEAF4] bg-white/95 p-4 shadow-[0_24px_60px_-38px_rgba(61,44,141,0.28)] backdrop-blur sm:bottom-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-[1.75rem]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D8D3F4] px-5 py-3 text-sm font-semibold text-[#3D2C8D] transition hover:border-[#6D4CFF] hover:bg-[#B9A7FF]/10 sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to page 1
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6D4CFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3D2C8D] disabled:cursor-wait disabled:bg-[#B9A7FF] sm:w-auto"
                  >
                    {isSubmitting ? "Submitting application..." : "Submit application"}
                    {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                </div>

                {submitMessage ? (
                  <p className="rounded-2xl border border-[#EAEAF4] bg-[#F7F7FB] px-4 py-3 text-sm text-[#111111]">
                    {submitMessage}
                  </p>
                ) : null}
              </form>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-[1.75rem] border border-[#EAEAF4] bg-white p-5 shadow-[0_24px_70px_-48px_rgba(61,44,141,0.26)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4CFF]">
                {submissionResult ? "Submission summary" : "Application summary"}
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-[#111111]">
                    {submissionResult ? submissionResult.applicantName : applicantName || "Your name will appear here"}
                  </p>
                  <p className="mt-1 text-sm text-[#6A6684]">
                    {submissionResult
                      ? `Reference ID: ${submissionResult.referenceId}`
                      : `${firstPage.courseName || "Course not added yet"}${firstPage.collegeName ? ` at ${firstPage.collegeName}` : ""}`}
                  </p>
                </div>
                <ProgressBar value={overallProgress} />
                <p className="text-sm text-[#5B5680]">
                  {submissionResult
                    ? "Your form has been reset and a confirmation email has been sent. Save your reference ID for future follow-up."
                    : step === 1
                    ? "Finish your personal, academic, and income details to unlock document submission."
                    : "You are on the final step. Review uploads and bank details before sending the application."}
                </p>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[#EAEAF4] bg-white p-5 shadow-[0_24px_70px_-48px_rgba(61,44,141,0.26)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4CFF]">
                {submissionResult ? "What happened next" : step === 1 ? "Step 1 checklist" : "Document checklist"}
              </p>
              <div className="mt-4 space-y-3">
                {submissionResult ? (
                  <>
                    <SummaryRow label="Application status" value="Submitted" />
                    <SummaryRow label="Reference ID" value={submissionResult.referenceId} />
                    <SummaryRow label="Confirmation email" value="Sent" />
                  </>
                ) : step === 1 ? (
                  <>
                    <SummaryRow label="Applicant name" value={applicantName ? "Added" : "Pending"} />
                    <SummaryRow label="Contact details" value={firstPage.phone && firstPage.email ? "Added" : "Pending"} />
                    <SummaryRow label="Current course" value={firstPage.courseName && firstPage.courseType ? "Added" : "Pending"} />
                    <SummaryRow label="Academic history" value={`${academicHistoryEntries.length} entr${academicHistoryEntries.length === 1 ? "y" : "ies"}`} />
                    <SummaryRow label="Statement of purpose" value={firstPage.statementOfPurpose ? "Added" : "Pending"} />
                  </>
                ) : (
                  <>
                    {documentChecklist.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[#5B5680]">{item.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                            item.done ? "bg-[#73D7FF]/16 text-[#3D2C8D]" : "bg-[#F7F7FB] text-[#7C7894]"
                          }`}
                        >
                          {item.done ? "Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[#EAEAF4] bg-white p-5 shadow-[0_24px_70px_-48px_rgba(61,44,141,0.26)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4CFF]">Helpful notes</p>
              <div className="mt-4 space-y-3 text-sm text-[#5B5680]">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#5B8CFF]" />
                  <p>Make sure uploaded documents are readable and not cropped.</p>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#73D7FF]" />
                  <p>Bank details should match the beneficiary account where scholarship funds must be sent.</p>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9C7BFF]" />
                  <p>Using the exact same names across documents helps reduce verification delays.</p>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#6D4CFF]" />
                  <p>{disclaimerText}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {!firstPageSaved && step === 1 ? (
          <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#6A6684]">
            Page 2 unlocks after you save page 1.
          </p>
        ) : null}

        {toastVisible ? (
          <div className="pointer-events-none fixed right-3 top-3 z-50 w-[min(calc(100vw-1.5rem),24rem)] rounded-[1.5rem] border border-[#B9A7FF]/30 bg-[linear-gradient(135deg,rgba(61,44,141,0.96),rgba(109,76,255,0.94))] px-4 py-3 shadow-[0_24px_80px_-30px_rgba(61,44,141,0.8)] backdrop-blur sm:right-4 sm:top-4 sm:w-[min(92vw,24rem)]">
            <div role="status" aria-live="polite" className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-white/12 p-1.5 text-[#73D7FF]">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-white">{toastMessage}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6E0FF]">
                  Application notice
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
