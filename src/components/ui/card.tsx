import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Element = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <Element className={cn("card", className)}>{children}</Element>;
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-md", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
  as: Element = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <Element className={cn("text-lg font-semibold", className)}>{children}</Element>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-muted-foreground", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-md flex flex-wrap items-center gap-sm", className)}>{children}</div>;
}
