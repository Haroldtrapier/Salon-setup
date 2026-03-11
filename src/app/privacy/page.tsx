export const metadata = {
  title: "Privacy Policy | Salon",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">Last updated: March 2026</p>

        <h2 className="text-xl font-semibold text-black mt-8">Information We Collect</h2>
        <p>
          We collect information you provide directly, such as when you create
          an account, make a purchase, book an appointment, or contact us. This
          includes your name, email address, phone number, shipping address,
          and payment information.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">How We Use Your Information</h2>
        <p>
          We use your information to process orders, manage appointments,
          communicate with you about your purchases and services, improve our
          products, and personalize your experience including custom fit
          profiles.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Data Protection</h2>
        <p>
          We implement industry-standard security measures to protect your
          personal data. Payment processing is handled securely through Shopify
          and is PCI compliant.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data
          at any time. Contact us at privacy@salon.com to make a request.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Contact</h2>
        <p>
          For privacy-related inquiries, email us at privacy@salon.com.
        </p>
      </div>
    </div>
  );
}
