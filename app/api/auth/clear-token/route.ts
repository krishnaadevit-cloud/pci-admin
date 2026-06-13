import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/clear-token
 *
 * Deletes the HttpOnly auth_token cookie. Called in two scenarios:
 *  1. User explicitly logs out (AuthProvider.logout or AppTopbar)
 *  2. Axios 401 response interceptor receives an unauthorized error
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
