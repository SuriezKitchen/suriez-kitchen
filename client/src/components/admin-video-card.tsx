import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminVideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    views: string;
    likes: string;
    createdAt: string;
  };
  onEdit: (video: any) => void;
  onDelete: (id: string) => void;
}

export default function AdminVideoCard({ 
  video, 
  onEdit, 
  onDelete 
}: AdminVideoCardProps) {

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-primary text-white px-2 py-1 rounded text-xs">
            {video.duration}
          </span>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{video.views} views</span>
          <span>{video.likes} likes</span>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(video)}
            className="flex-1"
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(video.id)}
            className="flex-1"
          >
            <i className="fas fa-trash mr-1"></i>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
