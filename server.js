/*
* 小程序反馈邮件发送服务
* 使用nodemailer发送邮件
* 使用express提供API
* 使用cors解决跨域问题
* 使用express.json()解析JSON请求体
* 使用nodemailer发送邮件

1. First, create a new Node.js project for your API:
2. Create a package.json file:
3. Deploy this to a hosting service like Vercel or Railway (both have free tiers).
4. Once deployed, you'll get a URL like https://your-app.vercel.app. Then update your WeChat Mini Program code to use this URL:
*/


const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Create mail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.163.com",
  port: 465,
  secure: true,
  auth: {
    user: "wbei63@163.com", // your email
    pass: "FJiCB43fQxqxdEmr" // 163邮箱的授权码，不是登录密码
  }
});

app.post('/api/feedback', async (req, res) => {
  const { content, subject } = req.body;
  
  try {
    await transporter.sendMail({
      from: '"小程序反馈" <wbei63@163.com>',
      to: "wbei63@163.com",
      subject: subject,
      text: content
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 