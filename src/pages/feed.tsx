import { type NextPage } from "next";

import { api } from "../utils/api";

import type { MouseEventHandler } from "react";
import { useState } from "react";

const Feed: NextPage = () => {
  const messages = api.messages.getAll.useQuery();
  const utils = api.useContext();
  const [newMessage, setNewMessage] = useState("");
  const sendMessageMutation = api.messages.postMessage.useMutation({
    onSuccess() {
      refreshMessages();
    },
  });

  const deleteMessageMutation = api.messages.messageDelete.useMutation({
    onSuccess() {
      refreshMessages();
    },
  });

  const refreshMessages = () => {
    utils.messages.getAll.invalidate();
  };

  const deleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate({ id: messageId });
  };

  const sendMessage = () => {
    sendMessageMutation.mutate({ text: newMessage });
    setNewMessage("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 ">
        <div className="text-white">Hello react</div>
        <div className="justify-left flex w-1/2 flex-row">
          <input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
            className="rounded-xl p-1"
            type="text"
          />
          <div
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            onClick={sendMessage}
          >
            Send message
          </div>
        </div>
        <div className="w-100 flex flex-col text-white">
          {messages.data?.map((message) => (
            <MessageCard
              key={message.id}
              onDelete={() => {
                deleteMessage(message.id);
              }}
              userName={message.user?.name || "Anonym"}
              text={message.text}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Feed;

const MessageCard: React.FC<{
  userName: string;
  onDelete: MouseEventHandler<HTMLDivElement>;
  text: string;
}> = (props) => {
  return (
    <div className="flex max-w-xs grow gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
      <h3 className="text-2xl font-bold">{props.userName}</h3>
      <div className="text-lg">{props.text}</div>
      <div onClick={props.onDelete}>Delete</div>
    </div>
  );
};
