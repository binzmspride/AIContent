export const vi = {
  // Auth
  auth: {
    login: {
      title: "Đăng nhập",
      username: "Tên đăng nhập hoặc email",
      password: "Mật khẩu",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      loginButton: "Đăng nhập",
      noAccount: "Chưa có tài khoản?",
      createAccount: "Tạo tài khoản mới",
      switchToRegister: "Đăng ký ngay",
      verifiedSuccess: "Tài khoản của bạn đã được xác thực. Vui lòng đăng nhập để bắt đầu."
    },
    register: {
      title: "Đăng ký",
      username: "Tên đăng nhập",
      email: "Email",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận mật khẩu",
      fullName: "Họ và tên",
      registerButton: "Đăng ký",
      hasAccount: "Đã có tài khoản?",
      switchToLogin: "Đăng nhập"
    },
    verify: {
      title: "Xác thực tài khoản",
      verifying: "Đang xác thực tài khoản của bạn...",
      success: "Tài khoản của bạn đã được xác thực thành công!",
      failure: "Không thể xác thực tài khoản của bạn.",
      noToken: "Không tìm thấy token xác thực trong URL.",
      unknownError: "Đã xảy ra lỗi không xác định trong quá trình xác thực.",
      serverError: "Lỗi máy chủ khi xác thực email.",
      loginButton: "Đăng nhập vào tài khoản",
      backToLogin: "Quay lại trang đăng nhập"
    },
    forgotPassword: {
      title: "Quên mật khẩu",
      email: "Email",
      submitButton: "Gửi liên kết đặt lại mật khẩu",
      backToLogin: "Quay lại đăng nhập",
      instructions: "Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.",
      success: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn."
    },
    resetPassword: {
      title: "Đặt lại mật khẩu",
      newPassword: "Mật khẩu mới",
      confirmPassword: "Xác nhận mật khẩu mới",
      submitButton: "Đặt lại mật khẩu",
      success: "Mật khẩu của bạn đã được đặt lại thành công.",
      error: "Đã xảy ra lỗi khi đặt lại mật khẩu.",
      linkExpired: "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ."
    },
    errors: {
      invalidCredentials: "Tên đăng nhập hoặc mật khẩu không chính xác.",
      userNotFound: "Không tìm thấy tài khoản với email này.",
      usernameTaken: "Tên đăng nhập đã được sử dụng.",
      emailTaken: "Email đã được sử dụng.",
      passwordMismatch: "Xác nhận mật khẩu không khớp.",
      weakPassword: "Mật khẩu không đủ mạnh.",
      serverError: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
      invalidToken: "Token không hợp lệ hoặc đã hết hạn."
    },
  },
  // Time
  time: {
    day: "Ngày",
    week: "Tuần",
    month: "Tháng",
    year: "Năm",
    fromPrevious: "so với trước"
  },
  
  // Common
  common: {
    appName: "SEO AI Writer",
    loading: "Đang tải...",
    error: "Đã xảy ra lỗi. Vui lòng thử lại.",
    success: "Thành công!",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Sửa",
    view: "Xem",
    back: "Quay lại",
    next: "Tiếp tục",
    submit: "Gửi",
    language: "VN",
    saveChanges: "Lưu thay đổi",
    saving: "Đang lưu...",
    noData: "Không có dữ liệu",
    noDataFound: "Không tìm thấy dữ liệu nào. Hãy thử lại với tìm kiếm khác.",
    operationSuccess: "Thao tác đã được thực hiện thành công.",
    notConnected: "Chưa kết nối",
    loadingData: "Đang tải dữ liệu...",
    viewAll: "Xem tất cả",
    comparedToPreviousMonth: "so với tháng trước",
    tagline: "Nền tảng tạo bài viết SEO bằng AI cho người Việt",
    close: "Đóng",
    create: "Tạo mới",
    creating: "Đang tạo...",
    manage: "Quản lý",
    openMenu: "Mở menu",
    errorOccurred: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    partialResults: "Kết quả một phần",
    partialResultsFound: "Chỉ tìm thấy một phần kết quả. Có thể đã xảy ra lỗi trong quá trình tải.",
    processingRequest: "Đang xử lý yêu cầu...",
    generatingContent: "Đang tạo nội dung AI...",
    analyzingContent: "Đang phân tích nội dung...",
    optimizingSEO: "Đang tối ưu hóa SEO...",
    publishingContent: "Đang xuất bản nội dung...",
    loadingComplete: "Tải hoàn tất!",
    
    // Mascot messages
    mascot: {
      dashboard: {
        welcomeTitle: "Xin chào!",
        welcomeTip: "Chào mừng bạn đến với SEO AI Writer! Đây là nơi bạn có thể xem tổng quan về tài khoản của mình.",
        creditsTitle: "Tín dụng",
        creditsTip: "Số tín dụng hiển thị ở bảng điều khiển cho biết bạn có thể tạo bao nhiêu bài viết mới.",
        articlesTitle: "Bài viết của bạn",
        articlesTip: "Bạn có thể xem các bài viết gần đây của mình tại đây và nhấp vào để chỉnh sửa hoặc xuất bản."
      },
      contentCreation: {
        welcomeTitle: "Bắt đầu tạo nội dung!",
        welcomeTip: "Hãy điền đầy đủ thông tin để tạo bài viết SEO chất lượng cao.",
        tipsTitle: "Mẹo tạo nội dung",
        tipsList: "Sử dụng từ khóa chính xác, chọn giọng điệu phù hợp với đối tượng, và cung cấp mô tả chi tiết để có kết quả tốt nhất.",
        creditsTitle: "Sử dụng tín dụng",
        creditsTip: "Mỗi bài viết sẽ sử dụng từ 1-3 tín dụng tùy thuộc vào độ dài bạn chọn."
      },
      articles: {
        welcomeTitle: "Bài viết của bạn",
        welcomeTip: "Đây là nơi bạn có thể quản lý tất cả bài viết đã tạo.",
        publishTitle: "Xuất bản bài viết",
        publishTip: "Bạn có thể xuất bản bài viết lên WordPress hoặc mạng xã hội sau khi đã kết nối tài khoản."
      },
      connections: {
        welcomeTitle: "Kết nối tài khoản",
        welcomeTip: "Kết nối WordPress và các mạng xã hội để xuất bản bài viết trực tiếp.",
        wordpressTitle: "WordPress",
        wordpressTip: "Để kết nối WordPress, bạn cần URL trang web, tên người dùng và Application Password."
      },
      credits: {
        welcomeTitle: "Quản lý tín dụng",
        welcomeTip: "Mua thêm tín dụng để tiếp tục tạo nội dung chất lượng cao.",
        usageTitle: "Sử dụng tín dụng",
        usageTip: "Tín dụng được sử dụng khi tạo nội dung mới và không có thời hạn sử dụng."
      },
      plans: {
        welcomeTitle: "Gói đăng ký",
        welcomeTip: "Nâng cấp lên gói cao hơn để nhận nhiều tín dụng và dung lượng lưu trữ hơn.",
        featuresTitle: "Tính năng",
        featuresTip: "Các gói cao cấp bao gồm thêm tính năng như hỗ trợ ưu tiên và nhiều kết nối hơn."
      },
      general: {
        welcomeTitle: "Xin chào!",
        welcomeTip: "Tôi là trợ lý AI của bạn. Tôi sẽ giúp bạn sử dụng hệ thống này hiệu quả nhất."
      },
      loadingMessages: {
        starting: "Đang khởi động...",
        thinking: "Đang suy nghĩ...",
        processing: "Đang xử lý yêu cầu của bạn...",
        almostDone: "Sắp xong rồi...",
        finishing: "Đang hoàn thiện...",
        generatingIdeas: "Đang tạo ý tưởng...",
        writingContent: "Đang viết nội dung...",
        optimizingSEO: "Đang tối ưu SEO...",
        checkingGrammar: "Đang kiểm tra ngữ pháp...",
        finalizingArticle: "Đang hoàn thiện bài viết..."
      }
    },
    
    // Admin
    admin: {
      users: {
        title: "Quản lý người dùng",
        description: "Xem và quản lý tất cả người dùng trong hệ thống",
        allUsers: "Tất cả người dùng",
        totalCount: "Tổng số",
        users: "người dùng",
        username: "Tên đăng nhập",
        email: "Email",
        fullName: "Họ và tên",
        role: "Vai trò",
        status: "Trạng thái",
        joinDate: "Ngày tham gia",
        password: "Mật khẩu",
        passwordDescription: "Mật khẩu phải có ít nhất 6 ký tự",
        selectRole: "Chọn vai trò",
        selectStatus: "Chọn trạng thái",
        roleUser: "Người dùng",
        roleAdmin: "Quản trị viên",
        statusActive: "Đang hoạt động",
        statusInactive: "Không hoạt động",
        statusSuspended: "Đã bị khóa",
        viewDetails: "Xem chi tiết",
        edit: "Chỉnh sửa",
        addCredits: "Thêm credits",
        delete: "Xóa",
        noUsers: "Không tìm thấy người dùng nào",
        viewUser: "Chi tiết người dùng",
        viewUserDescription: "Thông tin chi tiết của người dùng",
        editUser: "Chỉnh sửa người dùng",
        editUserDescription: "Cập nhật thông tin người dùng",
        deleteUser: "Xóa người dùng",
        deleteUserDescription: "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.",
        activity: "Hoạt động gần đây",
        suspend: "Khóa tài khoản"
      },
      common: {
        actions: "Thao tác",
        openMenu: "Mở menu",
        edit: "Chỉnh sửa"
      }
    }
  },

  // Navigation
  nav: {
    features: "Tính năng",
    pricing: "Bảng giá",
    faq: "FAQ",
    contact: "Liên hệ",
    login: "Đăng nhập",
    register: "Đăng ký",
    dashboard: "Bảng điều khiển",
    logout: "Đăng xuất"
  },

  // Landing page
  landing: {
    hero: {
      title: "Tạo bài viết chuẩn SEO tự động với AI",
      subtitle: "Dịch vụ tạo nội dung chất lượng cao, tối ưu SEO cho website và mạng xã hội của bạn chỉ trong vài phút.",
      tryFree: "Dùng thử miễn phí",
      viewDemo: "Xem demo"
    }
  },

  // Dashboard
  dashboard: {
    title: "Bảng điều khiển",
    welcome: "Xin chào",
    stats: {
      credits: "Tín dụng",
      articles: "Bài viết",
      storage: "Dung lượng",
      usedOf: "sử dụng của",
      creditsLeft: "Tín dụng còn lại",
      articlesCreated: "Bài viết đã tạo",
      storageUsed: "Dung lượng đã dùng",
      recentArticles: "Bài viết gần đây",
      connections: "Kết nối",
      manageConnections: "Quản lý kết nối",
      buyMoreCredits: "Mua thêm tín dụng",
      articleTitle: "Tiêu đề bài viết",
      dateCreated: "Ngày tạo",
      status: "Trạng thái",
      keywords: "Từ khóa",
      actions: "Thao tác"
    },
    connections: {
      wordpress: {
        connected: "Đã kết nối"
      },
      social: {
        connected: "Đã kết nối"
      }
    },
    overview: "Tổng quan",
    createContent: "Tạo nội dung",
    myArticles: "Bài viết của tôi",
    creditsMenu: "Tín dụng",
    plansMenu: "Gói dịch vụ",
    connectionsMenu: "Kết nối",
    settingsMenu: "Cài đặt"
  }
};