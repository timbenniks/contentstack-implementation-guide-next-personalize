import contentstack, { QueryOperation } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { IStackSdk } from '@contentstack/live-preview-utils';
import { Page } from './types';
import Personalize from '@contentstack/personalize-edge-sdk';
import { createContext } from 'react';
import { getContentstackEndpoints, getRegionForString } from "@timbenniks/contentstack-endpoints";

const region = getRegionForString(process.env.NEXT_PUBLIC_CONTENTSTACK_REGION as string);
const endpoints = getContentstackEndpoints(region, true)

// Stack creation
export const stack = contentstack.stack({
  apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
  deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN as string,
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
  region,
  live_preview: {
    enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',
    preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN,
    host: endpoints.preview,
  }
});

// Livepreview Init
export async function initLivePreview() {
  ContentstackLivePreview.init({
    ssr: false,
    enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',
    mode: "builder",
    stackSdk: stack.config as IStackSdk,
    stackDetails: {
      apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
      environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
    },
    clientUrlParams: {
      host: endpoints.application,
    },
    editButton: {
      enable: true,
      exclude: ["outsideLivePreviewPortal"]
    },
  });
}

// Personalize context creation
const edgeApiUrl = `https://${endpoints.personalizeEdge as string}`;
const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_P13N_PROJECT_ID as string;

Personalize.setEdgeApiUrl(edgeApiUrl);
Personalize.init(projectUid);

export const PersonalizeContext = createContext(Personalize);

// Query Pages with p13n variants
export async function getPage(url: string, variantParam: any) {
  let result;

  const pageQuery = await stack
    .contentType('page')
    .entry()

  pageQuery.addParams({ include_dimension: true });
  pageQuery.addParams({ include_applied_variants: true });

  if (variantParam) {
    const variantAlias = Personalize.variantParamToVariantAliases(variantParam).join(',');
    result = await pageQuery.variants(variantAlias).query().where('url', QueryOperation.EQUALS, url).find<Page>();
  } else {
    result = await pageQuery.query().where('url', QueryOperation.EQUALS, url).find<Page>();
  }

  if (result.entries) {
    const entry = result.entries[0]

    if (process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true') {
      contentstack.Utils.addEditableTags(entry, 'page', true);
    }

    return entry;
  }
}