'use client';

import Image from "next/image";
import Link from "next/link";

const PreviousCamp = () => {
  return (
    <section className="w-full bg-[#F4FFED] font-[lexend] py-10 px-4 sm:px-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Heading */}
        <h1 className="text-[#000000]  text-center sm:text-start text-[1.4rem] sm:text-3xl font-semibold mb-10 lg:pl-[190px] sm:pl-20">
          Click to view Previous Camp Meetings
        </h1>

        {/* Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">

          {/* Card 1 */}
          <Link href="/pastmoment"
            className="bg-[#85C061] w-full max-w-[400px] h-[200px] flex flex-col justify-center items-center gap-4 rounded-md shadow-md px-4 py-6"
          >
            <Image
              src="/images/imagePlayIcon.svg"
              width={30}
              height={30}
              alt="Previous camp meeting"
              className="w-10 h-10"
            />
            <h2 className="text-white text-lg font-medium">
              View Past Camp Moments
            </h2>
          </Link>

          {/* Card 2 */}
          <Link
            href="/previouscampservice"
            className="bg-[#85C061] w-full max-w-[400px] h-[200px] flex flex-col justify-center items-center gap-4 rounded-md shadow-md px-4 py-6"
          >
            <Image
              src="/images/arrowDownLine.svg"
              width={30}
              height={30}
              alt="View Past Camp Moments"
              className="w-10 h-10"
            />
            <h2 className="text-white text-lg font-medium">
              Download Previous Camp Services
            </h2>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default PreviousCamp;
