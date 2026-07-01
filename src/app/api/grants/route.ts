import { NextResponse } from "next/server";
import { fetchAllGrants } from "@/lib/api/grants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllGrants();

    if (data.grants.length === 0) {
      return NextResponse.json(
        {
          ...data,
          error: "연동된 API에서 공고를 가져오지 못했습니다.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "공고 조회 실패";
    return NextResponse.json({ error: message, grants: [], meta: null }, { status: 500 });
  }
}
