/**
 * Main page — Server Component that simply renders the Dashboard.
 * The page itself sends no JS to the client; only the Dashboard
 * client boundary does.
 */

import Dashboard from "@/components/Dashboard";

export default function Home() {
  return <Dashboard />;
}
