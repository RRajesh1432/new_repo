
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message = "Analyzing Data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-green-700">{message}</p>
    </div>
  );
};

export default Loader;
