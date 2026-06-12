import { Icon } from "../core/Icons";

interface RadioCardProps {
  value: string;
  title: string;
  description: string;
  icon: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export const RadioCard = ({
  value,
  title,
  description,
  icon,
  checked,
  onChange,
}: RadioCardProps) => {
  return (
    <label className="cursor-pointer relative group">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only persona-radio"
      />
      <div className="p-3 rounded-xl border border-light-border dark:border-white/10 peer-checked:border-light-primary dark:peer-checked:border-dark-primary transition-all flex items-center gap-3 bg-light-bg/50 dark:bg-white/5">
        <div className="icon w-8 h-8 rounded-full bg-light-surface dark:bg-white/10 flex items-center justify-center text-light-text dark:text-dark-text shrink-0">
          <Icon name={icon} className="text-lg" />
        </div>
        <div>
          <div className="text-sm font-bold text-light-text dark:text-white">
            {title}
          </div>
          <div className="text-[10px] font-semibold text-light-text/60 dark:text-dark-text/60">
            {description}
          </div>
        </div>
      </div>
    </label>
  );
};
