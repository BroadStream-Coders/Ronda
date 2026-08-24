export function HostMessage({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-base text-muted-foreground">{detail}</p>
    </div>
  );
}
