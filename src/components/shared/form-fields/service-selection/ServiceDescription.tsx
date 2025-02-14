
interface ServiceDescriptionProps {
  description?: string;
}

export function ServiceDescription({ description }: ServiceDescriptionProps) {
  if (!description) return null;
  
  return (
    <div className="mt-2 text-sm text-muted-foreground">
      {description}
    </div>
  );
}
