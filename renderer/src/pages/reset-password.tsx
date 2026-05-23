import { ResetPasswordForm } from "../features/auth/components/ResetPasswordForm";
import { LoginHero } from "../features/auth/components/LoginHero";

const ResetPassword = () => {
  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text antialiased font-sans h-screen w-full flex overflow-y-auto overflow-x-hidden min-w-[320px] selection:bg-light-primary selection:text-white dark:selection:bg-dark-primary dark:selection:text-dark-bg transition-colors">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 neural-bg animate-pan opacity-60 dark:opacity-40 will-change-transform"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-light-primary/5 dark:bg-dark-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-light-primary/5 dark:bg-dark-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      <LoginHero />

      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 py-16 sm:py-24 relative z-10 min-h-screen">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;
