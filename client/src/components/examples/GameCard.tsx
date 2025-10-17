import GameCard from "../GameCard";

export default function GameCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <GameCard
        id="1"
        title="Cyber Strike 2077"
        description="An epic cyberpunk adventure set in a dystopian future where you fight against corporate tyranny"
        imageUrl="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=600&fit=crop"
        category="Action"
        platform="PC / Windows"
        fileSize="45 GB"
        releaseDate="Dec 2024"
        downloadLink="https://example.com/download"
        onDownload={() => console.log("Download clicked")}
      />
    </div>
  );
}
