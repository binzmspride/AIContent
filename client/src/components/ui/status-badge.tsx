import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

type StatusType = 
  | "draft" 
  | "published" 
  | "wordpress" 
  | "facebook" 
  | "tiktok" 
  | "twitter" 
  | "deleted";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();
  
  const getStatusConfig = (status: StatusType) => {
    switch(status) {
      case "draft":
        return {
          label: t("dashboard.articles.statuses.draft"),
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        };
      case "published":
        return {
          label: t("dashboard.articles.statuses.published"),
          className: "bg-green-100 text-green-800 hover:bg-green-200"
        };
      case "wordpress":
        return {
          label: t("dashboard.articles.statuses.wordpress"),
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
        };
      case "facebook":
        return {
          label: t("dashboard.articles.statuses.facebook"),
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200"
        };
      case "tiktok":
        return {
          label: t("dashboard.articles.statuses.tiktok"),
          className: "bg-pink-100 text-pink-800 hover:bg-pink-200"
        };
      case "twitter":
        return {
          label: t("dashboard.articles.statuses.twitter"),
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
        };
      case "deleted":
        return {
          label: "Deleted",
          className: "bg-red-100 text-red-800 hover:bg-red-200"
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
        };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
}
