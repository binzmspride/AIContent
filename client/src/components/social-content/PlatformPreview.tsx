import { Facebook, Instagram, Twitter, Linkedin, ThumbsUp, MessageCircle, Share, Heart, Send } from "lucide-react";

interface PlatformPreviewProps {
  platform: string;
  content: string;
  selectedImages: string[];
}

const PlatformPreview = ({ platform, content, selectedImages }: PlatformPreviewProps) => {
  // Strip HTML tags from content for display
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const cleanContent = stripHtml(content);
  const firstImage = selectedImages[0];

  switch (platform) {
    case "facebook":
      return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Facebook Header */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Your Page
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                2 phút trước
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-900 dark:text-gray-100 text-sm mb-3">
              {cleanContent}
            </p>
            
            {firstImage && (
              <div className="mb-3">
                <img
                  src={firstImage}
                  alt="Post image"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
          
          {/* Facebook Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex justify-around">
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Thích</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Bình luận</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors">
                <Share className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      );

    case "instagram":
      return (
        <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Instagram Header */}
          <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                your_account
              </div>
            </div>
          </div>
          
          {/* Image */}
          {firstImage && (
            <div className="aspect-square">
              <img
                src={firstImage}
                alt="Instagram post"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Instagram Actions and Content */}
          <div className="p-3">
            <div className="flex items-center space-x-4 mb-2">
              <Heart className="w-6 h-6 text-gray-900 dark:text-gray-100" />
              <MessageCircle className="w-6 h-6 text-gray-900 dark:text-gray-100" />
              <Send className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-semibold">your_account</span> {cleanContent}
            </div>
          </div>
        </div>
      );

    case "twitter":
      return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Twitter Header */}
          <div className="flex items-start p-4">
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center mr-3">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  Your Account
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  @youraccount
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  · 2m
                </span>
              </div>
              
              {/* Tweet Content */}
              <div className="mt-1">
                <p className="text-gray-900 dark:text-gray-100 text-sm">
                  {cleanContent}
                </p>
                
                {firstImage && (
                  <div className="mt-3 rounded-2xl overflow-hidden">
                    <img
                      src={firstImage}
                      alt="Tweet image"
                      className="w-full rounded-2xl"
                    />
                  </div>
                )}
              </div>
              
              {/* Twitter Actions */}
              <div className="flex justify-between max-w-md mt-3">
                <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>12</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1">
                  <Share className="w-4 h-4" />
                  <span>3</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1">
                  <Heart className="w-4 h-4" />
                  <span>24</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1">
                  <Share className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case "linkedin":
      return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* LinkedIn Header */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Your Name
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Professional Title • 2m
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-900 dark:text-gray-100 text-sm mb-3">
              {cleanContent}
            </p>
            
            {firstImage && (
              <div className="mb-3">
                <img
                  src={firstImage}
                  alt="LinkedIn post image"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
          
          {/* LinkedIn Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex justify-around">
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Thích</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Bình luận</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors">
                <Share className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {platform || 'Unknown Platform'}
            </span>
          </div>
          
          {firstImage && (
            <div className="mb-3">
              <img
                src={firstImage}
                alt="Preview image"
                className="w-full rounded-lg"
              />
            </div>
          )}
          
          <div className="text-gray-900 dark:text-gray-100 text-sm">
            {cleanContent}
          </div>
        </div>
      );
  }
};

export default PlatformPreview;