import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <path d="M4 12h16" />
      <path d="M4 8h16" />
      <path d="M4 16h16" />
      <path d="M8 4l-4 4 4 4" />
      <path d="M16 20l4-4-4-4" />
    </svg>
  );
};

export default Logo;
