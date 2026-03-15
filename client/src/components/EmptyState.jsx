import { SearchX } from "lucide-react";

/* eslint-disable no-unused-vars */
export const EmptyState = ({ 
  title = "No results found", 
  description = "We couldn't find what you were looking for.", 
  icon: Icon = SearchX, 
  actionLabel = "Clear search", 
  onAction,
  isSearch = false,
  search = ""
}) => {
/* eslint-enable no-unused-vars */
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-[250px]">
        {isSearch ? `No results found for "${search}". Try checking for typos or using different keywords.` : description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
