import RegisterForm from "../RegisterForm";

export default function RegisterFormExample() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[500px]">
      <RegisterForm onSubmit={(u, e, p) => console.log("Register:", u, e)} />
    </div>
  );
}
