"use client";

import { useMutation } from "@tanstack/react-query";
import { stopItemMutationOptions } from "./mutations";

export function useStopItem() {
  return useMutation(stopItemMutationOptions);
}
