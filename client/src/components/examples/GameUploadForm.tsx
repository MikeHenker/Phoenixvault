import GameUploadForm from "../GameUploadForm";

export default function GameUploadFormExample() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <GameUploadForm onSubmit={(data) => console.log("Game uploaded:", data)} />
    </div>
  );
}
