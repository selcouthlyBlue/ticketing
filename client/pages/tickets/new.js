import { useRouter } from "next/navigation";
import useRequest from "../../hooks/useRequest";
import { useState } from "react";
import TicketForm from "../components/TicketForm";

export default function NewTicket({ currentUser }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    body: {
      title,
      price
    },
    method: "post",
    onSuccess: () => {
      setTitle("");
      setPrice(0);
      router.push("/");
    },
  });

  if (!currentUser) {
    return <h1>You are not signed in</h1>
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    doRequest();
  };

  return (
    <>
      <h1>Create a Ticket</h1>
      <TicketForm 
        errors={errors}
        onChangePrice={(newPrice) => {setPrice(newPrice)}}
        onChangeTitle={(newTitle) => {setTitle(newTitle)}}
        onSubmit={onSubmit}
        price={price}
        title={title}
      />
    </>
  );
}
