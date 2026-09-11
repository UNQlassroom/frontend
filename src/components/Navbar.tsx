import { useRole } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";

export const Navbar = () => {
  const { role, toggleRole } = useRole();

  return (
    <header className="border-b border-line bg-panel px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={unqlassroomLogo}
          alt="UNQlassroom Logo"
          className="w-7 h-7 object-contain"
        />
        <span className="font-display font-bold text-lg tracking-tight">
          UNQlassroom
        </span>
        <button
          type="button"
          onClick={toggleRole}
          className="ml-2 inline-flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs cursor-pointer hover:bg-line/40 transition-colors"
          title="Click para cambiar de vista"
        >
          <span className="uppercase text-muted-foreground font-semibold text-[10px]">
            {role}
          </span>
          <span
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
              role === "alumno" ? "bg-emerald-600" : "bg-neutral-700"
            }`}
          >
            <span
              className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                role === "alumno" ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    </header>
  );
};
