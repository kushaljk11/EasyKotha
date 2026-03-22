import TenantSidebar from "./TenantSidebar";
import TenantTopbar from "./TenantTopbar";

export default function TenantLayout({ children }) {
	return (
		<div className="flex min-h-dvh bg-[#f8fafc]">
			<TenantSidebar />
			<div className="h-dvh flex-1 overflow-y-auto">
				<TenantTopbar />
				<main className="space-y-6 p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
