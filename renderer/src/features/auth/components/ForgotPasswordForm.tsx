import { useState } from "react";
import { Link } from "react-router-dom";
import { notify } from "../../../components/ui/ToastEngine";
import { authService } from "../api/authService";
import { ContextLogo } from "@/components/ui/ContextLogo";
import { Input } from "@/components/ui/Input";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notify("Please enter your identity email.", "error");
      return;
    }

    setIsLoading(true);
    notify("Transmitting request...", "info");
    
    try {
      await authService.forgotPassword(email);
      notify("Recovery instructions sent.", "success");
      setIsSent(true);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to transmit request.";
      notify(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 dark:bg-[#18181B]/80 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-light-primary via-light-primary/50 to-light-primary dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary opacity-60"></div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10">
            <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              <ContextLogo />
            </div>
          </div>
          <span className="font-bold text-xl text-light-primary dark:text-white font-mono tracking-tight">
            Context
          </span>
        </div>
        <h2 className="text-3xl font-bold text-light-text dark:text-white mb-2 tracking-tight">
          Recovery
        </h2>
        <p className="text-sm font-medium text-light-text/80 dark:text-white/60">
          Enter your identity to receive a new access key.
        </p>
      </div>

      {isSent ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-rounded text-light-primary dark:text-dark-primary text-3xl">mark_email_read</span>
          </div>
          <p className="text-sm text-light-text/80 dark:text-white/60">
            Instructions have been transmitted to <br/><span className="font-bold text-light-text dark:text-white">{email}</span>.
          </p>
          <Link
            to="/login"
            className="w-full mt-6 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-white/10 text-light-text dark:text-white font-bold py-4 rounded-xl hover:bg-light-primary/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            Return to Authentication
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
              Identity
            </label>
            <div className="relative group">
              <div className="relative bg-light-surface dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl flex items-center overflow-hidden transition-colors group-focus-within:border-light-primary dark:group-focus-within:border-dark-primary/50 group-focus-within:ring-1 group-focus-within:ring-light-primary/20 dark:group-focus-within:ring-dark-primary/20">
                <span className="pl-4 material-symbols-rounded text-light-primary dark:text-white/30 group-focus-within:text-light-primary dark:group-focus-within:text-dark-primary transition-colors text-lg">
                  fingerprint
                </span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@context.ai"
                  className="w-full font-sans bg-transparent border-none text-light-text dark:text-white text-sm px-4 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-light-text/50 dark:placeholder:text-white/30 outline-none shadow-none"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span className="material-symbols-rounded animate-spin">sync</span>
            ) : (
              <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform duration-500">send</span>
            )}
            {isLoading ? "Transmitting..." : "Send Request"}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-light-border dark:border-white/5 text-center">
        <Link
          to="/login"
          className="text-sm text-light-text/60 dark:text-white/40 hover:text-light-primary dark:hover:text-dark-primary transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-rounded text-sm">arrow_back</span>
          Cancel and return
        </Link>
      </div>
    </div>
  );
};
