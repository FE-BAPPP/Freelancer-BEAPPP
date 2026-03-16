import React from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export type BannerType = 'OFFER' | 'MILESTONE_DUE' | 'REVIEW_REQUIRED' | 'DISPUTE' | 'INFO';

interface ActionBannerProps {
    type: BannerType;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ type, title, description, action }) => {
    const getStyles = () => {
        switch (type) {
            case 'OFFER':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'MILESTONE_DUE':
                return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'REVIEW_REQUIRED':
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'DISPUTE':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-white border-gray-200 text-gray-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'OFFER': return <Clock className="w-6 h-6 text-blue-600" />;
            case 'MILESTONE_DUE': return <AlertCircle className="w-6 h-6 text-amber-600" />;
            case 'REVIEW_REQUIRED': return <CheckCircle className="w-6 h-6 text-emerald-600" />;
            case 'DISPUTE': return <AlertTriangle className="w-6 h-6 text-red-600" />;
            default: return <AlertCircle className="w-6 h-6 text-gray-600" />;
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative overflow-hidden rounded-xl border p-6 shadow-sm ${getStyles()}`}
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1 p-2 bg-white rounded-lg shadow-sm">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{title}</h3>
                    <p className="text-sm opacity-90 mb-4 font-medium leading-relaxed">{description}</p>
                    {action && (
                        <div className="flex gap-3 mt-2">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
