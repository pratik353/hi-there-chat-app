import InputField from "@/components/form/InputField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store/store";
import { authInstance, cloudinaryUrl } from "@/services/api";
import {
  Cross,
  Delete,
  EllipsisVertical,
  PlusCircle,
  Trash,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";
import axios from "axios";
import Sheet from "@/components/ui/sheet";
import { formateDate } from "@/lib/utils";
import {
  useDeleteConversation,
  useGetConversationDetails,
} from "@/services/axiosServices";
import ConversationInfo from "@/components/ConversationInfo";
import ConversationNotFound from "@/components/ConversationNotFound";
import NoConversationSelected from "@/components/NoConversationSelected";
import NoMessageFound from "@/components/NoMessagesFound";

const MessagePage = () => {
  const params = useParams();
  const conversationId = params.id;
  const tab = location.pathname.includes("groups") ? "groups" : "chats";

  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  const { data, error, isLoading } = useGetConversationDetails(conversationId);
  const conversation = data?.data;

  console.log(error, "Error:");
  console.log(isLoading, "Loading:");

  const { mutate } = useDeleteConversation();

  const { socketInstance, onlineUsers } = useSelector(
    (state: RootState) => state.socketData
  );

  const inputRef = useRef(null);

  const [openConversationInfo, setOpenConversationInfo] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [openMediaOptions, setMediaOptions] = useState(false);

  const [mediaUrl, setMediaUrl] = useState<
    { url: string; type: "image" | "video" } | undefined
  >(undefined);

  // const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>(["new message"]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (socketInstance && conversationId) {
      const element = document.getElementById("messages");
      if (element) element.scrollTop = element?.scrollHeight;

      socketInstance?.emit("joinroom", conversationId);

      socketInstance.emit("prevmessages", conversationId);

      socketInstance.on("prevmessages", (messages) => {
        setMessages(messages);
      });
    }
  }, [socketInstance, conversationId]);

  if (!conversationId) {
    return <NoConversationSelected />;
  }

  if (error) {
    return <ConversationNotFound />;
  }

  const pickedHandler = async (event: any) => {
    let pickedFile;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      if (
        !pickedFile.type.startsWith("image/") &&
        !pickedFile.type.startsWith("video/")
      ) {
        event.target.value = "";
        setMediaUrl(undefined);
        return toast.error("Please select an image file.");
      }

      try {
        const formData = new FormData();
        formData.append("file", pickedFile);
        formData.append("upload_preset", "hi-there");
        const response = await axios.post(cloudinaryUrl, formData);

        if (pickedFile.type.startsWith("image/")) {
          setMediaUrl({ url: response.data.secure_url, type: "image" });
        } else if (pickedFile.type.startsWith("video/")) {
          setMediaUrl({ url: response.data.secure_url, type: "video" });
        }
        setOpenSheet(true);
        setMediaOptions(false);
      } catch (error) {
        toast.error(error?.message);
        console.log(error);
      }
    }
  };

  const handleUploadImage = () => {
    // accessing input with useRef hook
    if (inputRef?.current) {
      //@ts-ignore
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-y-2 ">
      {/* Header */}
      <div className="h-20 border-b flex gap-x-2 items-center bg-[#F1F2F7] p-2 rounded-2xl shadow-sm">
        <div
          className={`w-full flex items-center gap-x-2 ${tab == "groups" ? "cursor-pointer" : ""}`}
          onClick={() =>
            tab == "groups" ? setOpenConversationInfo(true) : null
          }
        >
          <div>
            <Avatar className="h-16 w-16 border">
              <AvatarImage
                src={
                  conversation?.isGroup
                    ? conversation?.groupImage
                    : conversation?.participants?.filter(
                        (u) => u._id != loggedInUser?.id
                      )[0].profilePic
                }
              />
              <AvatarFallback>
                {conversation?.isGroup
                  ? conversation?.groupName.substring(0, 2)
                  : conversation?.participants
                      ?.filter((u) => u._id != loggedInUser?.id)[0]
                      .name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="">
            <p className="text-xl font-bold">
              {conversation?.isGroup
                ? conversation?.groupName
                : conversation?.participants?.filter(
                    (u) => u._id != loggedInUser?.id
                  )[0].name}
            </p>
            {conversation?.isGroup ? (
              <p>
                {conversation?.participants
                  ?.map((u) => u.name.slice(0, 10) + "...")
                  .join(", ")}
              </p>
            ) : null}
            <p className={`${conversation?.isGroup ? "hidden" : "block"}`}>
              {onlineUsers.includes(
                conversation?.participants?.filter(
                  (u) => u._id != loggedInUser?.id
                )[0]._id
              )
                ? "online"
                : "offline"}
            </p>
          </div>
        </div>
        <div>
          <Trash
            className="cursor-pointer"
            onClick={() => {
              mutate(
                { id: conversationId },
                {
                  onError: (err) => {
                    toast.error(err.response.data.message);
                  },
                  onSuccess: (res) => {
                    if (res.data.success) {
                      navigate(
                        tab == "chats" ? "/chats/personal" : "/chats/groups"
                      );
                    }
                  },
                }
              );
            }}
          />
        </div>
      </div>
      <div className=" flex h-[calc(100vh_-_6rem)] flex-col ">
        <div className="h-full p-3 bg-white rounded-2xl flex flex-col gap-2">
          <div
            id="messages"
            className="flex-1 overflow-y-auto  scrollbar-medium"
          >
            <ul className="flex flex-col flex-grow">
              {messages.length > 0 ? messages.map((message) => {
                return (
                  <li
                    key={message._id}
                    className={`flex gap-1 items-start  ${
                      loggedInUser.id == message.sender?._id
                        ? "self-end "
                        : "self-start"
                    } my-2`}
                    key={message._id}
                  >
                    {loggedInUser.id != message.sender?._id ? (
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={message?.sender?.profilePic} />
                        <AvatarFallback>
                          {conversation?.isGroup
                            ? conversation?.groupName.substring(0, 2)
                            : conversation?.participants
                                ?.filter((u) => u._id != loggedInUser?.id)[0]
                                .name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div
                      className={`py-2 px-1 rounded-xl ${
                        loggedInUser.id == message.sender?._id
                          ? "bg-[#2680EB]"
                          : "bg-[#F5F6FA]"
                      }`}
                    >
                      {loggedInUser.id != message.sender?._id && (
                        <p>{message.sender?.name}</p>
                      )}
                      {message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          className={`h-[200px] rounded-md border-2 ${
                            loggedInUser.id == message.sender?._id
                              ? "bg-[#2680EB]"
                              : "bg-[#F5F6FA]"
                          }`}
                        />
                      ) : null}
                      {message.videoUrl ? (
                        <video
                          src={message.videoUrl}
                          controls
                          className="h-[200px]"
                        />
                      ) : null}
                      <p
                        className={`${
                          loggedInUser.id == message.sender?._id
                            ? "text-end"
                            : "text-start"
                        }`}
                      >
                        <span className="text-lg text">{message.text}</span>{" "}
                        <span className="text-sm font-light  ">
                          {formateDate(message.createdAt)}
                        </span>
                      </p>
                    </div>
                  </li>
                );
              }):(
                <NoMessageFound/>
              )}
            </ul>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <PlusCircle
                className="cursor-pointer"
                onClick={() => setMediaOptions(!openMediaOptions)}
              />
              {openMediaOptions && (
                <div className="absolute bottom-9 w-[150px] rounded-lg p-3 border bg-[#f1f2f7] shadow-sm">
                  <ul>
                    <li onClick={handleUploadImage} className="cursor-pointer">
                      Image & video
                    </li>
                  </ul>
                </div>
              )}
              <input
                ref={inputRef}
                onChange={pickedHandler}
                type="file"
                value={""}
                accept="image/*,video/mp4,video/3gpp,video/quicktime"
                style={{ display: "none" }}
              />
            </div>
            {!openSheet ? (
              <form className="flex-1 flex gap-2 justify-between">
                <InputField
                  label=""
                  placeholder="type new message"
                  className="flex-grow"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    socketInstance?.emit("newmessage", {
                      conversationId: conversationId,
                      message: newMessage,
                    });
                    setNewMessage("");
                  }}
                >
                  Send
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
      {openSheet && (
        <Sheet
          isOpen={openSheet}
          className=" bg-slate-300 w-2/3 left-1/2 -translate-x-1/2 bottom-0 rounded-t-xl p-8"
        >
          <div className="flex flex-col gap-y-4 relative ">
            <X
              className="cursor-pointer absolute right-2"
              onClick={() => {
                setMediaUrl(undefined);
                setOpenSheet(false);
              }}
            />
            <div className="h-[250px] flex justify-center">
              {mediaUrl?.type == "image" ? (
                <img src={mediaUrl.url} className="h-full" alt="" />
              ) : null}
              {mediaUrl?.type == "video" ? (
                <video src={mediaUrl.url} className="h-full" controls />
              ) : null}
            </div>
            <div className=" flex-1 flex justify-center ">
              <div className="w-2/3 flex gap-1">
                <InputField
                  label=""
                  value={newMessage}
                  placeholder="Add a caption"
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-white rounded-md"
                />
                <Button
                  onClick={() => {
                    socketInstance?.emit("newmessage", {
                      conversationId: conversationId,
                      message: newMessage,
                      type: mediaUrl?.type,
                      mediaUrl: mediaUrl?.url,
                    });
                    setNewMessage("");
                    setMediaUrl(undefined);
                    setOpenSheet(false);
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </Sheet>
      )}
      {openConversationInfo && (
        <ConversationInfo
          isOpen={openConversationInfo}
          onClose={() => setOpenConversationInfo(false)}
          data={conversation}
        />
      )}
    </div>
  );
};

export default MessagePage;
