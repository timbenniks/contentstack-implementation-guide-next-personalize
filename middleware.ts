import { NextRequest, NextResponse } from 'next/server';
import Personalize from '@contentstack/personalize-edge-sdk';
import { getContentstackEndpoints, getRegionForString } from "@timbenniks/contentstack-endpoints";

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default async function middleware(request: NextRequest) {
  const region = getRegionForString(process.env.NEXT_PUBLIC_CONTENTSTACK_REGION as string);
  const endpoints = getContentstackEndpoints(region, true)
  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_P13N_PROJECT_ID as string;
  const edgeApiUrl = `https://${endpoints.personalizeEdge as string}`;

  Personalize.setEdgeApiUrl(edgeApiUrl);

  const personalizeSdk = await Personalize.init(projectUid, { request });
  const variantParam = personalizeSdk.getVariantParam();
  const parsedUrl = new URL(request.url);

  parsedUrl.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);

  const response = NextResponse.rewrite(parsedUrl);

  await personalizeSdk.addStateToResponse(response)

  return response;
}