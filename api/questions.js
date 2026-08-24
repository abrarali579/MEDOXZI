module.exports = async function questions(req, res) {
  const mod = await import("../14-MVP-HTML/api/questions.js");
  return mod.default(req, res);
};
