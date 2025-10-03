// app/page.jsx (or any server component)
import { auth, currentUser } from '@clerk/nextjs/server';
import AuthNavbar from '@/components/auth-navbar';
import ErrorPage from '@/components/Error';

const Page = async () => {
  const user = await currentUser();
  const { getToken } = await auth()

  const token = await getToken();

  const payload = {
    name: user?.firstName,
    email: user?.emailAddresses[0].emailAddress,
  }
  

  const response = await fetch("http://localhost:5000/users", {
    
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    method: "POST",
  });

  console.log("Response status:", response);

  if (!response.ok) {
    return <ErrorPage/>
  }

  return (
    <div>
      <AuthNavbar />
      {user ? (
        <div>
          <p>Name: {user.firstName}</p>
          <p>Email: {user.emailAddresses[0].emailAddress}</p>
        </div>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
};

export default Page;
