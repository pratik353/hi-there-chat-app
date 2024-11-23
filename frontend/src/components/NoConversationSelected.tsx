import React from "react";

const NoConversationSelected = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-800">No Conversation Selected</h1>
        <p className="mt-4 text-lg text-gray-500">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
      <div className="mt-10">
        <img
          src="https://via.placeholder.com/400x250?text=Select+a+Conversation"
          alt="No conversation selected"
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default NoConversationSelected;
