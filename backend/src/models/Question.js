const { sql } = require('../config/database');

class Question {
  static async createTable() {
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL UNIQUE,
        question_text TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        points INTEGER NOT NULL,
        qr_token TEXT NOT NULL UNIQUE,
        is_answered BOOLEAN NOT NULL DEFAULT FALSE,
        answered_by INTEGER,
        answered_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  static async create(questionData) {
    const { questionId, questionText, correctAnswer, points, qrToken } = questionData;
    const result = await sql`
      INSERT INTO questions (question_id, question_text, correct_answer, points, qr_token)
      VALUES (${questionId}, ${questionText}, ${correctAnswer}, ${points}, ${qrToken})
      RETURNING *
    `;
    return result[0];
  }

  static async findById(id) {
    const result = await sql`
      SELECT * FROM questions WHERE id = ${id} LIMIT 1
    `;
    return result[0] || null;
  }

  static async findByQuestionId(questionId) {
    const result = await sql`
      SELECT * FROM questions WHERE question_id = ${questionId} LIMIT 1
    `;
    return result[0] || null;
  }

  static async findByQrToken(qrToken) {
    const result = await sql`
      SELECT * FROM questions WHERE qr_token = ${qrToken} LIMIT 1
    `;
    return result[0] || null;
  }

  static async update(id, updateData) {
    const { questionText, correctAnswer, points, isAnswered, answeredBy, answeredAt, isActive } = updateData;
    const result = await sql`
      UPDATE questions
      SET 
        question_text = COALESCE(${questionText}, question_text),
        correct_answer = COALESCE(${correctAnswer}, correct_answer),
        points = COALESCE(${points}, points),
        is_answered = COALESCE(${isAnswered}, is_answered),
        answered_by = COALESCE(${answeredBy}, answered_by),
        answered_at = COALESCE(${answeredAt}, answered_at),
        is_active = COALESCE(${isActive}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  }

  static async delete(id) {
    const result = await sql`
      DELETE FROM questions WHERE id = ${id} RETURNING *
    `;
    return result[0] || null;
  }
}

// Initialize the table when this module is imported
Question.createTable().catch(console.error);

module.exports = Question;