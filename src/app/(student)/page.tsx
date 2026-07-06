import { MyCoursesSection } from "@/features/student-dashboard";

export default function HomePage() {
  return (
    <>
      <MyCoursesSection />
      <p className="mt-12 text-center text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </>
  );
}
