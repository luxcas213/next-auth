
import Logoutbutton from "@/components/logoutButton";
import Signinbutton from "@/components/signinButton";

export default function Page() {

  return (
    <>
      <h1 className="text-2xl font-bold">Home page</h1>
      <Logoutbutton />
      <Signinbutton />
    </>
  );
}