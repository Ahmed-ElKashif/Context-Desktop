import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui/Icons";
import { notify } from "../../../components/ui/ToastEngine";

// Shadcn components
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schema";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { registerUser } from "../../../store/authSlice";

export const RegisterForm = () => {
  // 1. Initialize the form using Shadcn's expected structure
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      persona: "general",
    },
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";
  const [showPassword, setShowPassword] = useState(false);

  // 2. Watch the password field for your custom strength meter
  const passwordValue = form.watch("password") || "";

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(passwordValue);

  const getBarColor = (barIndex: number) => {
    if (strengthScore >= barIndex) {
      if (strengthScore === 1) return "bg-red-500";
      if (strengthScore === 2) return "bg-orange-500";
      if (strengthScore === 3) return "bg-yellow-500";
      if (strengthScore === 4) return "bg-emerald-500";
    }
    return "bg-light-border dark:bg-white/10";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    notify("Initializing new node...", "info");
    try {
      await dispatch(registerUser(data)).unwrap();
      notify("Node initialized successfully.", "success");
      sessionStorage.setItem("context_boot_after_auth", "1");
      navigate("/dashboard");
    } catch (error: any) {
      notify(error || "Failed to initialize node.", "error");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white/90 dark:bg-[#18181B]/90 border border-light-border dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row relative">
      <div className="w-full md:w-2 bg-light-bg dark:bg-white/5 md:h-auto h-2 relative shrink-0">
        <div className="absolute top-0 left-0 w-1/3 md:w-full h-full md:h-1/3 bg-light-primary dark:bg-dark-primary shadow-[0_0_15px_rgba(16,55,102,0.5)] dark:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-500"></div>
      </div>

      <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-light-text dark:text-white tracking-tight">
              Initialize System
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 hidden sm:flex items-center justify-center shrink-0">
            <Icon
              name="neurology"
              className="text-light-primary dark:text-dark-primary text-2xl animate-pulse-slow"
            />
          </div>
        </div>

        {/* 3. Wrap everything in the Form component */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="write your name here"
                        className="py-5 px-4 bg-light-surface dark:bg-black/40 border-light-border dark:border-white/10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs ml-1" />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 space-y-0">
                    <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        className="py-5 px-4 bg-light-surface dark:bg-black/40 border-light-border dark:border-white/10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs ml-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 space-y-0">
                  <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@mail.com"
                      className="py-5 px-4 bg-light-surface dark:bg-black/40 border-light-border dark:border-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Password & Strength Meter */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 space-y-0">
                  <FormLabel className="text-[10px] font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest ml-1">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a master key"
                        className="py-5 px-4 bg-light-surface dark:bg-black/40 border-light-border dark:border-white/10 pr-12"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-light-text/50 hover:text-light-primary dark:text-white/30 dark:hover:text-dark-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary rounded-full flex items-center justify-center p-1"
                        aria-label="Toggle password visibility"
                        aria-pressed={showPassword}
                      >
                        <span className="material-symbols-rounded text-sm">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </FormControl>

                  {/* Strength Meter sits right below the input but inside the FormItem */}
                  <div className="flex gap-1 mt-1 px-1 transition-all duration-300">
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(1)}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(2)}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(3)}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getBarColor(4)}`}
                    ></div>
                  </div>
                  
                  {/* Password Criteria */}
                  <div aria-live="polite" className="mt-2 text-[10px] text-light-text/60 dark:text-white/40 flex flex-col gap-1 px-1 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-rounded text-[12px] ${passwordValue.length >= 8 ? "text-emerald-500" : ""}`}>
                        {passwordValue.length >= 8 ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={passwordValue.length >= 8 ? "text-emerald-500" : ""}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-rounded text-[12px] ${/[A-Z]/.test(passwordValue) ? "text-emerald-500" : ""}`}>
                        {/[A-Z]/.test(passwordValue) ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={/[A-Z]/.test(passwordValue) ? "text-emerald-500" : ""}>At least 1 uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-rounded text-[12px] ${/[0-9]/.test(passwordValue) ? "text-emerald-500" : ""}`}>
                        {/[0-9]/.test(passwordValue) ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={/[0-9]/.test(passwordValue) ? "text-emerald-500" : ""}>At least 1 number</span>
                    </div>
                  </div>

                  <FormMessage className="text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Persona Selection */}
            <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem className="pt-6 border-t border-light-border dark:border-white/5 space-y-0">
                  <FormLabel className="block text-[10px] font-mono font-bold uppercase tracking-widest text-light-primary dark:text-dark-primary mb-4 ml-1">
                    Select Semantic Core
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* General Radio */}
                      <label className="cursor-pointer relative group">
                        <input
                          type="radio"
                          value="general"
                          checked={field.value === "general"}
                          onChange={field.onChange}
                          className="peer sr-only persona-radio"
                        />
                        <div className="p-3 rounded-xl border border-light-border dark:border-white/10 peer-checked:border-light-primary dark:peer-checked:border-dark-primary peer-focus-visible:ring-2 peer-focus-visible:ring-light-primary dark:peer-focus-visible:ring-dark-primary transition-all flex items-center gap-3 bg-light-bg/50 dark:bg-white/5">
                          <div className="icon w-8 h-8 rounded-full bg-light-surface dark:bg-white/10 flex items-center justify-center text-light-text dark:text-dark-text shrink-0">
                            <Icon name="public" className="text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-light-text dark:text-white">
                              General
                            </div>
                            <div className="text-[10px] font-semibold text-light-text/60 dark:text-dark-text/60">
                              Broad Scope
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Professional Radio */}
                      <label className="cursor-pointer relative group">
                        <input
                          type="radio"
                          value="professional"
                          checked={field.value === "professional"}
                          onChange={field.onChange}
                          className="peer sr-only persona-radio"
                        />
                        <div className="p-3 rounded-xl border border-light-border dark:border-white/10 peer-checked:border-light-primary dark:peer-checked:border-dark-primary peer-focus-visible:ring-2 peer-focus-visible:ring-light-primary dark:peer-focus-visible:ring-dark-primary transition-all flex items-center gap-3 bg-light-bg/50 dark:bg-white/5">
                          <div className="icon w-8 h-8 rounded-full bg-light-surface dark:bg-white/10 flex items-center justify-center text-light-text dark:text-dark-text shrink-0">
                            <Icon name="work" className="text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-light-text dark:text-white">
                              Professional
                            </div>
                            <div className="text-[10px] font-semibold text-light-text/60 dark:text-dark-text/60">
                              Business & Specs
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Student Radio */}
                      <label className="cursor-pointer relative group">
                        <input
                          type="radio"
                          value="student"
                          checked={field.value === "student"}
                          onChange={field.onChange}
                          className="peer sr-only persona-radio"
                        />
                        <div className="p-3 rounded-xl border border-light-border dark:border-white/10 peer-checked:border-light-primary dark:peer-checked:border-dark-primary peer-focus-visible:ring-2 peer-focus-visible:ring-light-primary dark:peer-focus-visible:ring-dark-primary transition-all flex items-center gap-3 bg-light-bg/50 dark:bg-white/5">
                          <div className="icon w-8 h-8 rounded-full bg-light-surface dark:bg-white/10 flex items-center justify-center text-light-text dark:text-dark-text shrink-0">
                            <Icon name="school" className="text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-light-text dark:text-white">
                              Student
                            </div>
                            <div className="text-[10px] font-semibold text-light-text/60 dark:text-dark-text/60">
                              Learning Focus
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Developer Radio */}
                      <label className="cursor-pointer relative group">
                        <input
                          type="radio"
                          value="developer"
                          checked={field.value === "developer"}
                          onChange={field.onChange}
                          className="peer sr-only persona-radio"
                        />
                        <div className="p-3 rounded-xl border border-light-border dark:border-white/10 peer-checked:border-light-primary dark:peer-checked:border-dark-primary peer-focus-visible:ring-2 peer-focus-visible:ring-light-primary dark:peer-focus-visible:ring-dark-primary transition-all flex items-center gap-3 bg-light-bg/50 dark:bg-white/5">
                          <div className="icon w-8 h-8 rounded-full bg-light-surface dark:bg-white/10 flex items-center justify-center text-light-text dark:text-dark-text shrink-0">
                            <Icon name="terminal" className="text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-light-text dark:text-white">
                              Developer
                            </div>
                            <div className="text-[10px] font-semibold text-light-text/60 dark:text-dark-text/60">
                              Technical & Code
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Footer / Submit */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary rounded-sm px-1"
              >
                Already initialized?
              </Link>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-auto bg-light-primary dark:bg-dark-primary text-white dark:text-black px-8 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] hover:bg-light-primary dark:hover:bg-dark-primary hover:opacity-90 hover:scale-[1.02] cursor-pointer disabled:cursor-wait disabled:opacity-50 transition-all flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary dark:focus-visible:ring-offset-[#18181B]"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-rounded animate-spin text-lg">
                      sync
                    </span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Node
                    <span className="material-symbols-rounded text-lg group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
