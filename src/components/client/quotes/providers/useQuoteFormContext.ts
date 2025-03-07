
import { useContext } from "react";
import { QuoteFormContext } from "./QuoteFormProvider";

export function useQuoteFormContext() {
  const context = useContext(QuoteFormContext);
  if (!context) {
    throw new Error("useQuoteFormContext must be used within a QuoteFormProvider");
  }
  return context;
}
