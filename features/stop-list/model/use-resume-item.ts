"use client";

import { useMutation } from "@tanstack/react-query";
import { resumeItemMutationOptions } from "./mutations";

export function useResumeItem() {
  return useMutation(resumeItemMutationOptions);
}
