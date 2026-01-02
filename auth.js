const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------------------------------------------------
// مرحله ۱: بررسی وضعیت کاربر (چک کردن شماره موبایل)
// ---------------------------------------------------------
router.post('/check-mobile', async (req, res) => {
    try {
        const user = await User.findOne({ mobile: req.body.mobile });
        if (user) {
            // کاربر وجود دارد -> باید لاگین کند
            res.status(200).json({ exists: true, message: "کاربر یافت شد. لطفاً وارد شوید." });
        } else {
            // کاربر جدید است -> باید ثبت‌نام کند
            res.status(200).json({ exists: false, message: "کاربر جدید. لطفاً ثبت‌نام کنید." });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// ---------------------------------------------------------
// مرحله ۲: ثبت‌نام نهایی (کاربر جدید)
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        // دوباره چک می‌کنیم که تکراری نباشد
        const oldUser = await User.findOne({ mobile: req.body.mobile });
        if (oldUser) return res.status(400).json("این شماره قبلاً ثبت شده است.");

        // هش کردن رمز عبور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            fullname: req.body.fullname,
            mobile: req.body.mobile,
            password: hashedPassword,
        });

        const user = await newUser.save();
        
        // بلافاصله توکن ورود هم می‌سازیم که کاربر مستقیم وارد شود
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });

    } catch (err) {
        res.status(500).json(err);
    }
});

// ---------------------------------------------------------
// مرحله ۳: ورود (کاربر قدیمی)
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ mobile: req.body.mobile });
        if (!user) return res.status(404).json("کاربر یافت نشد.");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("رمز عبور اشتباه است.");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;