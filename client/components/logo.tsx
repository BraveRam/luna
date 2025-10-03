import Image from 'next/image';

export const Logo = () => {
  return (
    <Image
      src="/luna.png"
      priority
      alt="Luna Logo"
      width={45}
      height={45}
      className="rounded-full w-8 h-8 sm:w-11 sm:h-11"
    />
  );
};
