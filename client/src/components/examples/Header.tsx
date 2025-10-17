import Header from "../Header";

export default function HeaderExample() {
  return (
    <>
      <Header 
        user={{ username: "Kareem", role: "admin" }}
        onLogout={() => console.log("Logout clicked")}
      />
      <div className="p-8">
        <p className="text-muted-foreground">Header with logged-in admin user</p>
      </div>
    </>
  );
}
