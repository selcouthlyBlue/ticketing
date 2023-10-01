import { useRouter } from "next/navigation";
import useRequest from "../../hooks/useRequest";
import { useEffect } from "react";

export default function Signout() {
  const router = useRouter();

  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => {
      router.push("/");
    },
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing Out</div>;
}
