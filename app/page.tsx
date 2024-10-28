"use client";

import Image from "next/image";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import { getPage, PersonalizeContext } from "@/lib/contentstack";
import { useContext, useEffect, useState } from "react";
import { Page } from "@/lib/types";
import Personalize from "@contentstack/personalize-edge-sdk";
import PersonalizeButton from "./components/PersonalizeButton";

export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [page, setPage] = useState<Page>();

  const variantParam = decodeURIComponent(
    searchParams[Personalize.VARIANT_QUERY_PARAM]
  );

  const getContent = async () => {
    const page = await getPage("/", variantParam);
    setPage(page);
  };

  const PersonalizeInstance = useContext(PersonalizeContext);

  useEffect(() => {
    ContentstackLivePreview.onEntryChange(getContent);

    // send Personalize analytics impression for the experience with shortID '0'.
    // see: Contentstack Dashboard > Personalize project > Experiences > Experience
    PersonalizeInstance.triggerImpression("0");
  }, []);

  const debug = {
    variantParam,
    variantAlias:
      Personalize.variantParamToVariantAliases(variantParam).join(","),
  };

  return (
    <main className="max-w-screen-2xl mx-auto">
      <section className="p-4">
        {variantParam ? (
          <div className="mb-8">
            <p>Some debug info</p>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </div>
        ) : null}

        <div className="mb-8 space-y-4">
          <PersonalizeButton type="Marketer" />
          <PersonalizeButton type="Developer" />
          <PersonalizeButton type="Reset" />
        </div>

        {page?.title ? (
          <h1
            className="text-4xl font-bold mb-4"
            {...(page?.$ && page?.$.title)}
          >
            {page?.title}
          </h1>
        ) : null}

        {page?.description ? (
          <p className="mb-4" {...(page?.$ && page?.$.description)}>
            {page?.description}
          </p>
        ) : null}

        {page?.image ? (
          <Image
            className="mb-4"
            width={600}
            height={600}
            src={page?.image.url}
            alt={page?.image.title}
            {...(page?.image?.$ && page?.image?.$.url)}
          />
        ) : null}

        {page?.rich_text ? (
          <div
            {...(page?.$ && page?.$.rich_text)}
            dangerouslySetInnerHTML={{ __html: page?.rich_text }}
          />
        ) : null}
      </section>
    </main>
  );
}
