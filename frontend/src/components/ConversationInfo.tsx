import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InputField from "./form/InputField";
import { cloudinaryUrl } from "@/services/api";
import toast from "react-hot-toast";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUpdateConversation } from "@/services/axiosServices";
import { Check, Pencil } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

const ConversationInfo = ({ isOpen, onClose, data }: Props) => {
  const { mutate } = useUpdateConversation();

  const inputRef = useRef(null);

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
        formData.append("upload_preset", "hi-there");
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
                console.log("image uploaded");
              }
            },
          }
        );
        toast.success("Profile picture updated");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
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
                className="flex items-center gap-4 p-2 border-2 rounded-md"
              >
                <Avatar>
                  <AvatarImage
                    src={member.profilePic || ""}
                    className="w-10 h-10 rounded-full"
                  />
                  <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-md font-semibold">{member.name}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationInfo;
