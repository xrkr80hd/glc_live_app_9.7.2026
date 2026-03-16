export const memberBeliefGroups = [
  {
    id: "god-and-word",
    title: "God and His Word",
    items: [
      {
        id: "one-god",
        title: "One God",
        summary:
          "There is one God who eternally exists in three Persons: Father, Son, and Holy Spirit. (Matthew 28:19; Deuteronomy 6:4)",
        detail:
          "We believe in the Trinity: one God existing in three distinct Persons. God the Father, God the Son, and God the Holy Spirit are each fully God, yet there is only one God.",
      },
      {
        id: "scripture",
        title: "Scripture",
        summary:
          "The Bible is God's inspired, infallible Word and our final authority for faith and life. (2 Timothy 3:16-17; 2 Peter 1:20-21)",
        detail:
          "We believe the Bible is fully trustworthy and is God's revelation to humanity. Scripture guides what we believe and how we live.",
      },
    ],
  },
  {
    id: "salvation",
    title: "Salvation",
    items: [
      {
        id: "jesus-christ",
        title: "Jesus Christ",
        summary:
          "Jesus is fully God and fully man, born of a virgin, lived sinlessly, died for our sins, and rose again. (John 1:1,14; 1 Corinthians 15:3-4)",
        detail:
          "Jesus Christ became human while remaining fully divine. He lived a perfect life, died in our place, and rose again so we could be saved.",
      },
      {
        id: "salvation-by-grace",
        title: "Salvation by Grace",
        summary:
          "We are saved by grace alone through faith alone in Christ alone, not by works. (Ephesians 2:8-9; Romans 3:23-24)",
        detail:
          "Salvation is God's free gift. Good works do not earn it. We are saved when we trust Jesus as Savior and Lord.",
      },
      {
        id: "new-birth",
        title: "New Birth",
        summary:
          "When we trust Christ, we are born again by the Holy Spirit and become new creations. (John 3:3; 2 Corinthians 5:17)",
        detail:
          "Following Jesus is more than self-improvement. It is a new life given by God through the Holy Spirit.",
      },
    ],
  },
  {
    id: "christian-life",
    title: "Christian Life",
    items: [
      {
        id: "holy-spirit",
        title: "The Holy Spirit",
        summary:
          "The Holy Spirit indwells every believer, empowering us for holy living and spiritual gifts. (1 Corinthians 12:7; Galatians 5:22-23)",
        detail:
          "The Holy Spirit guides us, teaches us truth, convicts us of sin, and empowers us to live for God.",
      },
      {
        id: "the-church",
        title: "The Church",
        summary:
          "The church is the body of Christ: all believers united together for worship, discipleship, and mission. (1 Corinthians 12:12-27; Matthew 28:19-20)",
        detail:
          "The church is not just a building. It is the gathered people of God worshiping, growing, caring for one another, and reaching the world with the gospel.",
      },
      {
        id: "baptism-communion",
        title: "Baptism and Communion",
        summary:
          "We practice believer's baptism by immersion and regular communion as acts of obedience and remembrance. (Matthew 28:19; 1 Corinthians 11:23-26)",
        detail:
          "Baptism is a public declaration of faith, and communion is a regular remembrance of Jesus' sacrifice and promised return.",
      },
    ],
  },
  {
    id: "future",
    title: "The Future",
    items: [
      {
        id: "return-of-jesus",
        title: "Jesus' Return",
        summary:
          "Jesus will return personally and visibly to judge the living and the dead. (Acts 1:11; 2 Timothy 4:1)",
        detail:
          "We believe Jesus will return bodily and visibly. This blessed hope moves us to live faithfully and share the gospel urgently.",
      },
      {
        id: "eternal-life",
        title: "Eternal Life",
        summary:
          "Believers will enjoy eternal life with God; unbelievers will face eternal separation from Him. (John 3:36; Revelation 21:1-4)",
        detail:
          "Those who trust Christ will be with God forever in His restored kingdom. This gives weight and urgency to the gospel.",
      },
    ],
  },
];

export function formatMemberDate(value, fallback = "Church Update") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function summarizeText(value, maxLength = 120) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}
