import React from "react";
import { Icon } from "../../components/ui/core/Icons";
import { IdentityForm } from "./components/IdentityForm";
import { SecurityForm } from "./components/SecurityForm";
import { AvatarUpload } from "./components/AvatarUpload";
import { useAppSelector } from "../../store/hooks";

export const ProfileFeature: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar p-4 md:p-8 bg-light-bg dark:bg-[#0A0A0C] animate-enter">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-10 pb-20">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-black text-light-text dark:text-white tracking-tight flex items-center gap-3">
            <Icon name="manage_accounts" className="text-light-primary dark:text-dark-primary text-4xl" />
            Node Operator Profile
          </h1>
          <p className="text-light-text/70 dark:text-white/60 mt-2 font-medium">
            Manage your digital identity, master key, and system preferences.
          </p>
        </div>

        {/* Identity & Avatar Card */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 shadow-sm rounded-2xl">
          {/* Header */}
          <div className="border-b border-light-border dark:border-white/5 bg-light-bg/50 dark:bg-[#121214]/50 p-6 md:px-8 rounded-t-2xl">
            <h2 className="text-lg font-bold text-light-primary dark:text-dark-primary flex items-center gap-2">
              <Icon name="fingerprint" className="text-xl" />
              Identity Core
            </h2>
            <p className="text-sm text-light-text/70 dark:text-white/70 mt-1.5 font-medium">
              Update your node's alias, public identification markers, and avatar.
            </p>
          </div>
          
          <div className="p-6 md:p-8 overflow-visible">
            <div className="flex flex-col md:flex-row gap-8">
              <AvatarUpload userAvatar={user?.avatar} />
              <IdentityForm />
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 shadow-sm rounded-2xl">
          {/* Header */}
          <div className="border-b border-light-border dark:border-white/5 bg-red-50/50 dark:bg-red-500/5 p-6 md:px-8 rounded-t-2xl">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <Icon name="security" className="text-xl" />
              Security Core
            </h2>
            <p className="text-sm text-light-text/60 dark:text-white/50 mt-1.5 font-medium">
              Modify your master access key. Changing this will disconnect all other active sessions across devices.
            </p>
          </div>

          <div className="p-6 md:p-8 overflow-visible">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-28 hidden md:block shrink-0"></div>
              <SecurityForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
