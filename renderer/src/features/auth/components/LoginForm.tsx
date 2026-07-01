import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../../components/ui/feedback/ToastEngine";

// Shadcn components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginUser } from "../../../store/auth/authSlice";
import { ContextLogo } from "@/components/ui/core/ContextLogo";
import { Input } from "@/components/ui/core/Input";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const cycle = searchParams.get("cycle");

  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";
  const [showPassword, setShowPassword] = useState(false);

  // Form Setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    notify("Authenticating...", "info");
    try {
      const res = await dispatch(loginUser(data)).unwrap();
      notify("Access granted.", "success");
      sessionStorage.setItem("context_boot_after_auth", "1");
      if (plan) {
        navigate(`/settings?checkoutPlan=${plan}&cycle=${cycle || "monthly"}`);
      } else if (res.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/workspace");
      }
    } catch (error: unknown) {
      const errorMsg = typeof error === 'string' ? error : (error as any)?.message || "Authentication failed.";
      notify(errorMsg, "error");
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
          Authenticate
        </h2>
        <p className="text-sm font-medium text-light-text/80 dark:text-white/60">
          Enter your credentials to access the node.
        </p>
      </div>

      {/* Integrating Shadcn Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Identity Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
                  Identity
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="relative bg-light-surface dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl flex items-center overflow-hidden transition-colors group-focus-within:border-light-primary dark:group-focus-within:border-dark-primary/50 group-focus-within:ring-1 group-focus-within:ring-light-primary/20 dark:group-focus-within:ring-dark-primary/20">
                      <span className="pl-4 material-symbols-rounded text-light-primary dark:text-white/30 group-focus-within:text-light-primary dark:group-focus-within:text-dark-primary transition-colors text-lg">
                        fingerprint
                      </span>
                      <Input
                        type="email"
                        placeholder="user@context.ai"
                        className="w-full font-sans bg-transparent border-none text-light-text dark:text-white text-sm px-4 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-light-text/50 dark:placeholder:text-white/30 outline-none shadow-none"
                        {...field}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xs ml-1" />
              </FormItem>
            )}
          />

          {/* Access Key Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest">
                    Access Key
                  </FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity uppercase tracking-wider font-mono"
                  >
                    Lost Key?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative group">
                    <div className="relative bg-light-surface dark:bg-black/40 border border-light-border dark:border-white/10 rounded-xl flex items-center overflow-hidden transition-colors group-focus-within:border-light-primary dark:group-focus-within:border-dark-primary/50 group-focus-within:ring-1 group-focus-within:ring-light-primary/20 dark:group-focus-within:ring-dark-primary/20">
                      <span className="pl-4 material-symbols-rounded text-light-primary dark:text-white/30 group-focus-within:text-light-primary dark:group-focus-within:text-dark-primary transition-colors text-lg">
                        password
                      </span>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="w-full font-sans bg-transparent border-none text-light-text dark:text-white text-sm px-4 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-light-text/50 dark:placeholder:text-white/30 outline-none shadow-none"
                        {...field}
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
                </FormControl>
                <FormMessage className="text-xs ml-1" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span className="material-symbols-rounded animate-spin">
                sync
              </span>
            ) : (
              <span className="material-symbols-rounded group-hover:rotate-180 transition-transform duration-500">
                sync_alt
              </span>
            )}
            {isLoading ? "Authenticating..." : "Sync Context"}
          </button>
        </form>
      </Form>

      <div className="mt-8 pt-6 border-t border-light-border dark:border-white/5 text-center">
        <p className="text-sm font-medium text-light-text/80 dark:text-white/60">
          New to the network?
          <Link
            to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
            className="text-light-primary dark:text-white font-bold hover:opacity-80 dark:hover:text-dark-primary transition-opacity ml-1"
          >
            Initialize System
          </Link>
        </p>
      </div>
    </div>
  );
};
