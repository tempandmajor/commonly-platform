
import React from "react";
import EventList from "../components/events/EventList";
import Navbar from "../components/layout/Navbar";

const Events = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">
            Discover and join upcoming events in your area
          </p>
        </div>
        <EventList />
      </main>
    </>
  );
};

export default Events;
