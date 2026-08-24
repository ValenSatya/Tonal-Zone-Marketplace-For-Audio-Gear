import { redirect } from "next/navigation";

export default function BrandsRedirectPage() {
  redirect("/admin/approvals/brands");
}
