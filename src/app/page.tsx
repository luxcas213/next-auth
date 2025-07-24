
import Logoutbutton from "@/components/logoutButton";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <h1 className="text-2xl font-bold">Home page</h1>

      {session ? <Logoutbutton /> : <Link href="/login"><button className="bg-blue-500 text-white px-4 py-2 rounded">Iniciar sesión</button></Link>}
    </>
  );
}