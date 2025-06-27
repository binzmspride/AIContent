import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useEffect, useMemo } from 'react';

interface Translation {
  key: string;
  vi: string;
  en: string;
  category?: string;
}

interface UseDbTranslationsResult {
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  language: string;
}

export function useDbTranslations(): UseDbTranslationsResult {
  const { user } = useAuth();
  const { language: currentLanguage } = useLanguage();
  const language = currentLanguage;
  const queryClient = useQueryClient();

  // Clear all translation cache and refetch on language change or component mount
  useEffect(() => {
    console.log(`[useDbTranslations] Language changed to: ${language}, clearing all cache and refetching translations`);
    queryClient.removeQueries({ queryKey: ['/api/admin/translations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/translations'] });
  }, [language, queryClient]);

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/translations', language, Math.random()], // Force new query every time
    select: (response: any) => {
      const translationData = response?.data?.translations || [];
      console.log(`[useDbTranslations] Loaded ${translationData.length} translations for language: ${language}`);
      return translationData;
    },
    staleTime: 0, // No caching - always fresh data
    gcTime: 0, // Don't keep in cache (TanStack Query v5)
    enabled: !!user, // Only fetch when user is loaded
    retry: false,
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const t = useMemo(() => {
    // Hard-coded translations for immediate testing
    const hardcodedTranslations: Record<string, { vi: string; en: string }> = {
      'dashboard.create.socialContent.stepExtract': {
        vi: 'Trích xuất',
        en: 'Extract'
      },
      'dashboard.create.socialContent.stepGenerate': {
        vi: 'Tạo nội dung', 
        en: 'Generate Content'
      },
      'dashboard.create.socialContent.stepComplete': {
        vi: 'Hoàn thành',
        en: 'Complete'
      },
      'dashboard.create.socialContent.step1.title': {
        vi: 'Bước 1: Trích xuất nội dung',
        en: 'Step 1: Content Extraction'
      },
      'dashboard.create.socialContent.contentSourceLabel': {
        vi: 'Nguồn nội dung',
        en: 'Content Source'
      },
      'dashboard.create.socialContent.contentSource.existingArticle': {
        vi: 'Từ bài viết có sẵn',
        en: 'From Existing Article'
      },
      'dashboard.create.socialContent.contentSource.manual': {
        vi: 'Nhập thủ công',
        en: 'Manual Input'
      },
      'dashboard.create.socialContent.contentSource.createNew': {
        vi: 'Tạo bài viết mới',
        en: 'Create New Article'
      },
      'dashboard.create.socialContent.briefDescriptionRequired': {
        vi: 'Mô tả nội dung *',
        en: 'Content Description *'
      },
      'dashboard.create.socialContent.briefDescriptionPlaceholder': {
        vi: 'Nhập mô tả ngắn gọn về nội dung bạn muốn tạo...',
        en: 'Enter a brief description of the content you want to create...'
      },
      'dashboard.create.socialContent.referenceUrlOptional': {
        vi: 'URL tham khảo (tùy chọn)',
        en: 'Reference URL (optional)'
      },
      'dashboard.create.socialContent.urlPlaceholder': {
        vi: 'https://example.com/bai-viet-tham-khao',
        en: 'https://example.com/reference-article'
      },
      'dashboard.create.socialContent.targetPlatformsRequired': {
        vi: 'Nền tảng mục tiêu *',
        en: 'Target Platforms *'
      },
      'dashboard.create.socialContent.extractAndContinue': {
        vi: 'Trích xuất & Tiếp tục',
        en: 'Extract & Continue'
      },
      'dashboard.create.socialContent.selectSeoArticle': {
        vi: 'Chọn bài viết SEO',
        en: 'Select SEO Article'
      },
      'dashboard.create.socialContent.foundArticles': {
        vi: 'Tìm thấy 23 bài viết SEO trong "Bài viết của tôi"',
        en: 'Found 23 SEO articles in "My Articles"'
      },
      'dashboard.create.socialContent.selectSeoPlaceholder': {
        vi: 'Chọn bài viết SEO...',
        en: 'Select SEO article...'
      },
      'dashboard.create.socialContent.searchArticlePlaceholder': {
        vi: 'Tìm kiếm bài viết...',
        en: 'Search articles...'
      },
      'dashboard.create.socialContent.mainTopicRequired': {
        vi: 'Chủ đề chính *',
        en: 'Main Topic *'
      },
      'dashboard.create.socialContent.topicPlaceholder': {
        vi: 'Ví dụ: Cây cảnh xanh trong nhà',
        en: 'Example: Indoor green plants'
      },
      'dashboard.create.socialContent.keywordsRequired': {
        vi: 'Từ khóa *',
        en: 'Keywords *'
      },
      'dashboard.create.socialContent.keywordsPlaceholder': {
        vi: 'Ví dụ: cây cảnh xanh, chăm sóc cây, không gian xanh',
        en: 'Example: green plants, plant care, green space'
      },
      'dashboard.create.socialContent.createAndExtract': {
        vi: 'Tạo bài viết & Trích xuất',
        en: 'Create Article & Extract'
      },
      'dashboard.create.socialContent.noSeoArticles': {
        vi: 'Chưa có bài viết SEO nào',
        en: 'No SEO articles yet'
      },
      'dashboard.create.socialContent.createSeoFirst': {
        vi: 'Hãy tạo bài viết SEO trước trong mục "Tạo nội dung"',
        en: 'Please create SEO articles first in the "Create Content" section'
      },
      'common.loading': {
        vi: 'Đang tải...',
        en: 'Loading...'
      },
      'dashboard.create.socialContent.selectFromLibrary': {
        vi: 'Chọn ảnh từ thư viện',
        en: 'Select from library'
      },
      'dashboard.create.socialContent.saveSuccess': {
        vi: 'Nội dung và hình ảnh đã được lưu thành công',
        en: 'Content and images saved successfully'
      },
      'common.completed': {
        vi: 'Hoàn thành',
        en: 'Completed'
      },
      'dashboard.create.socialContent.noContentToPost': {
        vi: 'Không có nội dung để đăng',
        en: 'No content to post'
      },
      'common.error': {
        vi: 'Lỗi',
        en: 'Error'
      },
      'dashboard.imageLibrary.title': {
        vi: 'Thư viện hình ảnh AI',
        en: 'AI Image Library'
      },
      'dashboard.imageLibrary.description': {
        vi: 'Quản lý và xem lại tất cả hình ảnh đã tạo bằng AI',
        en: 'Manage and review all AI-generated images'
      },
      'dashboard.imageLibrary.imageCount': {
        vi: 'hình ảnh',
        en: 'images'
      },
      'common.search': {
        vi: 'Tìm kiếm',
        en: 'Search'
      },
      'common.status': {
        vi: 'Trạng thái',
        en: 'Status'
      },
      'dashboard.imageLibrary.noImages': {
        vi: 'Chưa có hình ảnh nào',
        en: 'No images yet'
      },
      'dashboard.imageLibrary.noImagesFiltered': {
        vi: 'Không tìm thấy hình ảnh nào phù hợp với bộ lọc.',
        en: 'No images found matching the filter criteria.'
      },
      'dashboard.imageLibrary.noImagesYet': {
        vi: 'Bạn chưa tạo hình ảnh nào. Hãy bắt đầu tạo hình ảnh đầu tiên!',
        en: 'You haven\'t created any images yet. Start creating your first image!'
      }
    };

    return (key: string, fallback?: string): string => {
      // Check hard-coded translations first
      const hardcoded = hardcodedTranslations[key];
      if (hardcoded) {
        const result = language === 'en' ? hardcoded.en : hardcoded.vi;
        console.log(`[useDbTranslations] Using hardcoded translation for ${key}: "${result}" (language: ${language})`);
        return result;
      }

      // Fall back to database translations
      if (!translations || translations.length === 0) {
        console.log(`[useDbTranslations] No translations loaded, returning fallback for ${key} (current language: ${language})`);
        return fallback || key;
      }

      const translation = translations.find((t: Translation) => t.key === key);
      
      if (translation) {
        const result = language === 'en' ? translation.en : translation.vi;
        console.log(`[useDbTranslations] Found database translation for ${key}: "${result}" (language: ${language})`);
        return result || fallback || key;
      }
      
      console.log(`[useDbTranslations] No translation found for ${key}, returning fallback (current language: ${language})`);
      return fallback || key;
    };
  }, [translations, language]);

  return { t, isLoading, language };
}