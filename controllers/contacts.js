const Contact = require("../models/contact");

const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;

  const skip = (page - 1) * limit;
  if (favorite && !["false", "true"].includes(favorite)) {
    throw HttpError(404, "Invalid filter falue");
  }
  const paramsObject = favorite ? { owner, favorite } : { owner };

  res.json(await Contact.find(paramsObject, "", { skip, limit }));
};

const getById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findById({ _id: contactId, owner });
  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;

  const result = await Contact.create({ ...req.body, owner });

  res.status(201).json(result);
};

const deleteById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findByIdAndDelete({ _id: contactId, owner });

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const updateById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findByIdAndUpdate(
    { _id: contactId, owner },
    req.body,
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { favorite } = req.body;

  if (!`${favorite}`) {
    throw HttpError(404, "missing field favorite");
  }

  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findByIdAndUpdate(
    { _id: contactId, owner },
    req.body,
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
