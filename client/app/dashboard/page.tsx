// app/page.jsx (or any server component)
import { auth, currentUser } from "@clerk/nextjs/server";
import AuthNavbar from "@/components/auth-navbar";
import ErrorPage from "@/components/Error";
import { NoAssignment } from "@/components/no-assignment";

const Page = async () => {
  const user = await currentUser();
  const { getToken } = await auth();

  const token = await getToken();

  const payload = {
    name: user?.firstName,
    email: user?.emailAddresses[0].emailAddress,
  };

  const response = await fetch("http://localhost:5000/users", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    method: "POST",
  });

  if (!response.ok) {
    return <ErrorPage />;
  }

  return (
    <div>
      <AuthNavbar />
      <NoAssignment />
    </div>
  );
};

export default Page;
