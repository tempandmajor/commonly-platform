
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFoundCard: React.FC = () => {
  return (
    <Card className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The user profile you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </Card>
  );
};

export default NotFoundCard;
