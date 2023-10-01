import { useState } from "react";
import { useRouter } from "next/navigation";
import useRequest from "../../hooks/useRequest";
import CredentialsForm from "../components/CredentialsForm";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    body: {
      email,
      password,
    },
    method: "post",
    onSuccess: () => {
      setEmail("");
      setPassword("");
      router.push("/");
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    doRequest();
  };

  return (
    <>
      <h1>Sign In</h1>
      <CredentialsForm
        email={email}
        onChangeEmail={(e) => setEmail(e.target.value)}
        password={password}
        onChangePassword={(e) => setPassword(e.target.value)}
        onSubmit={onSubmit}
        errors={errors}
      />
    </>
  );
}
