class PointsCalculator {
    /**
     * Calculate points based on time taken
     * @param {number} basePoints - Base points for the question (default 20)
     * @param {number} timeTaken - Time taken in seconds (max 20)
     * @returns {number} - Points awarded
     */
    static calculatePoints(basePoints = 20, timeTaken = 0) {
      // Ensure timeTaken is within valid range
      if (timeTaken < 0) timeTaken = 0;
      if (timeTaken > 20) timeTaken = 20;
  
      // Formula: points = basePoints - timeTaken
      // Minimum 1 point if answered correctly
      const points = Math.max(1, basePoints - timeTaken);
      
      return points;
    }
  
    /**
     * Validate if time is within allowed limit
     * @param {number} timeTaken - Time taken in seconds
     * @returns {boolean}
     */
    static isTimeValid(timeTaken) {
      return timeTaken >= 0 && timeTaken <= 20;
    }
  }
  
  module.exports = PointsCalculator;