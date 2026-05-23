import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../../components/ui/ToastEngine";
import { authService } from "../api/authService";
import { ContextLogo } from "@/components/ui/ContextLogo";
import { Input } from "@/components/ui/Input";

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  const getBarColor = (barIndex: number) => {
    if (strengthScore >= barIndex) {
      if (strengthScore === 1) return "bg-red-500";
      if (strengthScore === 2) return "bg-orange-500";
      if (strengthScore === 3) return "bg-yellow-500";
      if (strengthScore === 4) return "bg-emerald-500";
    }
    return "bg-light-border dark:bg-white/10";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      notify("Invalid or missing recovery token.", "error");
      return;
    }
    if (password.length < 8) {
      notify("Access key must be at least 8 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      notify("Access keys do not match.", "error");
      return;
    }

    setIsLoading(true);
    notify("Updating access key...", "info");
    
    try {
      await authService.resetPassword(token, password);
      notify("Access key updated successfully. You can now authenticate.", "success");
      navigate("/login");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update access key.";
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
          New Access Key
        </h2>
        <p className="text-sm font-medium text-light-text/80 dark:text-white/60">
          Enter a secure access key to regain entry to the node.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
            New Access Key
          </label>
          <div className="relative group">
            <div className="relative bg-light-surface dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl flex items-center overflow-hidden transition-colors group-focus-within:border-light-primary dark:group-focus-within:border-dark-primary/50 group-focus-within:ring-1 group-focus-within:ring-light-primary/20 dark:group-focus-within:ring-dark-primary/20">
              <span className="pl-4 material-symbols-rounded text-light-primary dark:text-white/30 group-focus-within:text-light-primary dark:group-focus-within:text-dark-primary transition-colors text-lg">
                password
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full font-sans bg-transparent border-none text-light-text dark:text-white text-sm px-4 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-light-text/50 dark:placeholder:text-white/30 outline-none shadow-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 text-light-text/50 hover:text-light-primary dark:text-white/30 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"
              >
                <span className="material-symbols-rounded text-sm">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex gap-1 mt-2 px-1 transition-all duration-300">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(1)}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(2)}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(3)}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(4)}`}></div>
          </div>
          
          {/* Password Criteria */}
          <div className="mt-2 text-[10px] text-light-text/60 dark:text-white/40 flex flex-col gap-1 px-1 font-medium">
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-rounded text-[12px] ${password.length >= 8 ? "text-emerald-500" : ""}`}>
                {password.length >= 8 ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={password.length >= 8 ? "text-emerald-500" : ""}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-rounded text-[12px] ${/[A-Z]/.test(password) ? "text-emerald-500" : ""}`}>
                {/[A-Z]/.test(password) ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={/[A-Z]/.test(password) ? "text-emerald-500" : ""}>At least 1 uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-rounded text-[12px] ${/[0-9]/.test(password) ? "text-emerald-500" : ""}`}>
                {/[0-9]/.test(password) ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={/[0-9]/.test(password) ? "text-emerald-500" : ""}>At least 1 number</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
            Confirm Access Key
          </label>
          <div className="relative group">
            <div className="relative bg-light-surface dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl flex items-center overflow-hidden transition-colors group-focus-within:border-light-primary dark:group-focus-within:border-dark-primary/50 group-focus-within:ring-1 group-focus-within:ring-light-primary/20 dark:group-focus-within:ring-dark-primary/20">
              <span className="pl-4 material-symbols-rounded text-light-primary dark:text-white/30 group-focus-within:text-light-primary dark:group-focus-within:text-dark-primary transition-colors text-lg">
                password
              </span>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full font-sans bg-transparent border-none text-light-text dark:text-white text-sm px-4 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-light-text/50 dark:placeholder:text-white/30 outline-none shadow-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="pr-4 text-light-text/50 hover:text-light-primary dark:text-white/30 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"
              >
                <span className="material-symbols-rounded text-sm">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full mt-6 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <span className="material-symbols-rounded animate-spin">sync</span>
          ) : (
            <span className="material-symbols-rounded group-hover:-translate-y-1 transition-transform duration-500">lock_reset</span>
          )}
          {isLoading ? "Updating..." : "Update Access Key"}
        </button>
      </form>

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
