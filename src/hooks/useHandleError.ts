import React from "react";
import { Database } from "@utilities/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useErrorModal } from "@components/store";

type Errors = Database["public"]["Tables"]["errors"]["Row"];

export const useHandleError = () => {
  const supabase = useSupabaseClient<Errors>();
  const { setErrorMessage, setDisplayErrorModal } = useErrorModal();
  const captureError = async (err: PostgrestError, email?: string) => {
    const errorData: Partial<Errors> = {
      ...err,
      email: email ?? null,
    };
    setErrorMessage(errorData.message ?? "");
    setDisplayErrorModal();

    const { data, error } = await supabase.from("errors").insert(errorData);
  };
  return { captureError };
};
