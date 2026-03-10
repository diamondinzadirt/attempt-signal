'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';

const TradeActionButtons = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 bg-green-500 text-green-950 hover:bg-green-400"
        >
          Buy
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 bg-red-500 text-red-950 hover:bg-red-400"
        >
          Sell
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-gray-600 bg-gray-800 text-gray-100">
          <DialogTitle className="text-gray-100">Connect to a Broker</DialogTitle>
          <DialogDescription className="text-gray-400">
            To trade this asset, connect your broker account. Sign in to your broker and link your watchlist account.
          </DialogDescription>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-violet-500 text-violet-950 hover:bg-violet-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TradeActionButtons;
