Page({
  data: {
    showFeedbackModal: false,
    description: ''
  },
  onLoad() {
  },
  onLoginTap() {
    wx.showToast({
      title: '登录功能开发中',
      icon: 'none'
    })
  },
  onFavoritesTap() {
    this.setData({
      showFeedbackModal: true
    });
  },
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
  },
  onCancelFeedback() {
    this.setData({
      showFeedbackModal: false,
      description: ''
    });
  },
  onSubmitFeedback() {
    const { description } = this.data;
    
    if (!description.trim()) {
      wx.showToast({
        title: '请输入反馈描述',
        icon: 'none'
      });
      return;
    }

    // Show loading toast
    wx.showLoading({
      title: '提交中...',
    });

    // Prepare email content
    const feedbackData = {
      to: 'wbei63@163.com',
      from: 'miniprogram-feedback@system.com', // Using a default system email
      subject: '小程序用户反馈',
      content: description
    };

    // Send feedback data to your backend API
    wx.request({
      url: 'https://your-app.vercel.app/api/feedback', // Your deployed API URL
      method: 'POST',
      data: feedbackData,
      success: (res) => {
        wx.hideLoading();
        
        // Close modal and clear inputs
        this.setData({
          showFeedbackModal: false,
          description: ''
        });

        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        });
        console.error('Failed to send feedback:', error);
      }
    });
  }
}) 