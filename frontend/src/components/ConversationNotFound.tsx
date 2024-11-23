import React from "react";

const ConversationNotFound = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">
          Conversation Not Found
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          It seems like the conversation you’re looking for doesn’t exist.
        </p>
      </div>
      {/* <div className="mt-8">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Refresh Page
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="ml-4 px-6 py-3 bg-gray-200 text-gray-700 text-lg font-medium rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Go to Home
        </button>
      </div> */}
      <div className="mt-12">
        <img
          src="https://via.placeholder.com/300x200?text=No+Conversation"
          alt="No Conversation Found"
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default ConversationNotFound;
