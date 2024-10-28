import { NextRequest, NextResponse } from 'next/server';
import Personalize from '@contentstack/personalize-edge-sdk';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default async function middleware(request: NextRequest) {
  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_P13N_PROJECT_ID as string;
  const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION === 'EU' ? 'https://eu-personalize-edge.contentstack.com' : 'https://personalize-edge.contentstack.com'

  Personalize.setEdgeApiUrl(edgeApiUrl);

  await Personalize.init(projectUid, { request });

  const variantParam = Personalize.getVariantParam();
  const parsedUrl = new URL(request.url);

  parsedUrl.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);

  const response = NextResponse.rewrite(parsedUrl);

  await Personalize.addStateToResponse(response)

  return response;
}