const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const User = require("../models/user");

const { HttpError, ctrlWrapper } = require("../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: "starter",
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(201).json({
    token,
    user: {
      email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const updateUserSubscription = async (req, res) => {
  const { subscription } = req.body;

  if (!subscription) {
    throw HttpError(404, "missing field subscription");
  }
  if (!["starter", "pro", "business"].includes(subscription)) {
    throw HttpError(404, "invalid value");
  }

  const { userId } = req.params;
  const result = await User.findByIdAndUpdate(userId, req.body, { new: true });
  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalName } = req.file;
  const filename = `${_id}_${originalName}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  await Jimp.read(resultUpload)
    .then((img) => {
      return img.resize(250, 250).write(resultUpload);
    })
    .catch((err) => {
      console.error(err);
    });
  const avatarURL = path.join("avatars", originalName);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
