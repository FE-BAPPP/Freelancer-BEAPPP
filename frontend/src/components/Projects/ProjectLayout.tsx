import React from 'react';
import { motion } from 'framer-motion';

interface ProjectLayoutProps {
    header: React.ReactNode;
    main: React.ReactNode;
    sidebar: React.ReactNode;
}

export const ProjectLayout: React.FC<ProjectLayoutProps> = ({ header, main, sidebar }) => {
    return (
        <div className="min-h-screen bg-[#f7f7f7]">
            <div className="max-w-[1400px] mx-auto p-6 space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                >
                    {header}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Content (Left - 8 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 space-y-6"
                    >
                        {main}
                    </motion.div>

                    {/* Sidebar Context (Right - 4 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 space-y-6 sticky top-6"
                    >
                        {sidebar}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
