import { ArrowUpCircle, ArrowDownCircle, ChevronRight, Inbox } from 'lucide-react';

interface Transaction {
  id?: string;
  transactionType: string;
  amount: number;
  createdAt: string;
  status?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onViewMore?: () => void;
  title?: string;
  emptyMessage?: string;
}

export function TransactionList({ 
  transactions, 
  onViewMore,
  title = 'Recent Transactions',
  emptyMessage = 'No recent transactions'
}: TransactionListProps) {
  return (
    <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="text-sm text-gray-500 hover:text-pink-500 font-medium flex items-center gap-1 transition-colors"
          >
            More <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-0">
        {transactions.length > 0 ? (
          <div className="divide-y divide-white/5">
            {transactions.slice(0, 5).map((tx, idx) => (
              <div 
                key={tx.id || idx} 
                className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    tx.transactionType === 'DEPOSIT' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.transactionType === 'DEPOSIT' 
                      ? <ArrowDownCircle className="w-5 h-5" /> 
                      : <ArrowUpCircle className="w-5 h-5" />
                    }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-pink-500 transition-colors">
                      {tx.transactionType}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${
                  tx.transactionType === 'DEPOSIT' 
                    ? 'text-emerald-400' 
                    : 'text-white'
                }`}>
                  {tx.transactionType === 'DEPOSIT' ? '+' : '-'}{tx.amount} PTS
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
