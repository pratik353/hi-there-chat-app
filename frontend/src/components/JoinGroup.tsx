import React from "react";

const JoinGroup = ({ onJoin }) => {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-800">Join Group to Access Content</h1>
        <p className="mt-4 text-lg text-gray-500">
          You need to join this group to unlock the exclusive content.
        </p>
      </div>
      <div className="mt-10">
        <img
          src="https://via.placeholder.com/400x250?text=Join+Group"
          alt="Join Group"
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default JoinGroup;
