
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

type WatchDemoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ"; // Replace with your own demo video ID

const WatchDemoModal: React.FC<WatchDemoModalProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl w-full p-0">
      <DialogHeader className="flex flex-row justify-between items-center p-4 pb-2">
        <DialogTitle className="text-lg font-semibold">Watch Demo</DialogTitle>
        <DialogClose asChild>
          <button className="rounded-full p-1 hover:bg-gray-200 transition" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </DialogClose>
      </DialogHeader>
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-b-lg">
        <iframe
          className="absolute left-0 top-0 w-full h-full"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`}
          title="Demo Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </DialogContent>
  </Dialog>
);

export default WatchDemoModal;
