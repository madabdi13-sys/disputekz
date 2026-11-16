import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { homePathFor } from "@/lib/permissions";

// Лендинг появится позже; пока корень ведёт в рабочую зону или ко входу.
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? homePathFor(user.role) : "/login");
}
