import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List with us",
  description:
    "List a hotel, lodge, guest house, travel agency or cruise operation on letxNepal, or submit a hidden destination.",
};

export default function ListWithUsPage() {
  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground">List with us</h1>
        <p className="mt-md text-base text-muted-foreground">
          letxNepal is built for the people who run tourism in Nepal. Listing is free. You control your
          own prices, availability and content, and you appear alongside the destinations you serve.
        </p>
      </header>

      <ul className="grid gap-md lg:grid-cols-2">
        {[
          {
            title: "Hotel, lodge or guest house",
            body: "List your property, set daily room availability and prices, and appear in the destination pages you serve. Remote lodges are actively promoted.",
          },
          {
            title: "Travel agency or cruise operator",
            body: "List your agency and publish ready-made packages, or contribute pay-as-you-go options.",
          },
          {
            title: "Guide",
            body: "Create a profile with your contact details, languages and experience, and publish articles to the journal.",
          },
          {
            title: "Community or district coordinator",
            body: "Submit a destination that has no listing yet. Submissions are reviewed before publication, and new districts are flagged as coverage gaps.",
          },
        ].map((item) => (
          <li key={item.title} className="card">
            <h2 className="text-lg font-semibold text-card-foreground">{item.title}</h2>
            <p className="mt-xs text-sm text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-card-foreground">How to start</h2>
        <p className="mt-xs text-sm text-muted-foreground">
          Account creation and the partner dashboard are in progress. Until then, email{" "}
          <a
            href="mailto:partners@letxnepal.local"
            className="text-primary underline-offset-4 hover:underline"
          >
            partners@letxnepal.local
          </a>{" "}
          with your property name, district and contact details.
        </p>
        <p className="mt-sm text-sm text-muted-foreground">
          <Link href="/coverage" className="text-primary underline-offset-4 hover:underline">
            See which districts have no listing yet
          </Link>{" "}
          — those are the places where a new listing makes the biggest difference.
        </p>
      </div>
    </div>
  );
}
