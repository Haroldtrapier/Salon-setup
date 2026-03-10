export const metadata = {
  title: "Returns & Exchanges | Salon",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Returns & Exchanges</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <h2 className="text-xl font-semibold text-black mt-8">30-Day Return Policy</h2>
        <p>
          We want you to love your nails. If you&apos;re not completely
          satisfied, you can return unused, unopened products within 30 days of
          delivery for a full refund.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Custom Fit Exchanges</h2>
        <p>
          Custom-fit sets are made specifically for you. While we can&apos;t
          accept returns on custom orders, we offer free exchanges if the fit
          isn&apos;t perfect. Contact us and we&apos;ll create a new set at no
          additional cost.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">How to Return</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Email returns@salon.com with your order number</li>
          <li>We&apos;ll send you a prepaid return label</li>
          <li>Ship the items back in original packaging</li>
          <li>Refund processed within 5-7 business days of receipt</li>
        </ol>

        <h2 className="text-xl font-semibold text-black mt-8">Damaged Items</h2>
        <p>
          If your order arrives damaged, contact us within 48 hours with photos
          and we&apos;ll send a replacement immediately at no charge.
        </p>
      </div>
    </div>
  );
}
