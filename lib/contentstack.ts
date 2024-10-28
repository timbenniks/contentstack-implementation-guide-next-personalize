import contentstack, { Region, QueryOperation } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { IStackSdk } from '@contentstack/live-preview-utils';
import { Page } from './types';
import Personalize from '@contentstack/personalize-edge-sdk';
import { createContext } from 'react';

// Stack creation
export const stack = contentstack.stack({
  apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
  deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN as string,
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
  region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION === 'EU' ? Region.EU : Region.US,
  live_preview: {
    enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',
    preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN,
    host: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION === 'EU' ? 'eu-rest-preview.contentstack.com' : 'rest-preview.contentstack.com',
  }
});

// Livepreview Init
ContentstackLivePreview.init({
  ssr: false,
  enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',

  stackSdk: stack.config as IStackSdk,
  stackDetails: {
    apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
    environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
  },
  clientUrlParams: {
    host:
      process.env.NEXT_PUBLIC_CONTENTSTACK_REGION === 'EU'
        ? 'eu-app.contentstack.com'
        : 'app.contentstack.com',
  },
  editButton: {
    enable: true,
  },
});

// Personalize context creation
const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION === 'EU' ? 'https://eu-personalize-edge.contentstack.com' : 'https://personalize-edge.contentstack.com'
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

  pageQuery.addParams({ include_all: true });
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