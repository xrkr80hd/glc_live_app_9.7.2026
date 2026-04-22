import Link from "next/link";
import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { YouthAlbumMediaGallery } from "@/components/youth/YouthAlbumMediaGallery";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getYouthEventAlbumById } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";

export const dynamic = "force-dynamic";

export default async function YouthMediaAlbumDetailPage({ params }) {
  const resolvedParams = await params;
  const albumBundle = await getYouthEventAlbumById(resolvedParams?.id);
  const album = albumBundle?.album || null;
  const photos = (albumBundle?.photos || []).filter((item) => item.photoUrl);
  const videos = albumBundle?.videos || [];

  return (
    <>
      <BodyClass className="youth" />
      <ChurchHeader active="youth" youthBrand />

      <section className="bg-[linear-gradient(145deg,rgba(10,18,31,0.96)_0%,rgba(14,23,39,0.96)_100%)] pb-12">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
          <BlurFade inView delay={0.04} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#8ee0c2]">
              <Link href="/youth" className="hover:text-white">
                Youth
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/youth/media" className="hover:text-white">
                Youth Media
              </Link>
            </div>
          </BlurFade>

          {album ? (
            <div className="mt-4 space-y-6">
              <BlurFade inView delay={0.06}>
                <Card className="max-w-4xl border border-[#66e49e]/24 bg-[#172034] text-white shadow-sm">
                  <CardHeader className="space-y-2 px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8ee0c2]">
                      {formatMemberDate(album.albumDate || album.createdAt, "Date coming soon")}
                    </p>
                    <CardTitle className="text-2xl leading-tight text-white sm:text-3xl">{album.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                    <p className="max-w-3xl text-sm leading-6 text-white/76 sm:text-base sm:leading-7">
                      {album.description || "Photos and videos from this Liberty Church Youth event."}
                    </p>
                  </CardContent>
                </Card>
              </BlurFade>

              <YouthAlbumMediaGallery albumTitle={album.title} photos={photos} videos={videos} />
            </div>
          ) : (
            <BlurFade inView delay={0.06}>
              <Card className="mt-4 border border-[#66e49e]/26 bg-[#172034] text-white shadow-sm">
                <CardContent className="space-y-4 px-5 py-6">
                  <h1 className="text-2xl font-semibold text-white">Youth album unavailable</h1>
                  <p className="text-white/78">That album could not be found. It may have been removed or is no longer published.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="youth" className="h-10 rounded-none px-4 text-sm font-semibold !text-white">
                      <Link href="/youth/media">Back to Youth Media</Link>
                    </Button>
                    <Link
                      href="/youth"
                      className="inline-flex min-h-10 items-center justify-center rounded-none border border-white/18 bg-white/6 px-4 text-sm font-semibold text-white transition hover:bg-white/12"
                    >
                      Back to Youth
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          )}
        </div>
      </section>

      <ChurchSimpleFooter />
    </>
  );
}
