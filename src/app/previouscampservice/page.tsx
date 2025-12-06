"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PreviousCampService = () => {
  const videos = [
     
    { title: "IBADAN CAMP MEETING WELCOME SERVICE (FRIDAY, DECEMBER 22, 2023)", topic: "Morning Session", url: "https://www.youtube.com/embed/0N7Nt3DimyA?si=KOglopaw-fWS-qi0", year: 2023 },
    { title: "DECEMBER CONVENTION, 2023 DAY 1 SONG SERVICE (SAT, DEC 22, 2023)", topic: "Afternoon Session", url: "https://www.youtube.com/embed/aCAZPfYKfHo?si=EpKXGhQh8OyD7cts", year: 2023 },
    { title: "HOW WILL THE BRIDEGROOM MEET YOU? (DEC CONVENTION, 2023 DAY 1 MORNING SERVICE . SAT, DEC 23, 2023)", topic: "Evening Session", url: "https://www.youtube.com/embed/QlE0ZUQREYs?si=4KfzEYFOJExXdSRT", year: 2023 },
    { title: "3 STAGES OF OUR TRANSLATION (DECEMBER CONVENTION, DAY 2, MORNING SERVICE, DECEMBER 24, 2023)", topic: "Morning Session", url: "https://www.youtube.com/embed/jJA4iKAnY9k?si=YWqAdVu_oB_VtTAz", year: 2023 },
    { title: "THE FAITH WE CONTEND FOR (DECEMBER CONVENTION, DAY 2, AFTERNOON SERVICE, DECEMBER 24, 2023)", topic: "Afternoon Session", url: "https://www.youtube.com/embed/FRzCMivBcWk?si=uP-0cmdtg2IcaJP2", year: 2023 },
    { title: "THOSE THAT ARE READY (DECEMBER CONVENTION, DAY 2, EVENING SERVICE, DECEMBER 24, 2023)", topic: "Evening Session", url: "https://www.youtube.com/embed/CgailGiOxhA?si=hTt4a1lvXLZEV4E_", year: 2023 },
    { title: "THE TWO KNGDOMS {DEC CONVENTION, DAY 3, MORNING SERVICE, DECEMBER 25, 2023}", topic: "Morning Session", url: "https://www.youtube.com/embed/3W-OAD2UVm0?si=bT_scYDGAwJCVf5M", year: 2023 },
    { title: "BEHOLD THE BRIDEGROOM COMETH: THE URGENCY OF THE HOUR (DECEMBER CONVENTION, DECEMBER 23, 2023)", topic: "Afternoon Session", url: "https://www.youtube.com/embed/vxeflZVgXcc?si=kgofjclM_50EbHtb", year: 2023 },
    { title: "THE CYCLE OF SIN (DECEMBER 2023 CONVENTION, DAY 3, EVENING SERVICE DEC 25, 2023)", topic: "Evening Session", url: "https://www.youtube.com/embed/HX9yNrCrGoY?si=VUjczaAZ3swqJkyJ", year: 2023 },
    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH (EASTER 2024 CAMP MEETING, MARCH 28, 2024)", topic: "Evening Session", url: "https://www.youtube.com/embed/VxObEp3gOgw?si=0j-ObOY3VMsQ8y9j", year: 2024 },
    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH ( EASTER 2024 CAMP MEETING, MARCH 29, 2024)", topic: "Morning Session", url: "https://www.youtube.com/embed/um9RFlpgLFo?si=nNqZzl-TMlUKhedE ", year: 2024 },
    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH, THANKSGIVING (SUNDAY, MARCH 31, 2024)", topic: "Evening Session", url: "https://www.youtube.com/embed/8gpkZ4fbfzc?si=vM5tpAQsglYCOUDd", year: 2024 },

    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH, THANKSGIVING (SUNDAY, MARCH 31, 2024)", topic: "Evening Session", url: "https://www.youtube.com/embed/8gpkZ4fbfzc?si=3XQEUGovI-J2M23X", year: 2024 },
    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH, THANKSGIVING (SUNDAY, MARCH 31, 2024)", topic: "Evening Session", url: "https://www.youtube.com/embed/8gpkZ4fbfzc?si=vM5tpAQsglYCOUDd", year: 2024 },
    { title: "CELEBRATION OF THE LIFE AND TIMES OF PASTOR BILLY JOSEPH, THANKSGIVING (SUNDAY, MARCH 31, 2024)", topic: "Evening Session", url: "https://www.youtube.com/embed/8gpkZ4fbfzc?si=vM5tpAQsglYCOUDd", year: 2024 },
        { title: "VOW FOR BLESSING", topic: "Evening Session", url: "https://www.youtube.com/embed/80fFvFvai7g?si=pCNBv9s3NR_v3AbV", year: 2024 },
  ];
  
  const audios = [
    { title: "Faith Comes By Hearing", speaker: "Pastor John", url: "/audio/faith.mp3", year: 2023 },
    { title: "The Power of Worship", speaker: "Choir Session", url: "/audio/worship.mp3", year: 2023 },
    { title: "Walking in the Spirit", speaker: "Rev. Samuel", url: "/audio/spirit.mp3", year: 2023 },
    { title: "New Beginnings 2025", speaker: "Pastor John", url: "/audio/newbeginnings.mp3", year: 2025 }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const topics = ["All", "Audio Only", ...Array.from(new Set(videos.map((v) => v.topic)))];
  const years = ["All", ...Array.from(new Set(videos.map((v) => v.year)))];

  const filteredVideos =
    filterTopic === "Audio Only"
      ? []
      : videos.filter((video) => {
          const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesTopic = filterTopic === "All" || video.topic === filterTopic;
          const matchesYear = selectedYear === "All" || video.year === selectedYear;
          return matchesSearch && matchesTopic && matchesYear;
        });

  const filteredAudios = audios.filter(audio => selectedYear === "All" || audio.year === selectedYear);
  const showAudios = filterTopic === "All" || filterTopic === "Audio Only";

  // Pagination logic
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirst, indexOfLast);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Mobile-friendly YouTube embed without autoplay issues **/
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get("v");
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      return v ? `https://www.youtube.com/embed/${v}${isMobile ? "" : "?autoplay=1"}` : url;
    } catch {
      return url;
    }
  };

  return (
    <section className="w-full bg-white font-[lexend] bg-white dark:white text-[#0E0E1D] dark:text-[#0E0E1D]">
      <div className="sm:px-10 lg:px-20 px-5 pt-25 mb-10">
        <Header />

        {/* HERO */}
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold bg-linear-to-r from-green-700 to-lime-400 bg-clip-text text-transparent">
            Previous Camp Services
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Watch powerful teachings and listen to impactful audio messages from past camp meetings.
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg border border-gray-200 py-6 px-6 rounded-2xl mb-14">
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Search for a message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-140 px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-600 outline-none"
            />

            <div className="flex gap-3 flex-wrap mt-3 lg:mt-0">
              {topics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => setFilterTopic(topic)}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-full text-sm font-medium transition-all ${
                    filterTopic === topic ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap mt-3 lg:mt-0">
              {years.map((year, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedYear(year === "All" ? "All" : Number(year))}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-full text-sm font-medium transition-all ${
                    selectedYear === year ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIDEO SECTION */}
        {currentVideos.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🎥 Video Messages</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-6">
              {currentVideos.map((video, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1"
                >
                  <iframe
                    src={getEmbedUrl(video.url)}
                    className="w-full h-[230px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                    <p className="text-green-700 font-medium mt-1">{video.topic}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => handlePageClick(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageClick(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageClick(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* AUDIO SECTION */}
        {showAudios && (
          <>
            <div className="mb-6 pt-15">
              <h2 className="text-2xl font-bold text-gray-800">🎧 Audio Messages</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredAudios.map((audio, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{audio.title}</h3>
                  <p className="text-green-700 text-sm mb-4">{audio.speaker}</p>

                  <audio controls className="w-full mb-4">
                    <source src={audio.url} type="audio/mp3" />
                  </audio>

                  <a
                    href={audio.url}
                    download
                    className="flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition"
                  >
                    <Download size={18} /> Download Audio
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </section>
  );
};

export default PreviousCampService;
