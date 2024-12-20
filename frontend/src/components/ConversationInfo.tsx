import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputField from "./form/InputField";
import { cloudinaryUrl, UPLOAD_PRESET } from "@/services/api";
import toast from "react-hot-toast";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useGetUsers, useUpdateConversation } from "@/services/axiosServices";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

const ConversationInfo = ({ isOpen, onClose, data }: Props) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  const { data: usersData } = useGetUsers();
  const users = usersData?.data;

  const { mutate } = useUpdateConversation();

  const inputRef = useRef(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editName, setEditName] = React.useState(false);
  const [name, setName] = React.useState(data?.groupName || "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    data?.groupImage
  );

  const pickedHandler = async (event: any) => {
    let pickedFile;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      if (!pickedFile.type.startsWith("image/")) {
        event.target.value = "";
        setImageUrl("");
        return toast.error("Please select an image file.");
      }

      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        setImageUrl(fileReader.result);
      };
      fileReader.readAsDataURL(pickedFile);

      try {
        const formData = new FormData();
        formData.append("file", pickedFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        const response = await axios.post(cloudinaryUrl, formData);

        setImageUrl(response.data.secure_url);

        mutate(
          {
            groupImage: response.data.secure_url,
            _id: data?._id,
          },
          {
            onError: (err) => {
              toast.error(err.response.data.message);
            },
            onSuccess: (res) => {
              if (res.data.data.success) {
                toast.success("Group image updated");
              }
            },
          }
        );
      } catch (error) {
        toast.error(error?.message);
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
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className=" flex flex-col items-center gap-2">
              <Avatar onClick={handleUploadImage} className="h-20 w-20">
                <AvatarImage src={imageUrl} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={pickedHandler}
              />
              <div className="flex items-center gap-2 px-4 py-2">
                <InputField
                  className={`${editName ? "" : "hidden w-200"}`}
                  label=""
                  placeholder="search"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className={`${!editName ? "" : "hidden"} w-200 text-md `}>
                  {data?.groupName}
                </p>
                <Pencil
                  className={`${!editName ? "" : "hidden"} w-5 cursor-pointer`}
                  onClick={() => setEditName(true)}
                />
                <Check
                  className={`${editName ? "" : "hidden"} cursor-pointer`}
                  onClick={() => {
                    if (name == data?.groupName) return setEditName(false);
                    mutate(
                      {
                        groupName: name,
                        _id: data?._id,
                      },
                      {
                        onError: (err) => {
                          toast.error(err.response.data.message);
                        },
                        onSuccess: (res) => {
                          if (res.data.success) {
                            setEditName(false);
                          }
                        },
                      }
                    );
                  }}
                />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {data?.participants?.map((member) => {
            return (
              <div
                key={member._id}
                className="flex justify-between items-center border-2 rounded-md"
              >
                <div className="flex items-center gap-4 p-2">
                  <Avatar>
                    <AvatarImage
                      src={member.profilePic || ""}
                      className="w-10 h-10 rounded-full"
                    />
                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-md font-semibold">{member.name} </p>
                  <p className="text-sm font-light">{data?.admin == member._id ? 'Group creator' : ''} </p>
                </div>
                {loggedInUser.id == data?.admin && data?.admin != member._id ? <div className="pr-4">
                  <X className="cursor-pointer text-red-500" onClick={()=>{
                    mutate(
                      {
                        _id: data?._id,
                        leaveId: member?._id,
                      },
                      {
                        onError: (err) => {
                          toast.error(err.response.data.message);
                        },
                        onSuccess: (res) => {
                          if (res.data.data.success) {
                            toast.success("user removed Successfully");
                          }
                        },
                      }
                    );
                  }}/>
                </div> : null }
              </div>
            );
          })}
        </div>
        {!data?.isPublic && loggedInUser.id == data?.admin ? (
          <div>
            {users?.length > 0 ? (
              users?.map((member) => {
                return (
                  <div
                    key={member._id}
                    className={`flex p-2 items-center gap-3 my-1 ${
                      selectedUsers.includes(member)
                        ? "bg-blue-400"
                        : "bg-gray-200"
                    } rounded-md cursor-pointer ${
                      data?.participants.map((u) => u._id).includes(member._id)
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    onClick={() => {
                      if (selectedUsers.includes(member)) {
                        setSelectedUsers(
                          selectedUsers.filter(
                            (user) => user._id !== member._id
                          )
                        );
                      } else {
                        setSelectedUsers((prev) => [...prev, member]);
                      }
                    }}
                  >
                    <img
                      src={member.profilePic || ""}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2"
                    />
                    <p className="text-md font-semibold">{member.name}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-lg text-gray-400">No users found</p>
            )}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  if (selectedUsers.length <= 0)
                    return toast.error("Please select at-least one user");

                  mutate(
                    {
                      _id: data?._id,
                      joinId: selectedUsers.map((u) => u._id),
                    },
                    {
                      onError: (err) => {
                        toast.error(err.response.data.message);
                      },
                      onSuccess: (res) => {
                        if (res.data.data.success) {
                          toast.success("Member added Successfully");
                          setSelectedUsers([])
                        }
                      },
                    }
                  );
                }}
              >
                Add Members
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationInfo;
