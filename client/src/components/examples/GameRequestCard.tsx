import GameRequestCard from "../GameRequestCard";

export default function GameRequestCardExample() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      <GameRequestCard
        id="1"
        username="gamer_pro"
        gameTitle="Elden Ring Complete Edition"
        description="Would love to see Elden Ring with all DLC included in the library. It's one of the most popular games right now!"
        status="pending"
        createdAt="3 hours ago"
        isAdmin={true}
        onApprove={() => console.log("Approve clicked")}
        onReject={() => console.log("Reject clicked")}
      />
      <GameRequestCard
        id="2"
        username="casual_player"
        gameTitle="Stardew Valley"
        description="A relaxing farming simulation game that would be perfect for the collection."
        status="approved"
        createdAt="2 days ago"
        isAdmin={true}
      />
    </div>
  );
}
