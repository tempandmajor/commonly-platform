
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserWallet } from '@/types/event';

interface WalletTabProps {
  wallet: UserWallet | null;
}

export const WalletTab = ({ wallet }: WalletTabProps) => {
  if (!wallet) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Your wallet hasn't been created yet. Start earning with referrals!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="font-bold text-xl">${wallet.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="font-bold text-xl">${wallet.availableBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="font-bold text-xl">${wallet.pendingBalance.toFixed(2)}</p>
        </div>
      </div>
      
      <h3 className="font-medium mb-2">Transaction History</h3>
      {wallet.transactions.length > 0 ? (
        <div className="space-y-3">
          {wallet.transactions.map((transaction) => (
            <div key={transaction.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'}`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                    {transaction.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-6 text-muted-foreground">
          No transactions yet
        </p>
      )}
      
      <div className="mt-6 text-center">
        <Button disabled={wallet.availableBalance <= 0}>Withdraw Funds</Button>
      </div>
    </div>
  );
};
