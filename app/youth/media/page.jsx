import Link from "next/link";
import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getYouthEventAlbums } from "@/lib/content";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";

export const dynamic = "force-dynamic";

export default async function YouthMediaPage() {
  const albums = await getYouthEventAlbums();

  return (
    <>
      <BodyClass className="youth" />
      <ChurchHeader active="youth" youthBrand />

      <section className="bg-[linear-gradient(145deg,rgba(10,18,31,0.96)_0%,rgba(14,23,39,0.96)_100%)] pb-12">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
          <BlurFade inView delay={0.04} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b7d9ff]">Youth Media</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">LC Youth Photos and Videos</h1>
              <p className="max-w-3xl text-base leading-7 text-white/82">Feel free to browse.</p>
            </div>
            <div>
              <Link href="/youth" className="inline-flex items-center text-sm font-semibold text-[#8ee0c2] hover:text-white">
                Back to Youth
              </Link>
            </div>
          </BlurFade>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {albums.length ? (
              albums.map((album, index) => (
                <BlurFade key={album.id} inView delay={0.06 + index * 0.03}>
                  <div className="mx-auto w-full max-w-[20.5rem] sm:max-w-none">
                    <Card className="h-full overflow-hidden border border-[#66e49e]/26 bg-[#172034] py-0 shadow-sm">
                      <div className="aspect-[16/9] max-h-[190px] overflow-hidden border-b border-[#66e49e]/18 bg-[#10182a] sm:aspect-[16/10] sm:max-h-none">
                        {album.coverPhotoUrl ? (
                          <img
                            src={album.coverPhotoUrl}
                            alt={`${album.title} cover`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white/46">
                            Youth Album
                          </div>
                        )}
                      </div>
                      <CardHeader className="space-y-2 px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8ee0c2]">
                          {formatMemberDate(album.albumDate || album.createdAt, "Date coming soon")}
                        </p>
                        <CardTitle className="text-xl text-white sm:text-2xl">{album.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                        <p className="min-h-[3rem] text-sm leading-6 text-white/76">
                          {summarizeText(album.description || "Open this album to view photos and videos from the event.", 110)}
                        </p>
                        <Button asChild variant="youth" className="h-9 rounded-none px-3.5 text-sm font-semibold !text-white sm:h-10 sm:px-4">
                          <Link href={`/youth/media/${album.id}`}>Open Album</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </BlurFade>
              ))
            ) : (
              <Card className="border border-[#66e49e]/26 bg-[#172034] text-white shadow-sm sm:col-span-2 xl:col-span-3">
                <CardContent className="px-5 py-6">
                  <p className="text-white/78">Youth media albums will show up here once they are added in admin.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <ChurchSimpleFooter />
    </>
  );
}
