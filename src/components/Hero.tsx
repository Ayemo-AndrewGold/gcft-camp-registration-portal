"use client";

const Hero = () => {
  return (
    <section
      id="home"
      className="w-full min-h-[38vh] sm:min-h-[50vh] md:min-h-[40vh] mt-14 sm:pt-16 md:py-28 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 text-center  bg-white dark:white text-[#0E0E1D] dark:text-[#0E0E1D]"
    >
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        <h1 className="font-[lexend] text-[24px] sm:text-[36px] md:text-[44px] xl:text-[52px] font-bold leading-tight text-[#0E0E1D] dark:text-[#0E0E1D]">
          Welcome To Glorious Christian Fellowship Tabernacle <br />
          Camp Registration Portal
        </h1>

        <p className="text-[#6D6D6D] dark:text-[#6D6D6D] font-[lexend] text-[15px] sm:text-[17px] md:text-[19px] leading-relaxed">
          Register to help us plan better for the upcoming camp meeting.
        </p>
      </div>
    </section>
  );
};

export default Hero;
