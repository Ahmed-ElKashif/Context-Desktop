import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTheme, toggleTheme, ThemeType } from "../store/themeSlice";

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeType | ((prev: ThemeType) => ThemeType)) => {
    if (typeof newTheme === "function") {
      dispatch(setTheme(newTheme(theme)));
    } else {
      dispatch(setTheme(newTheme));
    }
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return { 
    theme, 
    setTheme: handleSetTheme, 
    toggleTheme: handleToggleTheme 
  };
};