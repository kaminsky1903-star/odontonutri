import { useEffect } from "react";
import { attachClickTracking, recordVisitAndPageView } from "./track";

export function usePublicAnalytics(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    recordVisitAndPageView();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    return attachClickTracking();
  }, [enabled]);
}
