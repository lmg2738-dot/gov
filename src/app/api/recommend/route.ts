import { NextResponse } from "next/server";
import { recommendGrantsWithAi } from "@/lib/ai/recommend-ai";
import type { GrantProgram, UserProfile } from "@/types";

export const dynamic = "force-dynamic";

interface RecommendBody {
  profile: UserProfile;
  grants: GrantProgram[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecommendBody;

    if (!body.profile || !Array.isArray(body.grants)) {
      return NextResponse.json(
        { error: "profile과 grants가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await recommendGrantsWithAi(body.profile, body.grants);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 추천 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
