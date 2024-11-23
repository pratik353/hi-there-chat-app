import React from "react";

const Loading = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      <p className="mt-4 text-lg text-gray-600">Loading, please wait...</p>
    </div>
  );
};

export default Loading;
