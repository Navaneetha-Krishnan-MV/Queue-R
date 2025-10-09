const { sql } = require('../config/database');
const { hashPassword } = require('../utils/auth');

class DatabaseQueries {
  // ============ ADMIN AUTHENTICATION ============
  static async createAdmin(username, password) {
    const hashedPassword = await hashPassword(password);
    const [admin] = await sql`
      INSERT INTO admins (username, password_hash)
      VALUES (${username}, ${hashedPassword})
      RETURNING id, username, created_at
    `;
    return admin;
  }

  static async findAdminByUsername(username) {
    const [admin] = await sql`
      SELECT id, username, password_hash, created_at 
      FROM admins 
      WHERE username = ${username}
    `;
    return admin || null;
  }

  static async getAdminById(id) {
    const [admin] = await sql`
      SELECT id, username, created_at 
      FROM admins 
      WHERE id = ${id}
    `;
    return admin || null;
  }
  // ============ VENUES ============
  static async getAllVenues() {
    return await sql`
      SELECT 
        v.id,
        v.venue_name,
        v.is_active,
        v.created_at,
        COUNT(DISTINCT t.id) as teams_count,
        COUNT(DISTINCT CASE WHEN vq.is_active = true THEN vq.id END) as active_questions_count
      FROM venues v
      LEFT JOIN teams t ON t.venue_id = v.id
      LEFT JOIN venue_questions vq ON vq.venue_id = v.id
      GROUP BY v.id, v.venue_name, v.is_active, v.created_at
      ORDER BY v.venue_name
    `;
  }

  static async getVenueById(venueId) {
    const result = await sql`
      SELECT 
        v.id,
        v.venue_name,
        v.is_active,
        v.created_at,
        COUNT(DISTINCT t.id) as teams_count,
        COUNT(DISTINCT vq.id) as total_questions,
        COUNT(DISTINCT CASE WHEN vq.is_active = true THEN vq.id END) as active_questions_count
      FROM venues v
      LEFT JOIN teams t ON t.venue_id = v.id
      LEFT JOIN venue_questions vq ON vq.venue_id = v.id
      WHERE v.id = ${venueId}
      GROUP BY v.id, v.venue_name, v.is_active, v.created_at
    `;
    return result[0];
  }

  static async createVenues(venueNames) {
    const result = [];
    for (const name of venueNames) {
      const venue = await sql`
        INSERT INTO venues (venue_name) 
        VALUES (${name})
        ON CONFLICT (venue_name) DO UPDATE SET venue_name = EXCLUDED.venue_name
        RETURNING *
      `;
      result.push(venue[0]);
    }
    return result;
  }

  // ============ TEAMS ============
  static async createTeam(teamName, leaderName, email, venueId) {
    const result = await sql`
      INSERT INTO teams (team_name, leader_name, email, venue_id)
      VALUES (${teamName}, ${leaderName}, ${email}, ${venueId})
      RETURNING *
    `;
    return result[0];
  }

  static async getTeamById(teamId) {
    const result = await sql`
      SELECT 
        t.id,
        t.team_name,
        t.leader_name,
        t.email,
        t.venue_id,
        t.score,
        t.is_active,
        t.created_at,
        v.venue_name
      FROM teams t
      JOIN venues v ON v.id = t.venue_id
      WHERE t.id = ${teamId}
    `;
    return result[0];
  }

  static async checkTeamExists(teamName, email) {
    const result = await sql`
      SELECT * FROM teams
      WHERE team_name = ${teamName} OR email = ${email}
      LIMIT 1
    `;
    return result[0];
  }

  static async getVenueTeamsCount(venueId) {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM teams
      WHERE venue_id = ${venueId} AND is_active = true
    `;
    return parseInt(result[0].count);
  }

  static async updateTeamScore(teamId, pointsToAdd) {
    const result = await sql`
      UPDATE teams
      SET score = score + ${pointsToAdd}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${teamId}
      RETURNING *
    `;
    return result[0];
  }

  // ============ QUESTIONS ============
  static async createQuestions(questions) {
    const result = [];
    for (const q of questions) {
      const question = await sql`
        INSERT INTO questions (
          question_text, 
          option_a, 
          option_b, 
          option_c, 
          option_d, 
          correct_option, 
          base_points
        )
        VALUES (
          ${q.questionText}, 
          ${q.optionA}, 
          ${q.optionB}, 
          ${q.optionC}, 
          ${q.optionD}, 
          ${q.correctOption.toUpperCase()}, 
          ${q.basePoints || 20}
        )
        RETURNING *
      `;
      result.push(question[0]);
    }
    return result;
  }

  static async getAllQuestions() {
    return await sql`
      SELECT * FROM questions
      WHERE is_active = true
      ORDER BY id
    `;
  }

  static async deleteAllQuestions() {
    await sql`DELETE FROM attempts`;
    await sql`DELETE FROM venue_questions`;
    await sql`DELETE FROM questions`;
  }

  static async getQuestionById(questionId) {
    const result = await sql`
      SELECT * FROM questions
      WHERE id = ${questionId} AND is_active = true
    `;
    return result[0];
  }

  // ============ VENUE QUESTIONS ============
  static async createVenueQuestions(venueQuestionData) {
    const result = [];
    for (const vq of venueQuestionData) {
      const venueQuestion = await sql`
        INSERT INTO venue_questions (venue_id, question_id, is_active, qr_token)
        VALUES (${vq.venueId}, ${vq.questionId}, ${vq.isActive}, ${vq.qrToken})
        ON CONFLICT (venue_id, question_id) 
        DO UPDATE SET qr_token = EXCLUDED.qr_token
        RETURNING *
      `;
      result.push(venueQuestion[0]);
    }
    return result;
  }

  static async getVenueQuestion(venueId, questionId, token) {
    const result = await sql`
      SELECT 
        vq.id as vq_id,
        vq.venue_id,
        vq.question_id,
        vq.is_active,
        vq.is_answered,
        vq.answered_by,
        vq.answered_at,
        vq.qr_token,
        q.id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.base_points
      FROM venue_questions vq
      JOIN questions q ON q.id = vq.question_id
      WHERE vq.venue_id = ${venueId}
        AND vq.question_id = ${questionId}
        AND vq.qr_token = ${token}
    `;
    return result[0];
  }

  static async getVenueQuestions(venueId) {
    return await sql`
      SELECT 
        vq.id as vq_id,
        vq.venue_id,
        vq.question_id,
        vq.is_active,
        vq.is_answered,
        vq.qr_token,
        q.id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.base_points
      FROM venue_questions vq
      JOIN questions q ON q.id = vq.question_id
      WHERE vq.venue_id = ${venueId}
      ORDER BY q.id
    `;
  }

  static async expireVenueQuestion(venueId, questionId, teamId) {
    const result = await sql`
      UPDATE venue_questions
      SET 
        is_active = false,
        is_answered = true,
        answered_by = ${teamId},
        answered_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE venue_id = ${venueId} AND question_id = ${questionId}
      RETURNING *
    `;
    return result[0];
  }

  static async getAvailableVenueQuestions(venueId, teamId) {
    return await sql`
      SELECT 
        vq.id as vq_id,
        vq.venue_id,
        vq.question_id,
        vq.is_active,
        vq.qr_token,
        q.id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.base_points
      FROM venue_questions vq
      JOIN questions q ON q.id = vq.question_id
      WHERE vq.venue_id = ${venueId}
        AND vq.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM attempts a
          WHERE a.team_id = ${teamId}
            AND a.question_id = q.id
            AND a.venue_id = ${venueId}
        )
      ORDER BY q.id
    `;
  }

  // ============ ATTEMPTS ============
  static async createAttempt(teamId, questionId, venueId, chosenOption, isCorrect, timeTaken, pointsAwarded) {
    const result = await sql`
      INSERT INTO attempts (
        team_id, 
        question_id, 
        venue_id, 
        chosen_option, 
        is_correct, 
        time_taken, 
        points_awarded
      )
      VALUES (
        ${teamId}, 
        ${questionId}, 
        ${venueId}, 
        ${chosenOption}, 
        ${isCorrect}, 
        ${timeTaken}, 
        ${pointsAwarded}
      )
      RETURNING *
    `;
    return result[0];
  }

  static async checkTeamAttempt(teamId, questionId, venueId) {
    const result = await sql`
      SELECT * FROM attempts
      WHERE team_id = ${teamId}
        AND question_id = ${questionId}
        AND venue_id = ${venueId}
      LIMIT 1
    `;
    return result[0];
  }

  static async getTeamAttempts(teamId) {
    return await sql`
      SELECT 
        a.id,
        a.team_id,
        a.question_id,
        a.venue_id,
        a.chosen_option,
        a.is_correct,
        a.time_taken,
        a.points_awarded,
        a.submitted_at,
        q.question_text,
        q.correct_option
      FROM attempts a
      JOIN questions q ON q.id = a.question_id
      WHERE a.team_id = ${teamId}
      ORDER BY a.submitted_at DESC
    `;
  }

  // ============ LEADERBOARD ============
  static async getGlobalLeaderboard() {
    return await sql`
      SELECT 
        t.id as team_id,
        t.team_name,
        t.leader_name,
        t.score,
        t.created_at,
        v.id as venue_id,
        v.venue_name
      FROM teams t
      JOIN venues v ON v.id = t.venue_id
      WHERE t.is_active = true
      ORDER BY t.score DESC, t.created_at ASC
    `;
  }

  static async getVenueLeaderboard(venueId) {
    return await sql`
      SELECT 
        t.id as team_id,
        t.team_name,
        t.leader_name,
        t.score,
        t.created_at,
        COUNT(CASE WHEN a.is_correct = true THEN 1 END) as correct_answers
      FROM teams t
      LEFT JOIN attempts a ON a.team_id = t.id AND a.is_correct = true
      WHERE t.venue_id = ${venueId} AND t.is_active = true
      GROUP BY t.id, t.team_name, t.leader_name, t.score, t.created_at
      ORDER BY t.score DESC, t.created_at ASC
    `;
  }

  static async getLeaderboardStats() {
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM teams WHERE is_active = true) as total_teams,
        (SELECT COUNT(*) FROM attempts) as total_attempts,
        (SELECT COUNT(*) FROM attempts WHERE is_correct = true) as correct_attempts,
        (SELECT COUNT(*) FROM questions WHERE is_active = true) as total_questions
    `;
    return result[0];
  }

  // ============ ADMIN STATS ============
  static async getAdminStats() {
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM venues WHERE is_active = true) as total_venues,
        (SELECT COUNT(*) FROM teams WHERE is_active = true) as total_teams,
        (SELECT COUNT(*) FROM questions WHERE is_active = true) as total_questions,
        (SELECT COUNT(*) FROM attempts) as total_attempts,
        (SELECT COUNT(*) FROM attempts WHERE is_correct = true) as correct_attempts
    `;
    return result[0];
  }

  static async getVenueStats() {
    return await sql`
      SELECT 
        v.venue_name,
        COUNT(DISTINCT t.id) as teams_count,
        COUNT(DISTINCT CASE WHEN vq.is_answered = true THEN vq.id END) as expired_questions
      FROM venues v
      LEFT JOIN teams t ON t.venue_id = v.id AND t.is_active = true
      LEFT JOIN venue_questions vq ON vq.venue_id = v.id
      WHERE v.is_active = true
      GROUP BY v.id, v.venue_name
      ORDER BY v.venue_name
    `;
  }

  // ============ RESET ============
  static async resetEvent() {
    await sql`DELETE FROM attempts`;
    await sql`UPDATE teams SET score = 0, updated_at = CURRENT_TIMESTAMP WHERE is_active = true`;
    await sql`
      UPDATE venue_questions 
      SET 
        is_active = true, 
        is_answered = false, 
        answered_by = NULL, 
        answered_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    `;
  }
}

module.exports = DatabaseQueries;