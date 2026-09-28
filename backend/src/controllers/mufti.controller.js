import { visualizeAnswer } from "../services/muftiService.js";

export function postMuftiVisualize(req, res) {
  const { answerText } = req.body;
  res.json(visualizeAnswer(answerText));
}
