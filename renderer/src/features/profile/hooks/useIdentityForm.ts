import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfile } from "../../../store/auth/authSlice";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { identitySchema, IdentityFormValues } from "../schemas/profileSchemas";
import { extractErrorMessage } from "../utils/errorUtils";

export const useIdentityForm = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isUpdatingIdentity, setIsUpdatingIdentity] = useState(false);

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (!user) return;

    identityForm.reset(
      {
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
      },
      {
        keepDirtyValues: true,
        keepErrors: true,
        keepTouched: true,
      },
    );
  }, [user, identityForm]);

  const onIdentitySubmit = async (data: IdentityFormValues) => {
    setIsUpdatingIdentity(true);
    notify("Updating Node Identity...", "info");
    try {
      await dispatch(updateProfile({ fullName: data.fullName, username: data.username, email: data.email })).unwrap();
      notify("Identity updated successfully", "success");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Failed to update identity");
      
      if (errorMessage.includes("username") && errorMessage.includes("already taken")) {
        identityForm.setError("username", {
          type: "manual",
          message: "This username is already taken"
        });
        notify("Username already taken", "error");
      } else if (errorMessage.includes("email") && errorMessage.includes("already taken")) {
        identityForm.setError("email", {
          type: "manual",
          message: "This email is already taken"
        });
        notify("Email already taken", "error");
      } else {
        notify(errorMessage, "error");
      }
    } finally {
      setIsUpdatingIdentity(false);
    }
  };

  return {
    identityForm,
    onIdentitySubmit,
    isUpdatingIdentity,
  };
};
