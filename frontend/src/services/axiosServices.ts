import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authInstance, instance } from "./api";

export function useGetUsers() {
  return useQuery({
    queryKey: ["getUsers"],
    queryFn: async () => {
      const response = await authInstance.get(`/user`);
      return response.data;
    },
  });
}

export function useGetUserDetails() {
  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  return useQuery({
    queryKey: ["getUserDetails"],
    queryFn: async () => {
      const response = await authInstance.get(`/user/${loggedInUser.id}`);

      return response.data;
    },
  });
}

export function useGetUserConversations(type: "groups" | "chats") {
  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  return useQuery({
    queryKey: ["getUserConversations", type],
    queryFn: async () => {
      const response = await authInstance.get(
        `conversation/user/${loggedInUser.id}?type=${type}`
      );

      return response;
    },
    enabled: !!type,
  });
}

export function useGetConversationDetails(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["getConversationDetails", conversationId],
    queryFn: async () => {
      const response = await authInstance.get(
        `/conversation/${conversationId}`
      );

      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useLoginRequest() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await instance.post("/auth/login", data);
      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      return res.data;
    },
    onError: (err: any) => {
      return err;
    },
  });
  return mutation;
}

export function useUpdateUserDetails() {
  const loggedInUser = JSON.parse(localStorage.getItem("user") ?? "");

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await authInstance.put(`/user/${loggedInUser.id}`, data);
      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["getUserDetails"] });
      return res.data;
    },
    onError: (err: any) => {
      return err;
    },
  });
  return mutation;
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const { type, ...rest } = data;
      const response = await authInstance.post(
        `/conversation?type=${type}`,
        rest
      );
      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["getUserConversations"] });
      return res.data;
    },
    onError: (err: any) => {
      return err;
    },
  });
  return mutation;
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const { _id, ...rest } = data;
      const response = await authInstance.put(`/conversation/${_id}`, rest);
      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["getConversationDetails"] });
      queryClient.invalidateQueries({ queryKey: ["getUserConversations"] });
      return res.data;
    },
    onError: (err: any) => {
      return err;
    },
  });
  return mutation;
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await authInstance.delete("/conversation/" + data.id);
      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["getUserConversations"] });
      return res.data;
    },
    onError: (err: any) => {
      return err;
    },
  });
  return mutation;
}
