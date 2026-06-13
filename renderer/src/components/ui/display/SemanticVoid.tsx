import { Icon } from "../core/Icons";

interface SemanticVoidProps {
  errorCode: string;
  title: string;
  description: string;
  logs: string[];
  actionLabel?: string;
  actionLink?: string;
}

export const SemanticVoid = ({
  errorCode,
  title,
  description,
  logs,
  actionLabel = "Reboot Engine",
  actionLink = "/dashboard",
}: SemanticVoidProps) => {
  return (
    <main className="relative z-[9999] flex flex-col items-center justify-center w-full min-h-screen max-w-2xl p-6 mx-auto bg-light-bg dark:bg-[#0A0A0C]">
      {/* Giant Background Error Code */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -z-10">
        <h1 className="text-[12rem] md:text-[18rem] font-black text-light-border dark:text-white/5 leading-none tracking-tighter mix-blend-multiply dark:mix-blend-screen font-display">
          {errorCode}
        </h1>
      </div>

      <div className="bg-light-surface/95 dark:bg-dark-surface/95 border border-light-border dark:border-dark-border rounded-3xl shadow-2xl p-8 md:p-12 w-full flex flex-col items-center text-center backdrop-blur-xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 dark:via-red-500 to-transparent opacity-60"></div>

        {/* Glitch SVG */}
        <div className="w-32 h-32 mb-8 text-red-500 dark:text-red-500 animate-glitch-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M25 25 C 25 25, 40 45, 50 50"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeLinecap="round"
              className="dash-flow"
            />
            <path
              d="M75 25 C 75 25, 60 45, 50 50"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeLinecap="round"
              className="dash-flow"
            />
            <path
              d="M50 80 C 50 80, 50 65, 50 50"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeLinecap="round"
              className="dash-flow"
            />
            <circle
              cx="25"
              cy="25"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <circle
              cx="75"
              cy="25"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <circle
              cx="50"
              cy="80"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <circle
              cx="50"
              cy="50"
              r="12"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="dash-flow"
            />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-light-text dark:text-white mb-3">
          {title}
        </h2>
        <p className="text-sm md:text-base text-light-text/70 dark:text-dark-text/70 font-medium max-w-sm mb-8">
          {description}
        </p>

        {/* System Terminal Log */}
        <div className="w-full bg-light-bg dark:bg-[#0B0B0D] border border-light-border dark:border-white/10 rounded-xl p-5 text-left font-mono text-xs mb-8 shadow-inner overflow-hidden transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3 border-b border-light-border dark:border-white/10 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-light-border dark:bg-white/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-light-border dark:bg-white/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <span className="ml-2 text-light-text/50 dark:text-white/40 tracking-widest uppercase font-bold">
              System.Log
            </span>
          </div>
          <div className="space-y-2 text-light-text/80 dark:text-white/80 font-medium">
            {logs.map((log, i) => {
              if (log.startsWith("[ERR")) {
                return (
                  <p
                    key={i}
                    className="text-red-600 dark:text-red-500 font-bold mt-2 overflow-hidden whitespace-nowrap animate-typewriter bg-red-50 dark:bg-red-500/10 inline-block px-2 py-0.5 rounded"
                  >
                    {log}
                  </p>
                );
              }
              return (
                <p key={i}>
                  <span className="text-light-primary dark:text-dark-primary font-bold">{`>`}</span>{" "}
                  {log}
                </p>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
          <a
            href={actionLink}
            onClick={() => {
              if (
                actionLink === window.location.pathname ||
                actionLink === "#"
              ) {
                window.location.reload();
              }
            }}
            className="bg-light-primary dark:bg-dark-primary text-white dark:text-black px-8 py-3.5 rounded-xl font-black font-mono text-sm tracking-widest uppercase shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="power_settings_new" className="text-[18px]" />{" "}
            {actionLabel}
          </a>
        </div>
      </div>
    </main>
  );
};
