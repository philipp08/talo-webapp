import MemberDetailPage from "./MemberDetailClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <MemberDetailPage />;
}
