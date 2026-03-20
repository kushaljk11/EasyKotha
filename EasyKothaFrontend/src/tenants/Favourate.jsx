import TenantLayout from "./TenantLayout";

export default function Favourate() {
	return (
		<TenantLayout title="Saved Rooms">
			<div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
				<h2 className="text-xl font-bold text-slate-900">Favourites</h2>
				<p className="mt-2 text-sm text-slate-600">Rooms you saved for later will appear here.</p>
			</div>
		</TenantLayout>
	);
}
