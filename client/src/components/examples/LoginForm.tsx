import LoginForm from "../LoginForm";

export default function LoginFormExample() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[500px]">
      <LoginForm onSubmit={(u, p) => console.log("Login:", u, p)} />
    </div>
  );
}
