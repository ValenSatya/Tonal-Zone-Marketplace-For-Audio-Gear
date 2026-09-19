import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const response = NextResponse.redirect(new URL("/login?reset=success", request.url));
  
  for (const cookie of allCookies) {
    if (
      cookie.name === "tonalzone_session" ||
      cookie.name.startsWith("sb-") ||
      cookie.name.includes("auth")
    ) {
      response.cookies.delete(cookie.name);
    }
  }

  return response;
}
