"use client";

import Link from "next/link";
import { useUser } from "@/lib/account";

/** Top-bar link: "Prihlásiť sa" or the account of the logged-in visitor. */
export default function AccountLink() {
  const user = useUser();
  if (user === undefined) return <span className="acct-link placeholder" aria-hidden="true" />;
  return user ? (
    <Link href="/ucet/" className="acct-link" title={user}>
      <span className="acct-dot" aria-hidden="true" />
      Môj účet
    </Link>
  ) : (
    <Link href="/ucet/" className="acct-link">
      Prihlásiť sa
    </Link>
  );
}
