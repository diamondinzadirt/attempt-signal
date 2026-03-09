"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const router = useRouter();
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAdded(!!isInWatchlist);
  }, [isInWatchlist]);

  const label = useMemo(() => {
    if (type === "icon") return added ? "" : "";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, type]);

  const stockLabel = useMemo(() => {
    if (!company || company.toUpperCase() === symbol.toUpperCase()) return symbol;
    return `${company} (${symbol})`;
  }, [company, symbol]);

  const updateWatchlist = (next: boolean) => {
    setAdded(next);

    startTransition(async () => {
      const response = next
        ? await addToWatchlist(symbol, company)
        : await removeFromWatchlist(symbol);

      if (!response.success) {
        setAdded(!next);
        toast.error(response.message || "Unable to update watchlist");
        return;
      }

      if (next) {
        toast.success(`${stockLabel} added to your watchlist.`);
      } else {
        toast.success("Stock removed from your watchlist.");
      }

      onWatchlistChange?.(symbol, next);
      if (next && type === "button") {
        router.push("/watchlist");
      }
    });
  };

  const handleClick = () => {
    if (isPending) return;

    if (added) {
      setIsRemoveConfirmOpen(true);
      return;
    }

    updateWatchlist(true);
  };

  const confirmRemove = () => {
    setIsRemoveConfirmOpen(false);
    updateWatchlist(false);
  };

  const removeConfirmDialog = (
    <Dialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
      <DialogContent className="alert-dialog border-gray-600 bg-gray-800 text-gray-200" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle className="text-gray-100">Remove from watchlist?</DialogTitle>
          <DialogDescription className="text-gray-400">
            {`Do you want to remove ${stockLabel} from your watchlist?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            className="h-9 rounded-md border border-gray-600 px-4 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-60"
            onClick={() => setIsRemoveConfirmOpen(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-9 rounded-md bg-red-500 px-4 text-sm font-semibold text-gray-900 hover:bg-red-400 disabled:opacity-60"
            onClick={confirmRemove}
            disabled={isPending}
          >
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (type === "icon") {
    return (
      <>
        <button
          type="button"
          title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
          aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
          className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
          disabled={isPending}
          onClick={handleClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={added ? "#A78BFA" : "none"}
            stroke="#A78BFA"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
        </button>
        {removeConfirmDialog}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        className={`watchlist-btn ${added ? "watchlist-remove" : ""} ${isPending ? "opacity-70" : ""}`}
        onClick={handleClick}
      >
        {showTrashIcon && added ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
          </svg>
        ) : null}
        <span>{label}</span>
      </button>
      {removeConfirmDialog}
    </>
  );
};

export default WatchlistButton;
