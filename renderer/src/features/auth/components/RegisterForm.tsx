import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../../../components/ui/core/Icons";
import { notify } from "../../../components/ui/feedback/ToastEngine";

// Shadcn components
import { Input } from "@/components/ui/core/Input";
import { Button } from "@/components/ui/core/Button";
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
import { registerUser } from "../../../store/auth/authSlice";
import { RadioCard } from "../../../components/ui/forms/RadioCard";
import { PasswordStrengthMeter } from "../../../components/ui/forms/PasswordStrengthMeter";

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

  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";
  const [showPassword, setShowPassword] = useState(false);

  // 2. Watch the password field for the custom strength meter
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    notify("Creating your account...", "info");
    try {
      await dispatch(registerUser(data)).unwrap();
      notify("Account created successfully. Please check your email.", "success");
      // Don't navigate away; the UI will now show the verification screen
    } catch (error: unknown) {
      notify((error as string) || "Failed to create account.", "error");
    }
  };

  const registeredEmail = form.getValues("email");

  if (status === "succeeded") {
    return (
      <div className="w-full max-w-2xl bg-white/90 dark:bg-[#18181B]/90 border border-light-border dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row relative">
        <div className="w-full md:w-2 bg-light-bg dark:bg-white/5 md:h-auto h-2 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-light-primary dark:bg-dark-primary shadow-[0_0_15px_rgba(16,55,102,0.5)] dark:shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-10 lg:p-16 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-4xl text-light-primary dark:text-dark-primary">mail</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-light-text dark:text-white font-display mb-2">Check your inbox</h2>
            <p className="text-sm text-light-text/60 dark:text-white/50 leading-relaxed">
              We sent a verification link to<br />
              <span className="font-semibold text-light-primary dark:text-dark-primary">{registeredEmail}</span>
            </p>
          </div>
          <p className="text-xs text-light-text/40 dark:text-white/30 leading-relaxed max-w-xs">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
          <div className="flex flex-col items-center gap-3 w-full pt-2 border-t border-light-border dark:border-white/5">
            <p className="text-xs text-light-text/40 dark:text-white/30">Already verified?</p>
            <Link
              to="/login"
              className="text-sm font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                        className="absolute right-4 text-light-text/50 hover:text-light-primary dark:text-white/30 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"
                      >
                        <span className="material-symbols-rounded text-sm">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </FormControl>

                  {/* Strength Meter sits right below the input but inside the FormItem */}
                  <PasswordStrengthMeter passwordValue={passwordValue} />

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
                      <RadioCard
                        value="general"
                        title="General"
                        description="Broad Scope"
                        icon="public"
                        checked={field.value === "general"}
                        onChange={field.onChange}
                      />

                      {/* Professional Radio */}
                      <RadioCard
                        value="professional"
                        title="Professional"
                        description="Business & Specs"
                        icon="work"
                        checked={field.value === "professional"}
                        onChange={field.onChange}
                      />

                      {/* Student Radio */}
                      <RadioCard
                        value="student"
                        title="Student"
                        description="Learning Focus"
                        icon="school"
                        checked={field.value === "student"}
                        onChange={field.onChange}
                      />

                      {/* Developer Radio */}
                      <RadioCard
                        value="developer"
                        title="Developer"
                        description="Technical & Code"
                        icon="terminal"
                        checked={field.value === "developer"}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Footer / Submit */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 gap-4">
              <Link
                to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className="text-sm font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity"
              >
                Already initialized?
              </Link>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-auto bg-light-primary dark:bg-dark-primary text-white dark:text-black px-8 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] hover:bg-light-primary dark:hover:bg-dark-primary hover:opacity-90 hover:scale-[1.02] cursor-pointer disabled:cursor-wait disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
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
