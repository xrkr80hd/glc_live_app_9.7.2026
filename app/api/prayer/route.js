import { POST as postPrayerRequest } from "@/app/api/prayer-request/route";

export async function POST(request) {
  return postPrayerRequest(request);
}
