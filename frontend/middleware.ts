import { NextResponse } from "next/server";

// Session/route protection has moved to client-side checks in the
// (dashboard) and (workspace) layouts, which call GET /auth/me and
// redirect based on the actual role. Middleware can't do this anymore
// because tokens live in sessionStorage (so multiple tabs in the same
// browser can hold independent logins for HR/Manager/Employee at once) —
// middleware runs on the server/edge and has no access to a tab's
// sessionStorage, only to cookies. The real authorization decision still
// always happens server-side in FastAPI on every request regardless.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
