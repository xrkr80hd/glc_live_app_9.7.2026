import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { getSocialLinksContent } from "@/lib/content";

const BELIEF_GROUPS = [
  {
    title: "God and His Word",
    items: [
      {
        title: "One God",
        summary: "There is one God who eternally exists in three Persons: Father, Son, and Holy Spirit. (Matthew 28:19; Deuteronomy 6:4)",
        detail:
          "We believe in the Trinity-one God existing in three distinct Persons: God the Father, God the Son (Jesus Christ), and God the Holy Spirit. Each Person is fully God, yet there is only one God. This mystery is central to our faith and reflects the relational nature of God Himself.",
      },
      {
        title: "Scripture",
        summary: "The Bible is God's inspired, infallible Word and our final authority for faith and life. (2 Timothy 3:16-17; 2 Peter 1:20-21)",
        detail:
          "We believe the Bible, in its original manuscripts, is without error and fully trustworthy. It is God's revelation to humanity, written by human authors under the inspiration of the Holy Spirit. Scripture is our ultimate guide for what we believe and how we live.",
      },
    ],
  },
  {
    title: "Salvation",
    items: [
      {
        title: "Jesus Christ",
        summary: "Jesus is fully God and fully man, born of a virgin, lived sinlessly, died for our sins, and rose again. (John 1:1,14; 1 Corinthians 15:3-4)",
        detail:
          "Jesus Christ is the second Person of the Trinity who became human while remaining fully divine. He lived a perfect, sinless life and voluntarily died on the cross as the sacrifice for our sins. His resurrection from the dead proves His victory over sin and death, offering eternal life to all who believe.",
      },
      {
        title: "Salvation by Grace",
        summary: "We are saved by grace alone through faith alone in Christ alone-not by works. (Ephesians 2:8-9; Romans 3:23-24)",
        detail:
          "Salvation is God's free gift, not something we earn. We are saved when we place our faith in Jesus Christ, trusting Him as our Lord and Savior. Good works are the result of salvation, not the cause of it. Anyone can be saved by believing in Jesus-no matter their past.",
      },
      {
        title: "New Birth",
        summary: "When we trust Christ, we are born again by the Holy Spirit and become new creations. (John 3:3; 2 Corinthians 5:17)",
        detail:
          "Being born again means experiencing spiritual rebirth through the Holy Spirit. This is not just turning over a new leaf-it is receiving new spiritual life from God. The old life of sin is replaced with a new life in Christ, giving us both the desire and power to live for God.",
      },
    ],
  },
  {
    title: "Christian Life",
    items: [
      {
        title: "The Holy Spirit",
        summary: "The Holy Spirit indwells every believer, empowering us for holy living and spiritual gifts. (1 Corinthians 12:7; Galatians 5:22-23)",
        detail:
          "The Holy Spirit comes to live within every Christian at the moment of salvation. He guides us, teaches us truth, convicts us of sin, and empowers us to live godly lives. The Spirit also gives spiritual gifts to believers for serving God and building up the church.",
      },
      {
        title: "The Church",
        summary:
          "The church is the body of Christ-all believers united together for worship, discipleship, and mission. (1 Corinthians 12:12-27; Matthew 28:19-20)",
        detail:
          "The church is not just a building-it is the community of all people who have trusted Jesus as their Savior. We gather together to worship God, learn from His Word, encourage one another, and share the gospel with the world. Every believer is an important part of this body.",
      },
      {
        title: "Baptism & Communion",
        summary:
          "We practice believer's baptism by immersion and regular communion as acts of obedience and remembrance. (Matthew 28:19; 1 Corinthians 11:23-26)",
        detail:
          "Baptism is a public declaration of faith where a believer is immersed in water, symbolizing their death to sin and resurrection to new life in Christ. Communion (the Lord's Supper) is a regular celebration where we remember Jesus' sacrifice through bread and juice, looking forward to His return.",
      },
    ],
  },
  {
    title: "The Future",
    items: [
      {
        title: "Jesus' Return",
        summary: "Jesus will return personally and visibly to judge the living and the dead. (Acts 1:11; 2 Timothy 4:1)",
        detail:
          "We believe Jesus Christ will return to earth in the same bodily form in which He ascended to heaven. His return will be visible to all and will mark the final judgment of humanity. This blessed hope motivates us to live faithfully and share the gospel urgently.",
      },
      {
        title: "Eternal Life",
        summary: "Believers will enjoy eternal life with God; unbelievers will face eternal separation from Him. (John 3:36; Revelation 21:1-4)",
        detail:
          "Those who trust in Jesus Christ will spend eternity in the presence of God in the new heavens and new earth-a place of perfect joy, peace, and fellowship. Those who reject Christ will face eternal separation from God. This reality underscores the urgency and importance of the gospel message.",
      },
    ],
  },
];

export default async function BeliefsPage() {
  const socialLinks = await getSocialLinksContent();

  return (
    <PublicSiteShell socialLinks={socialLinks}>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04} className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#3F4D48] sm:text-4xl">Our Beliefs</h1>
            <p className="max-w-3xl text-base leading-7 text-[#3F4D48]">What we believe.</p>
          </BlurFade>

          <BlurFade inView delay={0.08}>
            <section className="space-y-3">
              {BELIEF_GROUPS.map((group, groupIndex) => (
                <details key={group.title} className="overflow-hidden border border-[#1F4D3A] bg-white" open={groupIndex === 0}>
                  <summary className="group flex cursor-pointer list-none items-center justify-between bg-[#1F4D3A] px-4 py-3 text-white sm:px-5">
                    <span className="text-base font-semibold">{group.title}</span>
                    <ChevronDown className="size-4 text-white/85 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="divide-y divide-[#E3E8E6] border-t border-[#E3E8E6] px-4 py-1 sm:px-5">
                    {group.items.map((item) => (
                      <article key={`${group.title}-${item.title}`} className="py-4">
                        <h3 className="text-lg font-semibold text-[#3F4D48]">{item.title}</h3>
                        <p className="mt-1 text-[15px] leading-7 text-[#3F4D48]">{item.summary}</p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-semibold text-[#1F4D3A]">Learn More</summary>
                          <p className="mt-2 text-[15px] leading-7 text-[#3F4D48]">{item.detail}</p>
                        </details>
                      </article>
                    ))}
                  </div>
                </details>
              ))}
            </section>
          </BlurFade>

          <BlurFade inView delay={0.12}>
            <section className="border border-[#E3E8E6] bg-white p-4 sm:p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#3F4D48]">Questions About Our Beliefs?</h2>
                <p className="text-base leading-7 text-[#3F4D48]">Questions? Reach out.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild className="h-10 rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold !text-white hover:bg-[#2E7D32] hover:!text-white">
                  <Link href="/prayer">Contact Us</Link>
                </Button>
                <Button asChild variant="secondary" className="h-10 rounded-none !border-[#1F4D3A] !bg-[#1F4D3A] px-4 text-sm font-semibold !text-white hover:!bg-[#2E7D32] hover:!text-white">
                  <Link href="/sermons">Hear Our Teaching</Link>
                </Button>
              </div>
            </section>
          </BlurFade>
        </div>
      </div>
    </PublicSiteShell>
  );
}
