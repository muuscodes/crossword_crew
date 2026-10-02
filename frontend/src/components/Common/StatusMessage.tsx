export interface Status {
  tone: "error" | "success";
  text: string;
}

const TONE_CLASSES: Record<Status["tone"], string> = {
  error: "text-red-700",
  success: "text-green-800",
};

// Inline feedback that screen readers announce. It always renders, so its space is reserved and
// the layout doesn't jump when a message appears.
export default function StatusMessage({ status, className = "" }: { status: Status | null; className?: string }) {
  return (
    <p
      role={status?.tone === "error" ? "alert" : "status"}
      className={`min-h-7 text-xl ${status ? TONE_CLASSES[status.tone] : ""} ${className}`}
    >
      {status?.text ?? ""}
    </p>
  );
}
