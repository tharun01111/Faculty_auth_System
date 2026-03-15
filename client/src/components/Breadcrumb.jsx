import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Breadcrumb component.
 *
 * @param {{ label: string, href?: string }[]} items
 *   Array of breadcrumb segments. The last item is treated as the current page
 *   (rendered as plain text). All previous items are rendered as links.
 *
 * Example:
 *   <Breadcrumb items={[
 *     { label: "Admin Portal", href: "/admin/dashboard" },
 *     { label: "Faculty Management" },
 *   ]} />
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            )}
            {isLast || !item.href ? (
              <span
                className={`font-medium ${
                  isLast ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
