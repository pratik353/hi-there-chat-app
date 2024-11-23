import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InputField from "./form/InputField";
import { authInstance, cloudinaryUrl } from "@/services/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { useCreateConversation, useGetUsers } from "@/services/axiosServices";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tab: "groups" | "chats";
};

const CreateConversationForm = ({ tab, isOpen, onClose }: Props) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  const { data } = useGetUsers();
  const { mutate } = useCreateConversation();

  const users = data?.data;

  const inputRef = useRef(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>("");

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
        formData.append("upload_preset", "hi-there");
        const response = await axios.post(cloudinaryUrl, formData);

        setImageUrl(response.data.secure_url);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "groupName":
        setGroupName(value);
        break;

      default:
        console.error("Invalid input");
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length <= 0) return toast.error("Please Select User.");

    if (!groupName) return toast.error("Please Enter Group Name");

    let formData: any = {
      participants: [...selectedUsers.map((u) => u._id), loggedInUser.id],
    };

    if (tab == "groups") {
      formData = {
        ...formData,
        groupName: groupName,
        groupImage: imageUrl,
        type: "group",
      };
    }

    mutate(formData, {
      onError: (err) => {
        toast.error(err.response.data.message);
      },
      onSuccess: (res) => {
        if (res.data.success) {
          toast.success("Conversation Created Successfully.");
          onClose();
        }
      },
    });
  };

  const filteredUsers = users?.filter((user) =>
    user.name.toLocaleLowerCase().includes(searchKey.toLocaleLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger>Create Conversation</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div>
              <InputField
                label=""
                placeholder="search"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto">
          {filteredUsers?.length > 0 ? (
            filteredUsers?.map((member) => {
              return (
                <div
                  key={member._id}
                  // className="flex items-center gap-2 p-4 border border-gray-200 rounded-md"
                  className={`flex p-2 items-center gap-3 my-1 ${
                    selectedUsers.includes(member)
                      ? "bg-blue-400"
                      : "bg-gray-200"
                  } rounded-md cursor-pointer`}
                  onClick={() => {
                    if (tab == "chats") {
                      setSelectedUsers([member]);
                    } else {
                      if (selectedUsers.includes(member)) {
                        setSelectedUsers(
                          selectedUsers.filter(
                            (user) => user._id !== member._id
                          )
                        );
                      } else {
                        setSelectedUsers((prev) => [...prev, member]);
                      }
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
          <div className="mt-4">
            {tab == "groups" ? (
              <div className="flex flex-col gap-2">
                <InputField
                  name="groupName"
                  value={groupName}
                  onChange={handleChange}
                  label="Group name"
                />
                <div
                  className="w-full h-[8rem] border rounded-lg bg-slate-200 cursor-pointer"
                  onClick={handleUploadImage}
                >
                  <div
                    className={` ${
                      imageUrl ? "hidden" : "block"
                    } flex h-full justify-center items-center`}
                  >
                    Upload Image
                  </div>
                  <div
                    className={`flex h-full justify-center items-center ${
                      imageUrl ? "block" : "hidden"
                    }`}
                  >
                    <img
                      className="h-full w-full object-contain"
                      src={imageUrl}
                      alt=""
                    />
                  </div>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    onChange={pickedHandler}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button className="bg-red-500 hover:bg-red-600" onClick={onClose}>
            cancel
          </Button>
          <Button onClick={handleCreateConversation}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateConversationForm;
