import { Link } from "react-router-dom";



import { RegisterForm } from "../features/auth/components/RegisterForm";
import { NeuralBackground } from "../components/ui/NeuralBackground";

export default function RegisterPage() {
  

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text antialiased font-sans h-screen w-full flex flex-col relative overflow-y-auto overflow-x-hidden selection:bg-light-primary selection:text-white dark:selection:bg-dark-primary dark:selection:text-dark-bg transition-colors">
      {/* Shared Backgrounds */}

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-surface/50 to-light-bg dark:from-transparent dark:via-dark-bg/80 dark:to-dark-bg"></div>

        <NeuralBackground />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-light-primary/10 dark:bg-dark-primary/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Top Navigation */}
      <header className="w-full p-6 flex justify-between items-center relative z-20 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
          aria-label="Refresh Context"
        >
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-light-primary/20 dark:bg-dark-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface/80 border border-light-border dark:border-white/10 rounded-xl flex items-center justify-center shadow-sm z-10 overflow-hidden group-hover:border-light-primary/50 dark:group-hover:border-dark-primary/50 transition-colors">
              <svg
                className="w-6 h-6 transition-transform duration-500 group-hover:scale-110"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="6"
                  className="fill-light-text/60 dark:fill-white/40 group-hover:fill-light-primary dark:group-hover:fill-dark-primary transition-colors"
                />
                <path
                  d="M30 30 C 30 30, 45 45, 50 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-light-border dark:text-white/20 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
                />
                <circle
                  cx="70"
                  cy="30"
                  r="6"
                  className="fill-light-text/60 dark:fill-white/40 group-hover:fill-light-primary dark:group-hover:fill-dark-primary transition-colors"
                />
                <path
                  d="M70 30 C 70 30, 55 45, 50 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-light-border dark:text-white/20 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
                />
                <circle
                  cx="50"
                  cy="80"
                  r="6"
                  className="fill-light-accent/80 dark:fill-dark-secondary/60 group-hover:fill-light-accent dark:group-hover:fill-dark-secondary transition-colors"
                />
                <path
                  d="M50 80 C 50 80, 50 65, 50 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-light-accent/60 dark:text-dark-secondary/40 group-hover:text-light-accent dark:group-hover:text-dark-secondary transition-colors"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-light-primary dark:text-dark-primary animate-pulse opacity-50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="6"
                  className="fill-light-primary dark:fill-dark-primary"
                />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-light-primary dark:text-white font-mono group-hover:text-light-accent dark:group-hover:text-dark-primary transition-colors duration-300">
            Context
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity hidden sm:block"
          >
            Help & Docs
          </a>

         
        </div>
      </header>

      {/* Centered Feature Component */}
      <main className="flex-1 flex items-center justify-center p-4 py-8 md:p-8 relative z-10 w-full my-auto">
        <RegisterForm />
      </main>
    </div>
  );
}
