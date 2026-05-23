import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../../../components/ui/Icons";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { useIdentityForm } from "../hooks/useIdentityForm";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfile } from "../../../store/authSlice";
import { notify } from "../../../components/ui/ToastEngine";

const PERSONAS = [
  { id: "general", label: "General" },
  { id: "professional", label: "Professional" },
  { id: "student", label: "Student" },
  { id: "developer", label: "Developer" },
] as const;

export const IdentityForm: React.FC = () => {
  const { identityForm, onIdentitySubmit, isUpdatingIdentity } = useIdentityForm();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const personaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(event.target as Node)) {
        setIsPersonaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPersona = async (personaId: string) => {
    setIsPersonaDropdownOpen(false);
    try {
      await dispatch(updateProfile({ persona: personaId })).unwrap();
      notify("Semantic Persona updated", "success");
    } catch {
      notify("Failed to update persona", "error");
    }
  };

  const currentPersonaLabel = PERSONAS.find((p) => p.id === user?.persona)?.label || "general";

  return (
    <div className="flex-1">
      <Form {...identityForm}>
        <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={identityForm.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="System Admin" className="bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={identityForm.control} name="username" render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">Username</FormLabel>
                <FormControl>
                  <Input placeholder="@admin" className={`bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5 ${
                    fieldState.error ? "border-red-500 dark:border-red-500" : ""
                  }`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={identityForm.control} name="email" render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="admin@context.ai" className={`bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5 ${
                  fieldState.error ? "border-red-500 dark:border-red-500" : ""
                }`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          {/* Persona Selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-light-text/80 dark:text-white/80 mb-2">Semantic Persona</label>
            <div className="relative" ref={personaDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
                className="w-full bg-light-surface dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl text-sm font-semibold p-3 outline-none focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 text-light-text dark:text-white transition-all flex justify-between items-center group"
              >
                <span>{currentPersonaLabel}</span>
                <Icon name="expand_more" className={`text-light-text/60 dark:text-white/40 transition-transform duration-200 ${isPersonaDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isPersonaDropdownOpen && (
                <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-y-auto max-h-60 transition-all duration-200">
                  {PERSONAS.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => handleSelectPersona(p.id)}
                      className="px-4 py-3 text-sm font-semibold text-light-text dark:text-white hover:bg-light-primary/15 dark:hover:bg-dark-primary/15 hover:text-light-primary dark:hover:text-dark-primary cursor-pointer transition-colors border-b border-light-border dark:border-white/5 last:border-0"
                    >
                      {p.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isUpdatingIdentity} className="bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold px-6 py-5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
              {isUpdatingIdentity ? <Icon name="sync" className="animate-spin text-lg mr-2" /> : <Icon name="save" className="text-lg mr-2" />}
              Save Identity
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
