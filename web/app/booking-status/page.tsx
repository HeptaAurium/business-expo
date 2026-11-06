import StatusLookup from "./StatusLookup";

export const metadata = {
    title: "Track Your Booking — St. Joseph Mukasa Business Expo 2026",
};

export default function BookingStatusPage() {
    return (
        <main className="mx-auto max-w-md px-6 py-10">
            <h1
                className="text-2xl font-bold"
                style={{ color: "var(--brand-primary)" }}
            >
                Track Your Booking
            </h1>
            <p className="mb-6 mt-1 text-sm" style={{ color: "var(--brand-muted)" }}>
                Enter the phone number and email you used when booking.
            </p>
            <StatusLookup />
        </main>
    );
}