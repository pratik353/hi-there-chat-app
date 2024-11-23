import React from "react";

const NoMessageFound = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">No Messages Found</h1>
        <p className="mt-4 text-lg text-gray-500">
          Start the conversation by sending your first message.
        </p>
      </div>
    </div>
  );
};

export default NoMessageFound;
