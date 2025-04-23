import React from 'react';

const TaskTableSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            {/* Skeleton for the table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">
                                <div className="h-6 bg-gray-300 rounded w-full"></div>
                            </th>
                            <th className="border border-gray-300 px-4 py-2">
                                <div className="h-6 bg-gray-300 rounded w-full"></div>
                            </th>
                            {Array.from({ length: 10 }).map((_, index) => (
                                <th key={index} className="border border-gray-300 px-4 py-2">
                                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                                </td>
                                {Array.from({ length: 10 }).map((_, cellIndex) => (
                                    <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                        <div className="h-6 bg-gray-300 rounded w-full"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskTableSkeleton;