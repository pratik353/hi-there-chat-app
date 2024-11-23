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
import { useUpdateUserDetails } from "@/services/axiosServices";
import { Check, Pencil } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

const EditInfo = ({ isOpen, onClose, data }: Props) => {
  const { mutate } = useUpdateUserDetails();
  const inputRef = useRef(null);

  const [editName, setEditName] = React.useState(false);
  const [name, setName] = React.useState(data?.name);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    data?.profilePic
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
            profilePic: response.data.secure_url,
          },
          {
            onError: (err) => {
              toast.error(err.response.data.message);
            },
            onSuccess: (res) => {
              if (res.data.data.success) {
                toast.success(" Profile picture updated successfully");
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
          <p className="text-center text-3xl font-bold">User Info</p>
          <DialogTitle>
            <div className=" flex flex-col items-center gap-2">
              <Avatar onClick={handleUploadImage} className="h-20 w-20 border-2 outline-black">
                <AvatarImage src={imageUrl} className=" object-cover"/>
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
                  {data?.name}
                </p>
                <Pencil
                  className={`${!editName ? "" : "hidden"} w-5 cursor-pointer`}
                  onClick={() => setEditName(true)}
                />
                <Check
                  className={`${editName ? "" : "hidden"} cursor-pointer`}
                  onClick={() => {
                    if (name == data?.name) return setEditName(false);
                    mutate(
                      {
                        name,
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
      </DialogContent>
    </Dialog>
  );
};

export default EditInfo;
