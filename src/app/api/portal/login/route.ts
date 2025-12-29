import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // 2️⃣ Replace with real DB check
    if (
      email !== process.env.PORTAL_TEST_EMAIL ||
      password !== process.env.PORTAL_TEST_PASSWORD
    ) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3️⃣ Set portal cookie
    (await cookies()).set("portal_token", "secure_portal_token", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
