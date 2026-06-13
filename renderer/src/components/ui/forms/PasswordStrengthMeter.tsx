interface PasswordStrengthMeterProps {
  passwordValue: string;
}

export const PasswordStrengthMeter = ({
  passwordValue,
}: PasswordStrengthMeterProps) => {
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

  return (
    <>
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

      <div className="mt-2 text-[10px] text-light-text/60 dark:text-white/40 flex flex-col gap-1 px-1 font-medium">
        <div className="flex items-center gap-1.5">
          <span
            className={`material-symbols-rounded text-[12px] ${passwordValue.length >= 8 ? "text-emerald-500" : ""}`}
          >
            {passwordValue.length >= 8
              ? "check_circle"
              : "radio_button_unchecked"}
          </span>
          <span className={passwordValue.length >= 8 ? "text-emerald-500" : ""}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`material-symbols-rounded text-[12px] ${/[A-Z]/.test(passwordValue) ? "text-emerald-500" : ""}`}
          >
            {/[A-Z]/.test(passwordValue)
              ? "check_circle"
              : "radio_button_unchecked"}
          </span>
          <span
            className={/[A-Z]/.test(passwordValue) ? "text-emerald-500" : ""}
          >
            At least 1 uppercase letter
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`material-symbols-rounded text-[12px] ${/[0-9]/.test(passwordValue) ? "text-emerald-500" : ""}`}
          >
            {/[0-9]/.test(passwordValue)
              ? "check_circle"
              : "radio_button_unchecked"}
          </span>
          <span
            className={/[0-9]/.test(passwordValue) ? "text-emerald-500" : ""}
          >
            At least 1 number
          </span>
        </div>
      </div>
    </>
  );
};
