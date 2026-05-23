import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "../../../store/hooks";
import { updateProfile } from "../../../store/authSlice";
import { notify } from "../../../components/ui/ToastEngine";
import { securitySchema, SecurityFormValues } from "../schemas/profileSchemas";
import { extractErrorMessage } from "../utils/errorUtils";

export const useSecurityForm = () => {
  const dispatch = useAppDispatch();
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSecuritySubmit = async (data: SecurityFormValues) => {
    setIsUpdatingSecurity(true);
    notify("Verifying security protocol...", "info");
    securityForm.clearErrors(["currentPassword", "newPassword"]);
    try {
      await dispatch(
        updateProfile({
          currentPassword: data.currentPassword,
          password: data.newPassword,
        }),
      ).unwrap();
      notify("Master key updated successfully", "success");
      securityForm.reset();
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Failed to update master key");
      if (errorMessage.toLowerCase().includes("current") && errorMessage.toLowerCase().includes("incorrect")) {
        securityForm.setError("currentPassword", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        securityForm.setError("newPassword", {
          type: "manual",
          message: errorMessage,
        });
      }
      notify(errorMessage, "error");
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  return {
    securityForm,
    onSecuritySubmit,
    isUpdatingSecurity,
  };
};
