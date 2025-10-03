// "use client";

// import FAQsThree from "@/components/faqs";
// import Features from "@/components/features-4";
// import Footer from "@/components/footer";
// import { HeroHeader } from "@/components/header";
// import HeroSection from "@/components/hero-section";
// import Pricing from "@/components/pricing";
// import { Button } from "@/components/ui/button";
// import { useAuth, UserButton } from "@clerk/nextjs";
// import { LoaderIcon } from "lucide-react";
// import { redirect } from "next/navigation";

// const Example = () => {
//   const { isLoaded, isSignedIn } = useAuth()

//   if (!isLoaded) {
//     return <div className="flex justify-center p-50">
//       <LoaderIcon className="animate-spin" />
//     </div>
//   }

//   if(isSignedIn) {
//     return redirect('/dashboard')
//   }

//   return (
//     <div className="relative w-full h-screen">
//       {isSignedIn ? <UserButton /> : <Button>Sign In</Button>}
//       <HeroHeader />
//       <HeroSection />
//       <Features />
//       <Pricing />
//       <FAQsThree />
//       <Footer />
//     </div>
//   )
// }

// export default Example;

import FAQsThree from "@/components/faqs";
import Features from "@/components/features-4";
import Footer from "@/components/footer";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import Pricing from "@/components/pricing";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Example() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative w-full h-screen">
      <HeroHeader />
      <HeroSection />
      <Features />
      <Pricing />
      <FAQsThree />
      <Footer />
    </div>
  );
}
