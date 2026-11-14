export const metadata = { title: { absolute: "Thanks — your quote request is in | Custom Patches Arizona" }, robots: "noindex" };

export default function ThankYou() {
  return (
    <main id="main">
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Request received</span>
          <h1 className="h-display" style={{ marginTop: 12 }}>Thank you</h1>
          <p className="lede">Your quote request is in. We'll email your price and free digital mockup shortly, usually within one business day. Check your spam folder if you don't see it.</p>
          <div className="btn-row" style={{ marginTop: 28 }}>
            <a className="btn btn--copper" href="/custom-patches/">See all patch types</a>
            <a className="btn btn--ghost" href="/iron-on-instructions/">Iron-on guide</a>
          </div>
        </div>
      </section>
    </main>
  );
}
