export const getTagColorClass = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("urgent") || t.includes("high") || t.includes("important")) {
    return "bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/20";
  }
  if (t.includes("legal") || t.includes("contract") || t.includes("law")) {
    return "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/20";
  }
  if (t.includes("finance") || t.includes("invoice") || t.includes("paid")) {
    return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20";
  }
  if (t.includes("hr") || t.includes("resume")) {
    return "bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/20";
  }
  
  // Hash function to pick a consistent color
  const colors = [
    "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20",
    "bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
    "bg-pink-100 dark:bg-pink-500/10 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-500/20",
    "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20",
    "bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
