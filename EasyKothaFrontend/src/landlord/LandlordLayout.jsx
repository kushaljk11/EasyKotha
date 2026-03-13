import LandlordSidebar from "./LandlordSidebar";
import LandlordTopbar from "./LandlordTopbar";

export default function LandlordLayout({ children, searchPlaceholder }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <LandlordSidebar />
      <div className="h-screen flex-1 overflow-y-auto">
        <LandlordTopbar searchPlaceholder={searchPlaceholder} />
        <main className="space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
