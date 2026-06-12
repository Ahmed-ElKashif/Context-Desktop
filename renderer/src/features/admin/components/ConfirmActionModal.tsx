interface ConfirmActionModalProps {
  action: "approved" | "rejected";
  username: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal = ({
  action,
  username,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) => {
  const isApproved = action === "approved";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isApproved ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <span
              className={`material-symbols-rounded text-[22px] ${
                isApproved ? "text-green-500" : "text-red-500"
              }`}
            >
              {isApproved ? "check_circle" : "cancel"}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-light-text dark:text-white">
              {isApproved ? "Approve" : "Reject"} Payment?
            </h3>
            <p className="text-xs text-light-text/50 dark:text-white/40">
              For user <span className="font-bold">@{username}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
          {isApproved
            ? "This will activate the user's subscription plan."
            : "This will reject the payment. The user can submit a new request."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-light-border dark:border-white/10 rounded-xl text-sm font-bold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
              isApproved
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : isApproved ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
