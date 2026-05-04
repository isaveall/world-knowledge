'use client';

interface ApiEndpointProps {
  method: string;
  path: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500',
  POST: 'bg-blue-500',
  PUT: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  PATCH: 'bg-purple-500',
};

export default function ApiEndpoint({ method, path }: ApiEndpointProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 my-4">
      <span className={`px-3 py-1 rounded-md text-white font-bold text-sm ${methodColors[method] || 'bg-gray-500'}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{path}</code>
    </div>
  );
}
