import CreateConversationForm from "@/components/CreateConversationForm";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TooltipComponent from "@/components/ui/TooltipComponent";
import EditInfo from "@/components/UserInfo";
import { setOnlineUsers, setSocketInstance } from "@/redux/slice/socketSlice";
import { RootState } from "@/redux/store/store";
import { socketUrl } from "@/services/api";
import {
  useGetUserConversations,
  useGetUserDetails,
} from "@/services/axiosServices";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { TooltipContent } from "@radix-ui/react-tooltip";
import {
  LogOutIcon,
  MessageSquarePlus,
  MessagesSquare,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { io } from "socket.io-client";

export const SIDEBAR_WIDTH = "20rem";

export default function Layout() {
  const location = useLocation();

  const tab = location.pathname.includes("groups") ? "groups" : "chats";
  const isGroup = tab === "groups";
  const isChat = tab === "chats";

  const params = useParams();
  const conversationId = params.id;

  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { socketInstance, onlineUsers } = useSelector(
    (state: RootState) => state.socketData
  );

  const { data } = useGetUserConversations(tab);
  const { data: userDetails } = useGetUserDetails();

  const [open, setOpen] = useState(false);
  const [openUserInfo, setOpenUserInfo] = useState(false);

  useEffect(() => {
    (function setupWebsocket() {
      const socketConnection = io(socketUrl, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });
      dispatch(setSocketInstance(socketConnection));
    })();
  }, []);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("onlineusers", (data) => {
        dispatch(setOnlineUsers(data));
      });
    }
  }, [socketInstance]);

  return (
    <>
      <div className="flex bg-[#F5F6FA] gap-x-2 ">
        <aside className={`w-[26rem] h-screen flex`}>
          {/* Header */}
          {/* <div className="h-20 flex justify-between w-full p-2 items-center ">
            <div
              className="cursor-pointer flex gap-x-2 items-center"
              onClick={() => setOpenUserInfo(true)}
            >
              <Avatar>
                <AvatarImage src={userDetails?.data.profilePic} />
              </Avatar>
              <div className="leading-tight">
                <p className="text-lg font-bold">{userDetails?.data.name}</p>
                <span className="text-sm">{userDetails?.data.email}</span>
              </div>
            </div>
            <div className="cursor-pointer" onClick={() => setOpen(true)}>
              <MessageSquarePlus />
            </div>
          </div> */}
          {/* <div className="flex-1 flex flex-col justify-between bg-[#FFFFFF] shadow-md rounded-3xl px-3 py-3 ">
            <div className="">
              <input
                className="pl-2 border h-10 w-full rounded-2xl bg-[#F5F6FA]"
                placeholder="search conversation"
              />
              <ul className="pt-2 flex flex-col gap-y-2">
                {data?.data.data.map((x: any) => {
                  return (
                    <li
                      key={x._id}
                      className={`py-2 cursor-pointer hover:bg-slate-200 hover:scale-105 flex gap-2 shadow-sm ${
                        conversationId == x._id ? "bg-[#DEEDFF] scale-105" : ""
                      } rounded-lg pl-2`}
                      onClick={() => {
                        navigate(`/chat/${x._id}`);
                      }}
                    >
                      <Avatar className="">
                        <AvatarImage
                          src={
                            !x.isGroup
                              ? x.participants.filter(
                                  (u) => u._id != loggedInUser.id
                                )[0].profilePic
                              : x.groupImage
                          }
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">
                          {" "}
                          {!x.isGroup
                            ? x.participants.filter(
                                (u) => u._id != loggedInUser.id
                              )[0].name
                            : x.groupName}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p onClick={()=>{
              socketInstance?.disconnect();
            }}>disconnect from socket</p>
            <div className="cursor-pointer flex p-2 w-full gap-2 justify-center">
              <LogOutIcon
                className="p-x-4 "
                onClick={() => {
                  socketInstance?.disconnect();
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              />
              <p>Logout</p>
            </div>
          </div> */}
          <div className=" w-20 flex flex-col gap-4 items-center pt-4 bg-[#E8F1FC]  ">
            <div className="flex-1">
              <NavigationTab
                className={`p-2 ${
                  isChat ? "border" : ""
                } rounded-full cursor-pointer`}
                icon={
                  <MessagesSquare
                    className={`w-9 h-9 ${isChat ? "text-blue-500" : ""}`}
                  />
                }
                onClick={() => {
                  navigate("personal");
                }}
              />
              <NavigationTab
                className={`p-2 ${
                  isGroup ? "border" : ""
                } rounded-full cursor-pointer`}
                icon={
                  <Users
                    className={`w-9 h-9 ${isGroup ? "text-blue-500" : ""}`}
                  />
                }
                onClick={() => {
                  navigate("groups");
                }}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <div
                className="cursor-pointer flex p-2 w-full gap-2 justify-center "
                onClick={() => setOpenUserInfo(true)}
              >
                <TooltipComponent text={"Profile"}>
                  <Avatar>
                    <AvatarImage
                      src={userDetails?.data?.profilePic}
                      className=" object-cover"
                    />
                  </Avatar>
                </TooltipComponent>
              </div>
              <div className="cursor-pointer flex p-2 w-full gap-2 justify-center">
                <TooltipComponent text={"Logout"}>
                  <LogOutIcon
                    className="p-x-4 "
                    onClick={() => {
                      socketInstance?.disconnect();
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  />
                </TooltipComponent>
              </div>
            </div>
          </div>
          <div className="border w-full">
            <div className="flex-1 flex flex-col justify-between px-3 py-3 ">
              <div className="">
                <div className="bg-[#F1F2F7] border rounded-xl shadow-sm p-2">
                  <div className="flex gap-2 justify-between items-center py-2">
                    <p className="font-bold text-lg">
                      {isGroup ? "Groups" : "Messages"}
                    </p>
                    <div
                      className="cursor-pointer"
                      onClick={() => setOpen(true)}
                    >
                      <TooltipComponent
                        text={isChat ? "New-message" : "New-Group"}
                      >
                        <MessageSquarePlus />
                      </TooltipComponent>
                    </div>
                  </div>
                </div>
                {/* <input
                  className="pl-2 border h-10 w-full rounded-2xl bg-[#F5F6FA]"
                  placeholder="search conversation"
                /> */}
                <div className="mt-2">
                  {data?.data.data.length == 0 ? (
                    <p> No {isGroup ? "groups" : "messages"} found</p>
                  ) : (
                    <ul className="pt-2 flex flex-col gap-y-2">
                      {data?.data.data.map((member: any) => {
                        const receiver = member.participants?.filter(
                          (u) => u._id != loggedInUser.id
                        )[0];

                        const imageSrc = !member.isGroup
                          ? receiver?.profilePic
                          : member.groupImage;

                        return (
                          <li
                            key={member._id}
                            className={`py-2 cursor-pointer hover:bg-slate-200 hover:scale-105 flex gap-2 shadow-sm ${
                              conversationId == member._id
                                ? "bg-[#DEEDFF] scale-105"
                                : ""
                            } rounded-lg pl-2`}
                            onClick={() => {
                              if (isGroup)
                                return navigate(`groups/${member._id}`);
                              return navigate(`personal/${member._id}`);
                            }}
                          >
                            <Avatar className="">
                              <AvatarImage src={imageSrc} />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-y-1 justify-center">
                              <p className="font-bold">
                                {" "}
                                {!member.isGroup
                                  ? receiver?.name
                                  : member.groupName}
                              </p>
                              <p
                                className={`${
                                  member?.isGroup ? "hidden" : "block"
                                }`}
                              >
                                {onlineUsers.includes(receiver?._id)
                                  ? "online"
                                  : "offline"}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main
          className={`w-[calc(100%_-_${SIDEBAR_WIDTH})] flex-grow relative`}
        >
          <Outlet />
        </main>
      </div>
      {open ? (
        <CreateConversationForm
          tab={tab}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      ) : null}
      {openUserInfo ? (
        <EditInfo
          isOpen={openUserInfo}
          onClose={() => setOpenUserInfo(false)}
          data={userDetails?.data}
        />
      ) : null}
    </>
  );
}

const NavigationTab = ({
  icon,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  className: string;
}) => {
  return (
    <div className={className} onClick={onClick}>
      {icon}
    </div>
  );
};
