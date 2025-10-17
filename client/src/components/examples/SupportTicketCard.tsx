import SupportTicketCard from "../SupportTicketCard";

export default function SupportTicketCardExample() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      <SupportTicketCard
        id="1"
        username="john_doe"
        subject="Game Download Issue"
        message="I'm having trouble downloading Cyber Strike 2077. The download link seems to be broken."
        status="open"
        priority="high"
        createdAt="2 hours ago"
        isAdmin={true}
        onRespond={() => console.log("Respond clicked")}
        onResolve={() => console.log("Resolve clicked")}
      />
      <SupportTicketCard
        id="2"
        username="jane_smith"
        subject="Account Settings"
        message="How can I change my username and email address?"
        status="in-progress"
        priority="medium"
        createdAt="1 day ago"
        isAdmin={true}
        onRespond={() => console.log("Respond clicked")}
        onResolve={() => console.log("Resolve clicked")}
      />
    </div>
  );
}
