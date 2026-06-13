import React, { useState } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { Input } from "../../../components/ui/core/Input";
import { Button } from "../../../components/ui/core/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { useSecurityForm } from "../hooks/useSecurityForm";

export const SecurityForm: React.FC = () => {
  const { securityForm, onSecuritySubmit, isUpdatingSecurity } = useSecurityForm();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex-1">
      <Form {...securityForm}>
        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-5">
          <FormField control={securityForm.control} name="currentPassword" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">Current Master Key</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" className="bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5 pr-12" {...field} />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 text-light-text/70 hover:text-light-primary dark:text-white/50 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"><Icon name={showCurrentPassword ? "visibility_off" : "visibility"} className="text-sm" /></button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-light-border dark:border-white/5 mt-6 mb-2">
            <FormField control={securityForm.control} name="newPassword" render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">New Master Key</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" className="bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5 pr-12" {...field} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 text-light-text/70 hover:text-light-primary dark:text-white/50 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"><Icon name={showNewPassword ? "visibility_off" : "visibility"} className="text-sm" /></button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={securityForm.control} name="confirmPassword" render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-xs font-bold text-light-text/80 dark:text-white/80">Confirm New Key</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="bg-light-surface dark:bg-[#121214] border-light-border dark:border-white/10 shadow-none py-5 pr-12" {...field} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-light-text/70 hover:text-light-primary dark:text-white/50 dark:hover:text-dark-primary transition-colors focus:outline-none flex items-center justify-center"><Icon name={showConfirmPassword ? "visibility_off" : "visibility"} className="text-sm" /></button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isUpdatingSecurity} className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold px-6 py-5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm">
              {isUpdatingSecurity ? <Icon name="sync" className="animate-spin text-lg mr-2" /> : <Icon name="key" className="text-lg mr-2" />}
              Change Master Key
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
