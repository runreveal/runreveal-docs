// Commenting out middleware since it's not needed for static export
// and causes compatibility issues with Cloudflare Pages

/*
import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/
        // - favicon.ico (favicon file)
        '/((?!api|_next/|favicon.ico).*)',
    ],
}

export default function middleware(req: NextRequest) {
    const orig = req.nextUrl.pathname;
    const lowcase = orig.toLowerCase();
    if (orig !== lowcase) {
        return NextResponse.redirect(new URL(req.nextUrl.origin + req.nextUrl.pathname.toLowerCase()));
    }
    return NextResponse.next();
}
*/

// Exporting an empty config to avoid errors
export const config = {
    matcher: []
}

// No-op middleware
export default function middleware() {
    // Do nothing
}
