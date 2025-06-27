import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Head from "@/components/head";
import { Article as ArticleType } from "@shared/schema";

const Article = () => {
  const { t } = useDbTranslations();
  const [_, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = params && params.id ? parseInt(params.id) : null;

  // Fetch article data
  const { data: articleData, isLoading, error } = useQuery<{ success: boolean; data: ArticleType }>({
    queryKey: [`/api/dashboard/articles/${articleId}`],
    enabled: !!articleId,
  });

  const article = articleData?.data;

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/", { replace: true })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-4/5 mb-4" />
          <Skeleton className="h-6 w-5/6 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          
          <Skeleton className="h-40 w-full mb-8" />
          
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-4/5 mb-4" />
          <Skeleton className="h-6 w-5/6 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Head>
          <title>Lỗi tải bài viết - SEO AI Writer</title>
        </Head>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Lỗi tải bài viết</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message || "Không thể tải bài viết. Vui lòng thử lại sau."}
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/my-articles")}>
              Về danh sách bài viết
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Head>
          <title>Không tìm thấy bài viết - SEO AI Writer</title>
        </Head>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Bài viết không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => navigate("/dashboard/my-articles")}>
            Về danh sách bài viết
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Head>
        <title>{article.title} - SEO AI Writer</title>
        <meta name="description" content={article.content.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta name="keywords" content={article.keywords || ''} />
      </Head>

      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/my-articles", { replace: true })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Về danh sách bài viết
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(article.createdAt)}
          </div>
          
          {article.keywords && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              {article.keywords}
            </div>
          )}
        </div>
      </div>

      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
};

export default Article;