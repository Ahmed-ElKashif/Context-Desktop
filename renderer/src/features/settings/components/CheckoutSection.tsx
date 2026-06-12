import { useState } from "react";
import { paymentService } from "../api/paymentService";
import { CheckoutSuccess } from "./CheckoutSuccess";
import { ImageDropzone } from "../../../components/ui/forms/ImageDropzone";

const INSTAPAY_LINK = "https://ipn.eg/S/marioemadbenjamin/instapay/1NMaw3";

interface CheckoutSectionProps {
  planId: string;
  cycle: string;
  onBack: () => void;
}

export const CheckoutSection = ({
  planId,
  cycle,
  onBack,
}: CheckoutSectionProps) => {
  // Form state
  const [senderName, setSenderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    screenshot?: string;
  }>({});

  // Local billing cycle state (initialized from prop, user can toggle)
  const [activeCycle, setActiveCycle] = useState(cycle);

  const isAnnual = activeCycle === "annual";

  let monthlyPrice = 0;
  let annualPriceMonthly = 0;
  let planName = "";

  switch (planId) {
    case "sandbox":
      monthlyPrice = 0;
      annualPriceMonthly = 0;
      planName = "Sandbox";
      break;
    case "startup":
      monthlyPrice = 1900;
      annualPriceMonthly = 1520;
      planName = "Startup";
      break;
    case "growth":
      monthlyPrice = 4800;
      annualPriceMonthly = 3600;
      planName = "Growth";
      break;
    case "embed":
      monthlyPrice = 0;
      annualPriceMonthly = 0;
      planName = "Enterprise";
      break;
    case "extra_docs":
      monthlyPrice = 500;
      annualPriceMonthly = 500;
      planName = "Extra Documents Add-on";
      break;
    case "extra_tokens":
      monthlyPrice = 700;
      annualPriceMonthly = 700;
      planName = "Extra Tokens Add-on";
      break;
    default:
      monthlyPrice = 1900;
      annualPriceMonthly = 1520;
      planName = "Startup";
  }

  const annualPriceTotal = annualPriceMonthly * 12;
  const price = isAnnual ? annualPriceTotal : monthlyPrice;
  const tax = Math.round(price * 0.14); // 14% VAT
  const total = price + tax;

  const renewalDate = new Date();
  if (isAnnual) {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }
  const formattedDate = renewalDate.toLocaleDateString("en-GB");

  const savePercentage =
    monthlyPrice > 0
      ? Math.round((1 - annualPriceMonthly / monthlyPrice) * 100)
      : 0;

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INSTAPAY_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = INSTAPAY_LINK;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFieldErrors((prev) => ({
        ...prev,
        screenshot: "Please upload an image file (PNG, JPG, etc.)",
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setFieldErrors((prev) => ({
        ...prev,
        screenshot: "Image must be under 10MB",
      }));
      return;
    }
    setScreenshot(file);
    setFieldErrors((prev) => ({ ...prev, screenshot: undefined }));
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!senderName.trim()) errors.name = "Sender name is required";
    if (!phoneNumber.trim()) errors.phone = "Phone number is required";
    else if (!/^01[0-9]{9}$/.test(phoneNumber.replace(/\s/g, ""))) {
      errors.phone = "Enter a valid Egyptian phone number (01XXXXXXXXX)";
    }
    if (!screenshot) errors.screenshot = "Payment screenshot is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("planId", planId);
      formData.append("billingCycle", activeCycle);
      formData.append("amount", String(total));
      formData.append("senderName", senderName.trim());
      formData.append("phoneNumber", phoneNumber.replace(/\s/g, ""));
      formData.append("screenshot", screenshot!);

      await paymentService.submitPaymentRequest(formData);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message ||
          "Failed to submit payment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──────────────────────────────────────────────────

  if (submitted) {
    return (
      <CheckoutSuccess planName={planName} total={total} onBack={onBack} />
    );
  }

  // ── Main Checkout UI ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-light-bg dark:bg-[#121214] flex items-center justify-center p-4 font-sans w-full">
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 rounded-2xl max-w-[540px] w-full p-8 shadow-[0_4px_24px_rgba(16,55,102,0.08)] dark:shadow-[0_4px_24px_rgba(139,92,246,0.1)] relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-light-text/60 dark:text-dark-text/60 hover:text-light-primary dark:hover:text-dark-primary transition-colors mb-6"
        >
          <span className="material-symbols-rounded text-[18px]">
            arrow_back
          </span>
          Back to billing section
        </button>

        <h2 className="text-2xl font-bold text-light-text dark:text-white mb-6 capitalize">
          {planName} plan
        </h2>

        {/* Cycle Toggles */}
        {planId !== "sandbox" &&
          planId !== "embed" &&
          planId !== "extra_docs" &&
          planId !== "extra_tokens" && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                onClick={() => setActiveCycle("monthly")}
                className={`rounded-xl p-4 cursor-pointer relative transition-all ${!isAnnual ? "border-2 border-light-primary dark:border-dark-primary bg-light-primary/5 dark:bg-dark-primary/10" : "border border-light-border dark:border-white/10 hover:border-light-primary/30 dark:hover:border-dark-primary/30 bg-white dark:bg-dark-surface"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isAnnual ? "border-light-primary dark:border-dark-primary" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    {!isAnnual && (
                      <div className="w-2.5 h-2.5 rounded-full bg-light-primary dark:bg-dark-primary" />
                    )}
                  </div>
                </div>
                <div className="font-bold text-light-text dark:text-white mb-1">
                  Monthly
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {monthlyPrice.toLocaleString()} EGP/month + tax
                </div>
              </div>

              <div
                onClick={() => setActiveCycle("annual")}
                className={`rounded-xl p-4 cursor-pointer relative transition-all ${isAnnual ? "border-2 border-light-primary dark:border-dark-primary bg-light-primary/5 dark:bg-dark-primary/10" : "border border-light-border dark:border-white/10 hover:border-light-primary/30 dark:hover:border-dark-primary/30 bg-white dark:bg-dark-surface"}`}
              >
                <div className="absolute top-3 right-3 bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary text-xs font-bold px-2 py-1 rounded-md">
                  Save {savePercentage}%
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isAnnual ? "border-light-primary dark:border-dark-primary" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    {isAnnual && (
                      <div className="w-2.5 h-2.5 rounded-full bg-light-primary dark:bg-dark-primary" />
                    )}
                  </div>
                </div>
                <div className="font-bold text-light-text dark:text-white mb-1">
                  Yearly
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {annualPriceTotal.toLocaleString()} EGP/year + tax
                </div>
              </div>
            </div>
          )}

        {/* Order Details */}
        <div className="bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/5 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-4">
            Order details
          </h3>

          <div className="flex justify-between mb-1">
            <span className="text-light-text dark:text-white font-medium capitalize">
              {planName} plan
            </span>
            <span className="font-semibold text-light-text dark:text-white">
              {price.toLocaleString()} EGP
            </span>
          </div>
          <div className="text-sm text-light-text/60 dark:text-dark-text/60 mb-6">
            {planId === "extra_docs" || planId === "extra_tokens"
              ? "One-time"
              : planId === "sandbox" || planId === "embed"
                ? "Forever"
                : isAnnual
                  ? "Annually"
                  : "Monthly"}
          </div>

          <div className="border-t border-light-border/50 dark:border-white/10 my-4"></div>

          <div className="flex justify-between mb-3 text-sm">
            <span className="text-light-text/70 dark:text-dark-text/70">
              Subtotal
            </span>
            <span className="font-medium text-light-text dark:text-white">
              {price.toLocaleString()} EGP
            </span>
          </div>
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-light-text/70 dark:text-dark-text/70">
              Tax (14%)
            </span>
            <span className="font-medium text-light-text dark:text-white">
              {tax.toLocaleString()} EGP
            </span>
          </div>

          <div className="border-t border-light-border/50 dark:border-white/10 my-4"></div>

          <div className="flex justify-between text-base font-bold">
            <span className="text-light-text dark:text-white">
              Total due today
            </span>
            <span className="text-light-primary dark:text-dark-primary">
              {total.toLocaleString()} EGP
            </span>
          </div>
        </div>

        {/* Footer Info */}
        {(planId === "startup" || planId === "growth") && (
          <div className="flex items-start gap-3 bg-light-primary/5 dark:bg-dark-primary/5 border border-light-primary/20 dark:border-dark-primary/20 rounded-xl p-4 text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
            <span className="material-symbols-rounded text-light-primary dark:text-dark-primary text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <p className="leading-relaxed">
              Your subscription will auto renew on{" "}
              <span className="font-semibold text-light-text dark:text-white">
                {formattedDate}
              </span>
              . You will be charged{" "}
              <span className="font-semibold text-light-text dark:text-white">
                {price.toLocaleString()} EGP/{isAnnual ? "year" : "month"}
              </span>{" "}
              + tax.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            InstaPay Payment Section
           ══════════════════════════════════════════════════════════════════ */}

        <div className="border-t border-light-border dark:border-white/5 pt-6 mt-2">
          <h3 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-4">
            Pay via InstaPay
          </h3>

          {/* InstaPay Pill / Link */}
          <div className="bg-gradient-to-r from-light-primary/5 to-[#8b5cf6]/5 dark:from-dark-primary/5 dark:to-[#8b5cf6]/5 border border-light-primary/20 dark:border-dark-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-light-primary/10 dark:bg-dark-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-[22px] text-light-primary dark:text-dark-primary">
                  account_balance
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-light-text/70 dark:text-white/60 uppercase tracking-wide mb-0.5">
                  Send {total.toLocaleString()} EGP to
                </p>
                <p className="text-sm font-extrabold text-light-text dark:text-white truncate">
                  marioemadbenjamin
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={INSTAPAY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-light-primary dark:bg-dark-primary text-white font-bold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-rounded text-[18px]">
                  open_in_new
                </span>
                Open InstaPay
              </a>
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 border font-bold text-sm rounded-lg transition-all active:scale-[0.98] ${
                  copied
                    ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-light-border dark:border-white/10 text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-rounded text-[18px]">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          {/* Payment Details Form */}
          <div className="space-y-4 mb-6">
            <p className="text-xs font-semibold text-light-text/70 dark:text-dark-text/70 uppercase tracking-wide">
              After paying, fill in the details below
            </p>

            {/* Sender Name */}
            <div>
              <label className="block text-sm font-bold text-light-text dark:text-white mb-1.5">
                Sender Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => {
                  setSenderName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Name as it appears on InstaPay"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white dark:bg-[#121214] text-light-text dark:text-white placeholder:text-light-text/60 dark:placeholder:text-white/60 outline-none transition-all focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 ${
                  fieldErrors.name
                    ? "border-red-400 dark:border-red-500/50"
                    : "border-light-border dark:border-white/10 focus:border-light-primary dark:focus:border-dark-primary"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="material-symbols-rounded text-[14px]">
                    error
                  </span>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-light-text dark:text-white mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPhoneNumber(val);
                  if (fieldErrors.phone)
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white dark:bg-[#121214] text-light-text dark:text-white placeholder:text-light-text/60 dark:placeholder:text-white/60 outline-none transition-all focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 font-mono tracking-wider ${
                  fieldErrors.phone
                    ? "border-red-400 dark:border-red-500/50"
                    : "border-light-border dark:border-white/10 focus:border-light-primary dark:focus:border-dark-primary"
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="material-symbols-rounded text-[14px]">
                    error
                  </span>
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Screenshot Upload */}
            <ImageDropzone
              screenshot={screenshot}
              screenshotPreview={screenshotPreview}
              error={fieldErrors.screenshot}
              onFileSelect={handleFileSelect}
              onFileRemove={removeScreenshot}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-600 dark:text-red-400 font-medium">
              <span className="material-symbols-rounded text-[18px]">
                error
              </span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="w-full bg-light-primary dark:bg-dark-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                {planId === "sandbox" || planId === "embed"
                  ? "Confirm"
                  : `Submit Payment — ${total.toLocaleString()} EGP`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
